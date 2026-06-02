"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const category_controllers_1 = require("./category.controllers");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, Get category
router
    .route("/")
    .get(category_controllers_1.findAllCategory)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "category_logo", maxCount: 1 },
    { name: "category_banner", maxCount: 10 },
]), 
// auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_CREATE),
category_controllers_1.postCategory)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "category_logo", maxCount: 1 },
    { name: "category_banner", maxCount: 10 },
]), 
// auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_UPDATE),
category_controllers_1.updateCategory)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CATEGORY_DELETE), category_controllers_1.deleteACategoryInfo);
//get single category
//router.route("/singleCategory").get(getSingleCategory)
// get all category in dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.CATEGORY_VIEW), category_controllers_1.findAllDashboardCategory);
// get all Grocery Category Banner And Reels
router.route("/grocery-category-banner-and-reels").get(/*auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_VIEW),*/ category_controllers_1.findGroceryCategoryBannerAndReels);
// get nested category
router.route("/nested").get(category_controllers_1.findNestedCategory);
exports.CategoryRoutes = router;
