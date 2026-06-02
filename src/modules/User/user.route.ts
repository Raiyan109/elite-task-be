import express from 'express';
import { UserControllers } from './user.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { auth } from '../../middlewares/auth';



const router = express.Router();

router.post('/send-otp-phone', UserControllers.sendPhoneOtp);

// router.post('/verify-otp-phone', UserControllers.verifyPhoneOtp)

router.post('/login', UserControllers.login)
router.patch('/profile', FileUploadHelper.ImageUpload.fields([
    { name: "user_profile", maxCount: 1 },
]), auth('user'), UserControllers.updateUser)
// router.post('/social-login', UserControllers.socialLogin)

router.post('/forgot-password', UserControllers.forgotPassword);
router.post('/reset-password', UserControllers.resetPassword);

router.post('/change-password',
    auth('user'),
    UserControllers.changePassword);

router.post('/delete-account',
    auth('user'),
    UserControllers.deleteUserOwnAccount);

//get logged in user info
router.get("/profile", auth('user'), UserControllers.getUserById)

router.get("/dashboard", auth("admin"), /*checkAdminPermission(AdminPermissions.DASHBOARD_USER_SHOW),*/ UserControllers.getAllDashboardUsers);

export const UserRoutes = router;