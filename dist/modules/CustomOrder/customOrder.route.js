"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomOrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const customOrder_controller_1 = require("./customOrder.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, Get customOrder
router
    .route("/")
    .get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CUSTOM_ORDER_VIEW), customOrder_controller_1.findAllCustomOrder)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "product_image", maxCount: 1 },
]), customOrder_controller_1.postCustomOrder)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "product_image", maxCount: 1 },
]), customOrder_controller_1.updateCustomOrder)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CUSTOM_ORDER_DELETE), customOrder_controller_1.deleteACustomOrderInfo);
//get customOrder by id
router.route("/user").get((0, auth_1.auth)('user'), customOrder_controller_1.findCustomOrderByUserId);
// get all customOrder in dashboard
// router.route("/dashboard").get(findAllDashboardCustomOrder);
exports.CustomOrderRoutes = router;
