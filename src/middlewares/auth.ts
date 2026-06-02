import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/User/user.interface';
import userModel from '../modules/User/user.model';
import { AdminPermissions } from '../modules/Role/role.constants';


// export const auth = (...requiredRole: TUserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];

//         if (!token) {
//             return res.status(httpStatus.UNAUTHORIZED).json({
//                 success: false,
//                 statusCode: 401,
//                 message: 'You have no access to this route',
//             });
//         }

//         const decoded = jwt.verify(
//             token,
//             config.jwt_access_secret as string,
//         ) as JwtPayload;

//         const { role, user_email, user_phone, admin_phone } = decoded;
//         console.log(decoded, 'decoded');

//         let userData;
//         if (role === 'user') {
//             userData = await userModel.findOne({ user_email, user_phone });
//         }

//         if (role === 'admin') {
//             userData = await AdminModel.findOne({ admin_phone });
//         }

//         if (!userData) {
//             return res.status(httpStatus.UNAUTHORIZED).json({
//                 success: false,
//                 statusCode: 401,
//                 message: 'You have no access to this route',
//             });
//         }

//         if (requiredRole && !requiredRole.includes(role)) {
//             return res.status(httpStatus.UNAUTHORIZED).json({
//                 success: false,
//                 statusCode: 401,
//                 message: 'You have no access to this route',
//             });
//         }

//         req.user = decoded as JwtPayload;
//         next();
//     } catch (error) {
//         next(error);
//     }

// };


export const auth = (...requiredRole: TUserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
      if (!token) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          statusCode: 401,
          message: 'You have no access to this route',
        });
        return;
      }

      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      const { role, user_phone,  _id } = decoded;

      let userData;
      if (role === 'user') {
        userData = await userModel.findOne({
          _id,
          $or: [
            { user_phone: user_phone ?? null },
            { user_email: decoded.user_email ?? null },
          ],
        });
      }

      // if (role === 'admin') {
      //   userData = await AdminModel.findOne({ admin_phone });
      // }
      if (role !== 'user') {
        // userData = await AdminModel.findOne({ admin_phone }).populate('admin_role_id');
      }

      if (!userData) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          statusCode: 401,
          message: 'You have no access to this route',
        });
        return;
      }

      if (requiredRole && !requiredRole.includes(role)) {
        res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          statusCode: 401,
          message: 'You have no access to this route',
        });
        return;
      }

      // req.user = decoded;
      req.user = {
        ...decoded,
        _id: userData._id,
        // permissions: role !== 'user' ? (userData as IAdminInterface).admin_role_id : null
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check specific admin permissions
export const checkAdminPermission = (requiredPermission: AdminPermissions): RequestHandler => {
  return (req, res, next) => {
    try {
      // For non-admin routes, just proceed
      if (req.user?.role === 'user') {
        next();
        return;
      }

      const permissions = req.user.permissions?.toObject?.() || req.user.permissions || {};

      // console.log(permissions, 'permissions');
      // console.log(permissions[requiredPermission], 'permissions[requiredPermission]');
      // console.log(requiredPermission, 'requiredPermission');
      // console.log('Required permission:', requiredPermission);
      // console.log('Available permissions:', Object.keys(permissions || {}));


      if (!permissions || permissions[requiredPermission] !== true) {
        res.status(httpStatus.FORBIDDEN).json({
          success: false,
          statusCode: 403,
          message: 'You do not have permission to access this resource',
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
