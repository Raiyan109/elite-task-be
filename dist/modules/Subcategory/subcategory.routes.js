"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const subcategory_controllers_1 = require("./subcategory.controllers");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, Get sub category
router
    .route("/")
    .get(subcategory_controllers_1.findAllSubcategory)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "subcategory_logo", maxCount: 1 },
    { name: "subcategory_banner", maxCount: 10 },
]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.SUBCATEGORY_CREATE), subcategory_controllers_1.postSubcategory)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "subcategory_logo", maxCount: 1 },
    { name: "subcategory_banner", maxCount: 10 },
]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.SUBCATEGORY_UPDATE), subcategory_controllers_1.updateSubcategory)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.SUBCATEGORY_DELETE), subcategory_controllers_1.deleteASubcategoryInfo);
//get single sub category
//router.route("/singleCategory").get(getSingleCategory)
// get all sub category in dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.SUBCATEGORY_VIEW), subcategory_controllers_1.findAllDashboardSubcategory);
// get all grocery sub category
router.route("/grocery").get(subcategory_controllers_1.findAllGrocerySubcategory);
// get all pharmacy sub category
router.route("/pharmacy").get(subcategory_controllers_1.findAllPharmacySubcategory);
// get all skincare sub category
router.route("/skincare").get(subcategory_controllers_1.findAllSkincareSubcategory);
// get all fashion sub category
router.route("/fashion").get(subcategory_controllers_1.findAllFashionSubcategory);
exports.SubcategoryRoutes = router;
