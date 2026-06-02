import express from "express";

import { deleteASubcategoryInfo, findAllDashboardSubcategory, findAllFashionSubcategory, findAllGrocerySubcategory, findAllPharmacySubcategory, findAllSkincareSubcategory, findAllSubcategory, postSubcategory, updateSubcategory } from "./subcategory.controllers";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";
const router = express.Router();

// Create, Update, Get sub category
router
  .route("/")
  .get(findAllSubcategory)
  .post(
    FileUploadHelper.ImageUpload.fields([
      { name: "subcategory_logo", maxCount: 1 },
      { name: "subcategory_banner", maxCount: 10 },
    ]),
    auth('admin'), checkAdminPermission(AdminPermissions.SUBCATEGORY_CREATE),
    postSubcategory
  )
  .patch(
    FileUploadHelper.ImageUpload.fields([
      { name: "subcategory_logo", maxCount: 1 },
      { name: "subcategory_banner", maxCount: 10 },
    ]),
    auth('admin'), checkAdminPermission(AdminPermissions.SUBCATEGORY_UPDATE),
    updateSubcategory
  )
  .delete(auth('admin'), checkAdminPermission(AdminPermissions.SUBCATEGORY_DELETE), deleteASubcategoryInfo);

//get single sub category
//router.route("/singleCategory").get(getSingleCategory)

// get all sub category in dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.SUBCATEGORY_VIEW), findAllDashboardSubcategory);

// get all grocery sub category
router.route("/grocery").get(findAllGrocerySubcategory);
// get all pharmacy sub category
router.route("/pharmacy").get(findAllPharmacySubcategory);
// get all skincare sub category
router.route("/skincare").get(findAllSkincareSubcategory);
// get all fashion sub category
router.route("/fashion").get(findAllFashionSubcategory);

export const SubcategoryRoutes = router;
