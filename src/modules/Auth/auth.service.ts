// import httpStatus from 'http-status';
// import config from '../../config';
// import { TLoginUser } from './auth.interface';
// import { createToken } from './auth.utils';
// import AppError from '../../Errors/AppError';
// import { User } from '../User/user.model';
// import { JwtPayload } from 'jsonwebtoken';
// import bcrypt from 'bcrypt';


// const loginUser = async (payload: TLoginUser) => {
//     // checking if the user is exist
//     const user = await User.isUserExistsByEmail(payload.email);


//     if (!user) {
//         throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
//     }

//     //checking if the password is correct

//     if (!(await User.isPasswordMatched(payload?.password, user?.password)))
//         throw new AppError(httpStatus.FORBIDDEN, 'Password did not match');

//     //create token and sent to the  client

//     const jwtPayload = {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         profileImg: user.profileImg,
//         address: user.address,
//         payment: user.payment,
//         verified: user.verified,
//         followers: user.followers,
//         following: user.following,
//         role: user.role,
//     };

//     const accessToken = createToken(
//         jwtPayload,
//         config.jwt_access_secret as string,
//         config.jwt_access_expires_in as string,
//     );

//     return {
//         accessToken,
//     };

// };

// const changeUserPassword = async (
//     user: JwtPayload,
//     payload: {
//         oldPassword: string;
//         newPassword: string;
//     },
// ) => {

//     const userData = await User.isUserExistsByEmail(user?.email);
    

//     if (!userData) {
//         throw new AppError(httpStatus.NOT_FOUND, 'This user is not found');
//     }

//     const isOldPasswordCorrect = await bcrypt.compare(
//         payload.oldPassword,
//         userData.password,
//     );

//     if (!isOldPasswordCorrect) {
//         throw new AppError(httpStatus.FORBIDDEN, 'Old password is not correct');
//     }

//     const isSamePassword = await bcrypt.compare(
//         payload.newPassword,
//         userData.password,
//     );

//     if (isSamePassword) {
//         throw new AppError(
//             httpStatus.BAD_REQUEST,
//             'New password cannot be same as old password',
//         );
//     }

//     const newHashedPassword = await bcrypt.hash(
//         payload.newPassword,
//         Number(config.bcrypt_salt_rounds),
//     );

//     await User.findOneAndUpdate(
//         {
//             email: user.email,
//             role: user.role,
//         },
//         {
//             password: newHashedPassword,
//             needsPasswordChange: false,
//             passwordChangeAt: new Date(),
//         },
//         { new: true },
//     );
//     return { message: 'User password has been changed successfully' };
// };

// export const AuthServices = {
//     loginUser,
//     changeUserPassword,
// };