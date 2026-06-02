"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildcategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const childcategory_controllers_1 = require("./childcategory.controllers");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, Get category
router
    .route("/")
    .get(childcategory_controllers_1.findAllChildcategory)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "childcategory_logo", maxCount: 1 },
    { name: "childcategory_banner", maxCount: 10 },
]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CHILDCATEGORY_CREATE), childcategory_controllers_1.postChildcategory)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "childcategory_logo", maxCount: 1 },
    { name: "childcategory_banner", maxCount: 10 },
]), (0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CHILDCATEGORY_UPDATE), childcategory_controllers_1.updateChildcategory)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CHILDCATEGORY_DELETE), childcategory_controllers_1.deleteAChildcategoryInfo);
//get single category
//router.route("/singleCategory").get(getSingleCategory)
// get all category in dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CHILDCATEGORY_VIEW), childcategory_controllers_1.findAllDashboardChildcategory);
exports.ChildcategoryRoutes = router;
