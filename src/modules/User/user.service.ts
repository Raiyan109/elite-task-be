import httpStatus from "http-status";
import userModel from "./user.model";
import { comparePassword, hashPassword } from "../../helpers/hashHelper";
import AppError from "../../errors/AppError";
import { createToken } from "../../utils/createToken";
import config from "../../config";
import { IUserInterface } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { IChangePassword } from "../../types/auth";
import { FilterQuery } from "mongoose";
import { RoleModel } from "../Role/role.model";


// ========================
// SIGNUP
// ========================
const signupService = async (payload: IUserInterface) => {
  const { user_email, user_name, user_password } = payload;

  const existingUser = await userModel.findOne({
    $or: [{ user_email }, { user_name }],
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "Email or username already exists");
  }

  const hashedPassword = await hashPassword(user_password);

  // 👇 default role
  const defaultRole = await RoleModel.findOne({ name: "team_member" });

  if (!defaultRole) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Default role not found");
  }

  const user = await userModel.create({
    user_email,
    user_name,
    user_password: hashedPassword,
    user_status: "active",
    roleId: defaultRole._id,
  });

  const accessToken = createToken(
    {
      _id: user._id,
      user_email: user.user_email,
      roleId: user.roleId,
    },
    config.jwt_access_secret as string
  );

  return { user, accessToken };
};

// ========================
// LOGIN
// ========================
const loginService = async (payload: {
  user_email?: string;
  user_name?: string;
  user_password: string;
}) => {
  const { user_email, user_name, user_password } = payload;

  const user = await userModel.findOne({
    $or: [{ user_email }, { user_name }],
  }).select("+user_password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordValid = await comparePassword(
    user_password,
    user.user_password
  );

  if (!isPasswordValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const accessToken = createToken(
    {
      _id: user._id,
      user_email: user.user_email,
      roleId: user.roleId,
    },
    config.jwt_access_secret as string
  );

  return { user, accessToken };
};

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
  // const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // if (existingUser) {
  //   existingUser.otp_code = Number(otp_code);
  //   existingUser.otp_expires_at = otp_expires_at;
  //   SendPhoneOTP(otp_code, user_phone);
  //   await existingUser.save();
  //   return existingUser;
  // }

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
  // existingUser.user_password = await hashPassword(new_password);
  // existingUser.otp_code = undefined;
  // existingUser.otp_expires_at = undefined;
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
  signupService,
  loginService,
  updateUserServices,
  forgotPasswordServices,
  resetPasswordServices,
  changePasswordServices,
  getUserByIdServices,
  getAllDashboardUsersService
};  