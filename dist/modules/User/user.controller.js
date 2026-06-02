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
const console_1 = require("console");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendPhoneOtp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_phone } = req.body;
    const { user_phone: phone, user_phone_is_verified, otp_code, otp_expires_at } = yield user_service_1.UserServices.sendPhoneOtpService(user_phone);
    const userData = {
        user_phone: phone,
        user_phone_is_verified,
        otp_code,
        otp_expires_at
    };
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "OTP sent successfully",
        data: userData,
    });
}));
// Verify phone OTP
// const verifyPhoneOtp = catchAsync(async (req, res) => {
//     const user = await UserServices.verifyPhoneOtpServices(req.body);
//     res.status(httpStatus.OK).json({
//         success: true,
//         message: "Phone OTP verified successfully",
//         data: user,
//     });
// });
// Login
const login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginData = __rest(req.body, []);
    const { user, accessToken, newUser } = yield user_service_1.UserServices.loginServices(loginData);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User logged in successfully",
        data: user || newUser,
        accessToken: accessToken,
    });
}));
// const socialLogin = catchAsync(async (req, res) => {
//     const { ...loginData } = req.body;
//     const result = await UserServices.socialLoginServices(loginData);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'User login successfully',
//         data: result,
//     });
// });
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log("Update User Controller", req.body, user_id);
    // user profile image upload
    let user_profile;
    let user_profile_key;
    if (req.files && 'user_profile' in req.files) {
        const userImage = req.files['user_profile'][0];
        const user_profile_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(userImage);
        user_profile = user_profile_upload.Location;
        user_profile_key = user_profile_upload.Key;
    }
    const userData = Object.assign(Object.assign({}, req.body), { user_profile,
        user_profile_key });
    const result = yield user_service_1.UserServices.updateUserServices(user_id, userData);
    if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.user_profile_key) {
        yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(req.body.user_profile_key);
    }
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
    const { otp_code } = result;
    const userData = {
        user_phone,
        otp_code,
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
    (0, console_1.log)("Change Password Controller", passwordData, user);
    yield user_service_1.UserServices.changePasswordServices(user, passwordData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Password changed successfully',
    });
}));
const deleteUserOwnAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { delete_confirmation } = req.body;
    yield user_service_1.UserServices.deleteUserOwnAccountServices(userId, delete_confirmation);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Account scheduled for deletion in 30 days.',
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
exports.UserControllers = {
    sendPhoneOtp,
    login,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteUserOwnAccount,
    getUserById
};
