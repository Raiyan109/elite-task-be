import express from "express";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "./role.constants";
import { RoleControllers } from "./role.controller";

const router = express.Router();

// Create, Update, Get Passport
router
    .route("/")
    .get(auth('admin'), checkAdminPermission(AdminPermissions.ROLE_VIEW), RoleControllers.getRoles)
    .post(auth('admin'), checkAdminPermission(AdminPermissions.ROLE_CREATE), RoleControllers.postRole)
    .patch(auth('admin'), checkAdminPermission(AdminPermissions.ROLE_UPDATE), RoleControllers.updateRole)
    .delete(auth('admin'), checkAdminPermission(AdminPermissions.ROLE_DELETE), RoleControllers.deleteRole)

// router.route('/dashboard').get(RoleControllers.getDashboardRoles)

export const RoleRoutes = router;