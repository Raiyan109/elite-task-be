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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// ========================
// SIGNUP CONTROLLER
// ========================
const signup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.signupService(req.body);
    console.log("req.body", req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "User created successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
}));
// ========================
// LOGIN CONTROLLER
// ========================
const login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.UserServices.loginService(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User logged in successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log("Update User Controller", req.body, user_id);
    // user profile image upload
    let user_profile;
    let user_profile_key;
    // if (req.files && 'user_profile' in req.files) {
    //     const userImage = req.files['user_profile'][0];
    //     const user_profile_upload = await FileUploadHelper.uploadToSpaces(userImage)
    //     user_profile = user_profile_upload.Location;
    //     user_profile_key = user_profile_upload.Key;
    // }
    const userData = Object.assign(Object.assign({}, req.body), { user_profile,
        user_profile_key });
    const result = yield user_service_1.UserServices.updateUserServices(user_id, userData);
    // if (req.body?.user_profile_key) {
    //     await FileUploadHelper.deleteFromSpaces(req.body.user_profile_key)
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User updated successfully',
        data: result,
    });
}));
const forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_phone } = req.body;
    const result = yield user_service_1.UserServices.forgotPasswordServices(user_phone);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
    }
    // const { otp_code } = result;
    const userData = {
        user_phone,
        // otp_code,
    };
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Please check your phone number, we send a OTP!',
        data: userData,
    });
}));
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_phone, new_password, confirm_password } = req.body;
    const result = yield user_service_1.UserServices.resetPasswordServices(user_phone, new_password, confirm_password);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Password reset successfully',
        data: result,
    });
}));
const changePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const passwordData = __rest(req.body, []);
    yield user_service_1.UserServices.changePasswordServices(user, passwordData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Password changed successfully',
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // console.log(req.user);
    const result = yield user_service_1.UserServices.getUserByIdServices((user === null || user === void 0 ? void 0 : user.user_phone) ? user === null || user === void 0 ? void 0 : user.user_phone : user === null || user === void 0 ? void 0 : user.user_email);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Logged-In User retrieved successfully',
        data: result,
    });
}));
const getAllDashboardUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.query;
    const users = yield user_service_1.UserServices.getAllDashboardUsersService(searchTerm);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard users fetched successfully",
        data: users,
    });
}));
exports.UserControllers = {
    signup,
    login,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    getUserById,
    getAllDashboardUsers
};
