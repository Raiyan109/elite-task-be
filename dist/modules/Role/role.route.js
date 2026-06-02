"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("./role.constants");
const role_controller_1 = require("./role.controller");
const router = express_1.default.Router();
// Create, Update, Get Passport
router
    .route("/")
    .get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ROLE_VIEW), role_controller_1.RoleControllers.getRoles)
    .post((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ROLE_CREATE), role_controller_1.RoleControllers.postRole)
    .patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ROLE_UPDATE), role_controller_1.RoleControllers.updateRole)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ROLE_DELETE), role_controller_1.RoleControllers.deleteRole);
// router.route('/dashboard').get(RoleControllers.getDashboardRoles)
exports.RoleRoutes = router;
