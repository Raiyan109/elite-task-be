"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YTLinkRoutes = void 0;
const express_1 = __importDefault(require("express"));
const ytLink_controller_1 = require("./ytLink.controller");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(ytLink_controller_1.YTLinkController.findYTLinks)
    .post((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.YT_LINK_CREATE), ytLink_controller_1.YTLinkController.createYTLink)
    .patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.YT_LINK_UPDATE), ytLink_controller_1.YTLinkController.updateYTLink)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.YT_LINK_DELETE), ytLink_controller_1.YTLinkController.deleteYTLinkInfo);
// router.route('/:_id').delete(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_DELETE), YTLinkController.deleteYTLinkInfo)
// get all active inactive category for dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.YT_LINK_VIEW), ytLink_controller_1.YTLinkController.findAllDashboardYTLinks);
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)
exports.YTLinkRoutes = router;
