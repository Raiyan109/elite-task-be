// import { Router } from "express";
// import validateRequest from "../../Middlewares/validateRequest";
// import { AuthControllers } from "./auth.controller";
// import { changeUserPasswordValidationSchema, loginValidationSchema } from "./auth.validation";
// import { UserControllers } from "../User/user.controller";
// import { userValidationSchema } from "../User/user.validaton";
// import { auth } from "../../Middlewares/auth";
// import { USER_ROLE } from "../User/user.constant";

// const router = Router();

// router.post(
//     '/signup',
//     validateRequest(userValidationSchema),
//     UserControllers.registerUser,
// );
// router.post(
//     '/login',
//     validateRequest(loginValidationSchema),
//     AuthControllers.loginUser,
// );
// router.post(
//     '/changeUserPassword',
//     auth(USER_ROLE.user, USER_ROLE.admin),
//     validateRequest(changeUserPasswordValidationSchema),
//     AuthControllers.changeUserPassword,
// );

// export const authRoute = router