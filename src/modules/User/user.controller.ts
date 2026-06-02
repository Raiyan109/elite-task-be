import { log } from "console";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const sendPhoneOtp = catchAsync(async (req, res) => {
    const { user_phone } = req.body;

    const { user_phone: phone, user_phone_is_verified, otp_code, otp_expires_at } = await UserServices.sendPhoneOtpService(user_phone);

    const userData = {
        user_phone: phone,
        user_phone_is_verified,
        otp_code,
        otp_expires_at
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: "OTP sent successfully",
        data: userData,
    });
});


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
const login = catchAsync(async (req, res) => {
    const { ...loginData } = req.body;
    const { user, accessToken, newUser } = await UserServices.loginServices(loginData);

    res.status(httpStatus.OK).json({
        success: true,
        message: "User logged in successfully",
        data: user || newUser,
        accessToken: accessToken,
    });
});

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

const updateUser = catchAsync(async (req, res) => {
    const user_id = req.user?._id;
    console.log("Update User Controller", req.body, user_id);

    // user profile image upload
    let user_profile;
    let user_profile_key;

    if (req.files && 'user_profile' in req.files) {
        const userImage = req.files['user_profile'][0];
        const user_profile_upload = await FileUploadHelper.uploadToSpaces(userImage)

        user_profile = user_profile_upload.Location;
        user_profile_key = user_profile_upload.Key;
    }

    const userData = {
        ...req.body,
        user_profile,
        user_profile_key,
    };
    const result = await UserServices.updateUserServices(user_id, userData);

    if (req.body?.user_profile_key) {
        await FileUploadHelper.deleteFromSpaces(req.body.user_profile_key)
    }

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User updated successfully',
        data: result,
    });
});

const forgotPassword = catchAsync(async (req, res) => {
    const { user_phone } = req.body;
    const result = await UserServices.forgotPasswordServices(user_phone);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }
    const { otp_code } = result;

    const userData = {
        user_phone,
        otp_code,
    }


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Please check your phone number, we send a OTP!',
        data: userData,
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const { user_phone, new_password, confirm_password } = req.body
    const result = await UserServices.resetPasswordServices(user_phone, new_password, confirm_password);


    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password reset successfully',
        data: result,
    });
});

const changePassword = catchAsync(async (req, res) => {
    const user = req.user;
    const { ...passwordData } = req.body;
    log("Change Password Controller", passwordData, user);
    await UserServices.changePasswordServices(user, passwordData);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Password changed successfully',
    });
});

const deleteUserOwnAccount = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const { delete_confirmation } = req.body;
    await UserServices.deleteUserOwnAccountServices(userId, delete_confirmation);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Account scheduled for deletion in 30 days.',
    });
});

const getUserById = catchAsync(async (req, res) => {
    const user = req.user;
    // console.log(req.user);

    const result = await UserServices.getUserByIdServices(user?.user_phone ? user?.user_phone : user?.user_email);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Logged-In User retrieved successfully',
        data: result,
    });

});

const getAllDashboardUsers = catchAsync(
    async (req, res) => {

        const { searchTerm } = req.query;

        const users = await UserServices.getAllDashboardUsersService(searchTerm as string);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Dashboard users fetched successfully",
            data: users,
        });
    }
);

export const UserControllers = {
    sendPhoneOtp,
    login,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteUserOwnAccount,
    getUserById,
    getAllDashboardUsers
};  