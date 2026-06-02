"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRegRoutes = void 0;
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const auth_1 = require("../../middlewares/auth");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Get update and delete Admin side user
router
    .route("/")
    .get(admin_controller_1.AdminControllers.getAllAdmins)
    .post((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.STAFF_CREATE), admin_controller_1.AdminControllers.registerAdmin)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "admin_profile", maxCount: 1 },
]), admin_controller_1.AdminControllers.updateAdmin);
// login a Admin
router.route("/login").post(admin_controller_1.AdminControllers.loginAdmin); //.patch(updateAdmin);
router.route("/logout").post(admin_controller_1.AdminControllers.logoutAdmin);
//get logged in admin info
router.route("/loggedAdmin").get((0, auth_1.auth)('admin'), admin_controller_1.AdminControllers.getAdminById);
router.route('/:_id').delete(admin_controller_1.AdminControllers.deleteAdmin);
//change password
router.route("/changePassword").patch((0, auth_1.auth)('admin'), admin_controller_1.AdminControllers.changeAdminPassword);
// get all dashboard admin
//router.route("/dashboard").get(findAllDashboardAdminRoleAdmin);
exports.AdminRegRoutes = router;
