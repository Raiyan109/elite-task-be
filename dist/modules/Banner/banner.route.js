"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(banner_controller_1.BannerController.findBanners)
    .post((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.BANNER_CREATE), FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "banner_image", maxCount: 1 }]), banner_controller_1.BannerController.createBanner)
    .patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.BANNER_UPDATE), FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "banner_image", maxCount: 1 },
]), banner_controller_1.BannerController.updateBanner)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.BANNER_DELETE), banner_controller_1.BannerController.deleteBannerInfo);
// router.route('/:_id').delete(BannerController.deleteBannerInfo)
// get all active inactive category for dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.BANNER_VIEW), banner_controller_1.BannerController.findAllDashboardBanners);
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)
exports.BannerRoutes = router;
