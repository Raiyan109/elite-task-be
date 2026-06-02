import express from "express";
import { AdminControllers } from "./admin.controller";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { AdminPermissions } from "../Role/role.constants";

const router = express.Router();

// Create, Get update and delete Admin side user
router
    .route("/")
    .get(AdminControllers.getAllAdmins)
    .post(auth('admin'), checkAdminPermission(AdminPermissions.STAFF_CREATE), AdminControllers.registerAdmin)
    .patch(FileUploadHelper.ImageUpload.fields([
        { name: "admin_profile", maxCount: 1 },
    ]), AdminControllers.updateAdmin)

// login a Admin
router.route("/login").post(AdminControllers.loginAdmin)//.patch(updateAdmin);
router.route("/logout").post(AdminControllers.logoutAdmin)

//get logged in admin info
router.route("/loggedAdmin").get(auth('admin'), AdminControllers.getAdminById)

router.route('/:_id').delete(AdminControllers.deleteAdmin);

//change password
router.route("/changePassword").patch(auth('admin'), AdminControllers.changeAdminPassword)

// get all dashboard admin
//router.route("/dashboard").get(findAllDashboardAdminRoleAdmin);

export const AdminRegRoutes = router;