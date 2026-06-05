"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
router.post('/signup', user_controller_1.UserControllers.signup);
// router.post('/verify-otp-phone', UserControllers.verifyPhoneOtp)
router.post('/login', user_controller_1.UserControllers.login);
router.patch('/profile', FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "user_profile", maxCount: 1 },
]), (0, auth_1.auth)('user'), user_controller_1.UserControllers.updateUser);
// router.post('/social-login', UserControllers.socialLogin)
router.post('/forgot-password', user_controller_1.UserControllers.forgotPassword);
router.post('/reset-password', user_controller_1.UserControllers.resetPassword);
router.post('/change-password', (0, auth_1.auth)('user'), user_controller_1.UserControllers.changePassword);
//get logged in user info
router.get("/profile", (0, auth_1.auth)('user'), user_controller_1.UserControllers.getUserById);
router.get("/dashboard", (0, auth_1.auth)("admin"), /*checkAdminPermission(AdminPermissions.DASHBOARD_USER_SHOW),*/ user_controller_1.UserControllers.getAllDashboardUsers);
exports.UserRoutes = router;
