import httpStatus from "http-status";
import userModel, { IUserDocument } from "./user.model";
import { comparePassword, hashPassword } from "../../helpers/hashHelper";
import AppError from "../../errors/AppError";
import { createToken } from "../../utils/createToken";
import config from "../../config";
import { emailTemplate } from "../../utils/emailTemplate";
import { emailHelper } from "../../helpers/emailHelper";
import { IUserInterface } from "./user.interface";
import { SendPhoneOTP } from "../../middlewares/sendPhoneOTP";
import { JwtPayload } from "jsonwebtoken";
import { IChangePassword } from "../../types/auth";
import { FilterQuery } from "mongoose";


// Send phone otp
const sendPhoneOtpService = async (user_phone: string) => {
  const existingUser = await userModel.findOne({ user_phone });

  // if (existingUser && existingUser.user_phone_is_verified) {
  //     throw new Error("Phone number already registered");
  // }

  const otp_code = '1234';
  // const otp_code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  if (existingUser) {
    existingUser.otp_code = Number(otp_code);
    existingUser.otp_expires_at = otp_expires_at;
    SendPhoneOTP(otp_code, user_phone);
    await existingUser.save();
    return existingUser;
  }

  const user = await userModel.create({
    user_phone,
    otp_code,
    otp_expires_at,
    user_status: 'in-active',
    login_type: 'phone',
    user_phone_is_verified: false,
    role: 'user',
  });

  return user;
}


// Login user with phone number and OTP
const loginServices = async (payload: IUserInterface): Promise<{
  accessToken?: string;
  user?: IUserDocument;
  newUser?: IUserDocument;
}> => {
  const { user_phone, otp_code, otp_expires_at, user_password, user_email, login_type, social_id, device_id, role, google_id } = payload;

  if (user_phone && otp_code) {
    // Validate both phone and OTP are provided
    if (!user_phone || !otp_code) {
      throw new Error("Both phone number and OTP are required");
    }

    const user = await userModel.findOne({ user_phone, otp_code });

    if (!user) {
      throw new Error("Invalid OTP or phone number");
    }

    user.user_phone_is_verified = true;
    user.user_status = 'active'
    user.otp_code = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    //create token
    const accessToken = createToken(
      {
        _id: user._id as string,
        user_phone: user.user_phone,
        role: user.role,
      },
      config.jwt_access_secret as string,
      // '7d'
    );

    return { accessToken, user: user };
  }

  if (google_id && user_email) {
    let user = await userModel.findOne({ google_id }) || await userModel.findOne({ user_email });

    if (!user) {
      user = await userModel.create({
        user_email,
        // user_name,
        // user_profile,
        google_id,
        user_status: 'active',
        user_phone_is_verified: false,
      });
    } else {
      user.google_id = google_id;
      // user.user_name = user_name || user.user_name;
      // user.user_profile = user_profile || user.user_profile;
      await user.save();
    }

    const accessToken = createToken(
      { _id: user._id as string, user_email: user.user_email, user_phone: user_phone, role: user.role },
      config.jwt_access_secret,
      // '7d'
    );
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
}

const updateUserServices = async (_id: string, payload: Partial<IUserInterface>) => {
  const userData = await userModel.findById(_id);
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  // If the user wants to update the password, hash it
  if (payload.user_password) {
    payload.user_password = await hashPassword(
      payload.user_password,
    );
  }

  const result = await userModel.findByIdAndUpdate(_id, payload, {
    new: true,
    runValidators: true,
  })

  return result;
}


// Forgot password
const forgotPasswordServices = async (user_phone: string) => {
  const existingUser = await userModel.findOne({ user_phone });
  console.log("Existing User", existingUser);

  if (!existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist!");
  }
  // if (existingUser && existingUser.user_phone_is_verified) {
  //     throw new Error("Phone number already registered");
  // }

  const otp_code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  if (existingUser) {
    existingUser.otp_code = Number(otp_code);
    existingUser.otp_expires_at = otp_expires_at;
    SendPhoneOTP(otp_code, user_phone);
    await existingUser.save();
    return existingUser;
  }

  const result = await userModel.findByIdAndUpdate({ user_phone }, {
    $set: {
      otp_code: Number(otp_code),
    }
  });

  return result;
}

// Reset password
const resetPasswordServices = async (user_phone: string, new_password: string, confirm_password: string) => {
  const existingUser = await userModel.findOne({ user_phone });

  if (!existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid phone number");
  }

  //check password
  if (new_password !== confirm_password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  // if (existingUser.otp_expires_at && existingUser.otp_expires_at < new Date()) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "OTP expired");
  // }

  // Update user password and clear OTP
  existingUser.user_password = await hashPassword(new_password);
  existingUser.otp_code = undefined;
  existingUser.otp_expires_at = undefined;
  await existingUser.save();
  return existingUser;
}

// Change password
const changePasswordServices = async (user: JwtPayload, payload: IChangePassword) => {
  const { current_password, new_password, confirm_password } = payload;
  const isExistUser = await userModel.findById(user._id).select('+password');
  if (!isExistUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User doesn't exist!");
  }

  //check match password
  if (
    current_password &&
    !(await comparePassword(current_password, isExistUser.user_password as string))
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password is incorrect!');
  }

  //newPassword and current password
  if (current_password === new_password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please give different password from current password'
    );
  }

  //check password
  if (new_password !== confirm_password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const updateData = {
    user_password: await hashPassword(new_password),
  };
  const result = await userModel.findOneAndUpdate({ _id: user._id }, updateData, { new: true });

  return result;
}

// User delete own account
const deleteUserOwnAccountServices = async (userId: string, delete_confirmation: string) => {
  if (delete_confirmation !== "DELETE") {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide 'delete' to confirm account deletion.");
  }
  const user = await userModel.findById(userId);

  if (!user) throw new AppError(
    httpStatus.NOT_FOUND,
    "User not found"
  );

  user.scheduledForDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  await user.save();
}

// logged in User info
const getUserByIdServices = async (user_phone_or_email: string) => {
  const result = await userModel.findOne({
    $or: [
      { user_phone: user_phone_or_email },
      { user_email: user_phone_or_email }
    ]
  })
  // .select('-user_password -otp_code -otp_expires_at -scheduledForDeletionAt');

  return result;
};


const getAllDashboardUsersService = async (searchTerm?: string) => {

  let query: FilterQuery<IUserInterface> = {};

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

  const result = await userModel.find(query)
    .sort({ createdAt: -1 }) // Sort by recent
    .select('user_name user_phone user_email notification_id')
  return result;
};


export const UserServices = {
  loginServices,
  sendPhoneOtpService,
  updateUserServices,
  forgotPasswordServices,
  resetPasswordServices,
  changePasswordServices,
  deleteUserOwnAccountServices,
  getUserByIdServices,
  getAllDashboardUsersService
};  