"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminPermission = exports.auth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = __importDefault(require("../modules/User/user.model"));
const role_model_1 = require("../modules/Role/role.model");
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
// export const auth = (...requiredRole: TUserRole[]) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
//       if (!token) {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           success: false,
//           statusCode: 401,
//           message: 'You have no access to this route',
//         });
//         return;
//       }
//       const decoded = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//       const { role, user_phone, _id } = decoded;
//       let userData;
//       if (role === 'user') {
//         userData = await userModel.findOne({
//           _id,
//           $or: [
//             { user_phone: user_phone ?? null },
//             { user_email: decoded.user_email ?? null },
//           ],
//         });
//       }
//       // if (role === 'admin') {
//       //   userData = await AdminModel.findOne({ admin_phone });
//       // }
//       if (role !== 'user') {
//         // userData = await AdminModel.findOne({ admin_phone }).populate('admin_role_id');
//       }
//       if (!userData) {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           success: false,
//           statusCode: 401,
//           message: 'You have no access to this route',
//         });
//         return;
//       }
//       if (requiredRole && !requiredRole.includes(role)) {
//         res.status(httpStatus.UNAUTHORIZED).json({
//           success: false,
//           statusCode: 401,
//           message: 'You have no access to this route',
//         });
//         return;
//       }
//       // req.user = decoded;
//       req.user = {
//         ...decoded,
//         _id: userData._id,
//         // permissions: role !== 'user' ? (userData as IAdminInterface).admin_role_id : null
//       };
//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };
const auth = (...requiredRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token);
            if (!token) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    message: "No token provided",
                });
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
            // ✅ STEP 1: get user from DB
            const user = yield user_model_1.default.findById(decoded._id);
            if (!user) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    message: "User not found",
                });
            }
            // ✅ STEP 2: get role with permissions
            const role = yield role_model_1.RoleModel.findById(user === null || user === void 0 ? void 0 : user.roleId);
            if (!role) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    message: "Role not found",
                });
            }
            // ❌ OPTIONAL: keep role name check (simple RBAC)
            if (requiredRoles.length > 0 && (role === null || role === void 0 ? void 0 : role.name) && !requiredRoles.includes(role.name)) {
                res.status(http_status_1.default.FORBIDDEN).json({
                    success: false,
                    message: "You have no access to this route",
                });
            }
            // ✅ ATTACH FULL USER CONTEXT
            req.user = Object.assign(Object.assign({}, ((user === null || user === void 0 ? void 0 : user.toObject()) || {})), { role: role === null || role === void 0 ? void 0 : role.name, permissions: role === null || role === void 0 ? void 0 : role.permissions });
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.auth = auth;
// Middleware to check specific admin permissions
const checkAdminPermission = (requiredPermission) => {
    return (req, res, next) => {
        var _a, _b;
        try {
            // For non-admin routes, just proceed
            // if (req.user?.role === 'user') {
            //   next();
            //   return;
            // }
            // if (!req.user.roleId) {
            //   return res.status(403).json({ message: "Role not assigned" });
            // }
            const permissions = ((_b = (_a = req.user.permissions) === null || _a === void 0 ? void 0 : _a.toObject) === null || _b === void 0 ? void 0 : _b.call(_a)) || req.user.permissions || {};
            // console.log(permissions, 'permissions');
            // console.log(permissions[requiredPermission], 'permissions[requiredPermission]');
            // console.log(requiredPermission, 'requiredPermission');
            // console.log('Required permission:', requiredPermission);
            // console.log('Available permissions:', Object.keys(permissions || {}));
            if (!permissions || permissions[requiredPermission] !== true) {
                res.status(http_status_1.default.FORBIDDEN).json({
                    success: false,
                    statusCode: 403,
                    message: 'You do not have permission to access this resource',
                });
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.checkAdminPermission = checkAdminPermission;
