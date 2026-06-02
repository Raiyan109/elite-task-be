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
const sendPhoneOTP_1 = require("../../middlewares/sendPhoneOTP");
// Send phone otp
const sendPhoneOtpService = (user_phone) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_model_1.default.findOne({ user_phone });
    // if (existingUser && existingUser.user_phone_is_verified) {
    //     throw new Error("Phone number already registered");
    // }
    const otp_code = '1234';
    // const otp_code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    if (existingUser) {
        existingUser.otp_code = Number(otp_code);
        existingUser.otp_expires_at = otp_expires_at;
        (0, sendPhoneOTP_1.SendPhoneOTP)(otp_code, user_phone);
        yield existingUser.save();
        return existingUser;
    }
    const user = yield user_model_1.default.create({
        user_phone,
        otp_code,
        otp_expires_at,
        user_status: 'in-active',
        login_type: 'phone',
        user_phone_is_verified: false,
        role: 'user',
    });
    return user;
});
// Login user with phone number and OTP
const loginServices = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_phone, otp_code, otp_expires_at, user_password, user_email, login_type, social_id, device_id, role, google_id } = payload;
    if (user_phone && otp_code) {
        // Validate both phone and OTP are provided
        if (!user_phone || !otp_code) {
            throw new Error("Both phone number and OTP are required");
        }
        const user = yield user_model_1.default.findOne({ user_phone, otp_code });
        if (!user) {
            throw new Error("Invalid OTP or phone number");
        }
        user.user_phone_is_verified = true;
        user.user_status = 'active';
        user.otp_code = undefined;
        user.otp_expires_at = undefined;
        yield user.save();
        //create token
        const accessToken = (0, createToken_1.createToken)({
            _id: user._id,
            user_phone: user.user_phone,
            role: user.role,
        }, config_1.default.jwt_access_secret);
        return { accessToken, user: user };
    }
    if (google_id && user_email) {
        let user = (yield user_model_1.default.findOne({ google_id })) || (yield user_model_1.default.findOne({ user_email }));
        if (!user) {
            user = yield user_model_1.default.create({
                user_email,
                // user_name,
                // user_profile,
                google_id,
                user_status: 'active',
                user_phone_is_verified: false,
            });
        }
        else {
            user.google_id = google_id;
            // user.user_name = user_name || user.user_name;
            // user.user_profile = user_profile || user.user_profile;
            yield user.save();
        }
        const accessToken = (0, createToken_1.createToken)({ _id: user._id, user_email: user.user_email, user_phone: user_phone, role: user.role }, config_1.default.jwt_access_secret);
        return { accessToken, user };
    }
    // Facebook login
    // if (facebook_id && user_email) {
    //     let user = await userModel.findOne({ facebook_id }) || await userModel.findOne({ user_email });
    //     if (!user) {
    //       user = await userModel.create({
    //         user_email,
    //         user_name,
    //         user_profile,
    //         facebook_id,
    //         user_status: 'active',
    //         user_phone_is_verified: false,
    //       });
    //     } else {
    //       user.facebook_id = facebook_id;
    //       user.user_name = user_name || user.user_name;
    //       user.user_profile = user_profile || user.user_profile;
    //       await user.save();
    //     }
    //     const accessToken = createToken(
    //       { _id: user._id, user_email: user.user_email, role: user.role },
    //       config.jwt_access_secret,
    //       '7d'
    //     );
    //     return { accessToken, user };
    //   }
    throw new Error("Invalid login request");
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
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    if (existingUser) {
        existingUser.otp_code = Number(otp_code);
        existingUser.otp_expires_at = otp_expires_at;
        (0, sendPhoneOTP_1.SendPhoneOTP)(otp_code, user_phone);
        yield existingUser.save();
        return existingUser;
    }
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
    existingUser.user_password = yield (0, hashHelper_1.hashPassword)(new_password);
    existingUser.otp_code = undefined;
    existingUser.otp_expires_at = undefined;
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
// User delete own account
const deleteUserOwnAccountServices = (userId, delete_confirmation) => __awaiter(void 0, void 0, void 0, function* () {
    if (delete_confirmation !== "DELETE") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please provide 'delete' to confirm account deletion.");
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    user.scheduledForDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    yield user.save();
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
exports.UserServices = {
    loginServices,
    sendPhoneOtpService,
    updateUserServices,
    forgotPasswordServices,
    resetPasswordServices,
    changePasswordServices,
    deleteUserOwnAccountServices,
    getUserByIdServices
};
