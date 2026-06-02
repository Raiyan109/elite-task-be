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
const admin_model_1 = __importDefault(require("../modules/Admin/admin.model"));
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
const auth = (...requiredRole) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token);
            if (!token) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    statusCode: 401,
                    message: 'You have no access to this route',
                });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
            const { role, user_phone, admin_phone, _id } = decoded;
            let userData;
            if (role === 'user') {
                userData = yield user_model_1.default.findOne({
                    _id,
                    $or: [
                        { user_phone: user_phone !== null && user_phone !== void 0 ? user_phone : null },
                        { user_email: (_c = decoded.user_email) !== null && _c !== void 0 ? _c : null },
                    ],
                });
            }
            // if (role === 'admin') {
            //   userData = await AdminModel.findOne({ admin_phone });
            // }
            if (role !== 'user') {
                userData = yield admin_model_1.default.findOne({ admin_phone }).populate('admin_role_id');
            }
            if (!userData) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    statusCode: 401,
                    message: 'You have no access to this route',
                });
                return;
            }
            if (requiredRole && !requiredRole.includes(role)) {
                res.status(http_status_1.default.UNAUTHORIZED).json({
                    success: false,
                    statusCode: 401,
                    message: 'You have no access to this route',
                });
                return;
            }
            // req.user = decoded;
            req.user = Object.assign(Object.assign({}, decoded), { _id: userData._id, permissions: role !== 'user' ? userData.admin_role_id : null });
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
        var _a, _b, _c;
        try {
            // For non-admin routes, just proceed
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'user') {
                next();
                return;
            }
            const permissions = ((_c = (_b = req.user.permissions) === null || _b === void 0 ? void 0 : _b.toObject) === null || _c === void 0 ? void 0 : _c.call(_b)) || req.user.permissions || {};
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
