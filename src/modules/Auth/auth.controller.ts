// import httpStatus from 'http-status';
// import { AuthServices } from './auth.service';
// import catchAsync from '../../Utils/catchAsync';
// import { User } from '../User/user.model';
// import sendResponse from '../../Utils/sendResponse';

// const loginUser = catchAsync(async (req, res) => {
//     const result = await AuthServices.loginUser(req.body);
//     const { accessToken } = result;

//     const userLoginInfo = await User.find({ email: req.body.email })


//     const { _id, name, email, phone, address, role, profileImg, verified, followers, payment, following } = userLoginInfo[0];

//     res.status(httpStatus.OK).json({
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'User logged in successfully',
//         token: accessToken,
//         data: { _id, name, email, phone, address, role, profileImg, verified, payment, followers, following },
//     });
// });

// const changeUserPassword = catchAsync(async (req, res) => {

//     const result = await AuthServices.changeUserPassword(req.user, req.body);

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: result.message,
//         data: result,
//     });
// });

// export const AuthControllers = {
//     loginUser,
//     changeUserPassword
// };