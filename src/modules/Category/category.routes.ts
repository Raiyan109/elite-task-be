import express from "express";
import {
  deleteACategoryInfo,
  findAllCategory,
  findAllDashboardCategory,
  findGroceryCategoryBannerAndReels,
  findNestedCategory,
  postCategory,
  updateCategory,
} from "./category.controllers";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";

const router = express.Router();

// Create, Update, Get category
router
  .route("/")
  .get(findAllCategory)
  .post(
    FileUploadHelper.ImageUpload.fields([
      { name: "category_logo", maxCount: 1 },
      { name: "category_banner", maxCount: 10 },
    ]),
    // auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_CREATE),
    postCategory
  )
  .patch(
    FileUploadHelper.ImageUpload.fields([
      { name: "category_logo", maxCount: 1 },
      { name: "category_banner", maxCount: 10 },
    ]),
    // auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_UPDATE),
    updateCategory
  )
  .delete(auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_DELETE), deleteACategoryInfo);

//get single category
//router.route("/singleCategory").get(getSingleCategory)

// get all category in dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_VIEW), findAllDashboardCategory);

// get all Grocery Category Banner And Reels
router.route("/grocery-category-banner-and-reels").get(/*auth('admin'), checkAdminPermission(AdminPermissions.CATEGORY_VIEW),*/ findGroceryCategoryBannerAndReels);

// get nested category
router.route("/nested").get(findNestedCategory);

export const CategoryRoutes = router;
