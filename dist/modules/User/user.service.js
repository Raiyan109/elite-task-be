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
exports.UserServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const user_model_1 = __importDefault(require("./user.model"));
const hashHelper_1 = require("../../helpers/hashHelper");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createToken_1 = require("../../utils/createToken");
const config_1 = __importDefault(require("../../config"));
const role_model_1 = require("../Role/role.model");
// ========================
// SIGNUP
// ========================
const signupService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_email, user_name, user_password } = payload;
    const existingUser = yield user_model_1.default.findOne({
        $or: [{ user_email }, { user_name }],
    });
    if (existingUser) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "Email or username already exists");
    }
    const hashedPassword = yield (0, hashHelper_1.hashPassword)(user_password);
    // 👇 default role
    const defaultRole = yield role_model_1.RoleModel.findOne({ name: "team_member" });
    if (!defaultRole) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Default role not found");
    }
    const user = yield user_model_1.default.create({
        user_email,
        user_name,
        user_password: hashedPassword,
        user_status: "active",
        roleId: defaultRole._id,
    });
    // const accessToken = createToken(
    //   {
    //     _id: user._id,
    //     user_email: user.user_email,
    //     roleId: user.roleId as ObjectId | IRole | undefined,
    //   },
    //   config.jwt_access_secret as string
    // );
    const accessToken = (0, createToken_1.createToken)({
        _id: String(user._id),
        user_email: user.user_email,
        roleId: defaultRole._id.toString(), // ✅ FIX HERE
    }, config_1.default.jwt_access_secret);
    return { user, accessToken };
});
// ========================
// LOGIN
// ========================
const loginService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_email, user_name, user_password } = payload;
    const user = yield user_model_1.default.findOne({
        $or: [{ user_email }, { user_name }],
    }).select("+user_password");
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const isPasswordValid = yield (0, hashHelper_1.comparePassword)(user_password, user.user_password);
    if (!isPasswordValid) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    // const accessToken = createToken(
    //   {
    //     _id: user._id,
    //     user_email: user.user_email,
    //     roleId: user.roleId as ObjectId | IRole | undefined,
    //   },
    //   config.jwt_access_secret as string
    // );
    const accessToken = (0, createToken_1.createToken)({
        _id: String(user._id),
        user_email: user.user_email,
        roleId: user.roleId.toString(), // ✅ FIX HERE
    }, config_1.default.jwt_access_secret);
    return { user, accessToken };
});
const updateUserServices = (_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield user_model_1.default.findById(_id);
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // If the user wants to update the password, hash it
    if (payload.user_password) {
        payload.user_password = yield (0, hashHelper_1.hashPassword)(payload.user_password);
    }
    const result = yield user_model_1.default.findByIdAndUpdate(_id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Forgot password
const forgotPasswordServices = (user_phone) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.default.findOne({ user_phone });
    console.log("Existing User", existingUser);
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User doesn't exist!");
    }
    // if (existingUser && existingUser.user_phone_is_verified) {
    //     throw new Error("Phone number already registered");
    // }
    const otp_code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    // const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    // if (existingUser) {
    //   existingUser.otp_code = Number(otp_code);
    //   existingUser.otp_expires_at = otp_expires_at;
    //   SendPhoneOTP(otp_code, user_phone);
    //   await existingUser.save();
    //   return existingUser;
    // }
    const result = yield user_model_1.default.findByIdAndUpdate({ user_phone }, {
        $set: {
            otp_code: Number(otp_code),
        }
    });
    return result;
});
// Reset password
const resetPasswordServices = (user_phone, new_password, confirm_password) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.default.findOne({ user_phone });
    if (!existingUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid phone number");
    }
    //check password
    if (new_password !== confirm_password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    // if (existingUser.otp_expires_at && existingUser.otp_expires_at < new Date()) {
    //   throw new AppError(httpStatus.BAD_REQUEST, "OTP expired");
    // }
    // Update user password and clear OTP
    // existingUser.user_password = await hashPassword(new_password);
    // existingUser.otp_code = undefined;
    // existingUser.otp_expires_at = undefined;
    yield existingUser.save();
    return existingUser;
});
// Change password
const changePasswordServices = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { current_password, new_password, confirm_password } = payload;
    const isExistUser = yield user_model_1.default.findById(user._id).select('+password');
    if (!isExistUser) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User doesn't exist!");
    }
    //check match password
    if (current_password &&
        !(yield (0, hashHelper_1.comparePassword)(current_password, isExistUser.user_password))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is incorrect!');
    }
    //newPassword and current password
    if (current_password === new_password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please give different password from current password');
    }
    //check password
    if (new_password !== confirm_password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "New password and Confirm password doesn't match!");
    }
    const updateData = {
        user_password: yield (0, hashHelper_1.hashPassword)(new_password),
    };
    const result = yield user_model_1.default.findOneAndUpdate({ _id: user._id }, updateData, { new: true });
    return result;
});
// logged in User info
const getUserByIdServices = (user_phone_or_email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.default.findOne({
        $or: [
            { user_phone: user_phone_or_email },
            { user_email: user_phone_or_email }
        ]
    });
    // .select('-user_password -otp_code -otp_expires_at -scheduledForDeletionAt');
    return result;
});
const getAllDashboardUsersService = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    let query = {};
    if (searchTerm) {
        const regex = new RegExp(searchTerm, "i"); // case-insensitive search
        query = {
            $or: [
                { user_name: regex },
                // { user_email: regex },
                // { user_phone: regex },
                // { user_city: regex },
                // { user_country: regex },
                // { user_current_job: regex },
            ],
        };
    }
    const result = yield user_model_1.default.find(query)
        .sort({ createdAt: -1 }) // Sort by recent
        .select('user_name user_phone user_email notification_id');
    return result;
});
exports.UserServices = {
    signupService,
    loginService,
    updateUserServices,
    forgotPasswordServices,
    resetPasswordServices,
    changePasswordServices,
    getUserByIdServices,
    getAllDashboardUsersService
};
