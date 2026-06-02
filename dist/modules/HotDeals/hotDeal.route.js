"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotDealRoutes = void 0;
const express_1 = __importDefault(require("express"));
const hotDeal_controller_1 = require("./hotDeal.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(hotDeal_controller_1.HotDealController.findAllHotDeal)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "hotDeal_image", maxCount: 1 }]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.HOTDEAL_CREATE), hotDeal_controller_1.HotDealController.createHotDeal)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "hotDeal_image", maxCount: 1 }]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.HOTDEAL_UPDATE), hotDeal_controller_1.HotDealController.updateHotDeal);
// get all active inactive category for dashboard
router.route("/dashboard").get(hotDeal_controller_1.HotDealController.findDashboardHotDeal);
// get hotDeals by ids
router.route('/ids').post(hotDeal_controller_1.HotDealController.findHotDealsByIds);
router.route('/:id').get(hotDeal_controller_1.HotDealController.findSingleHotDeal);
exports.HotDealRoutes = router;
