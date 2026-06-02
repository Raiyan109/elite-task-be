import express from "express";

import { deleteAChildcategoryInfo, findAllDashboardChildcategory, findAllChildcategory, postChildcategory, updateChildcategory } from "./childcategory.controllers";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";
const router = express.Router();

// Create, Update, Get category
router
  .route("/")
  .get(findAllChildcategory)
  .post(
    FileUploadHelper.ImageUpload.fields([
      { name: "childcategory_logo", maxCount: 1 },
      { name: "childcategory_banner", maxCount: 10 },
    ]),
    auth('admin'), checkAdminPermission(AdminPermissions.CHILDCATEGORY_CREATE),
    postChildcategory
  )
  .patch(
    FileUploadHelper.ImageUpload.fields([
      { name: "childcategory_logo", maxCount: 1 },
      { name: "childcategory_banner", maxCount: 10 },
    ]),
    auth('admin'), checkAdminPermission(AdminPermissions.CHILDCATEGORY_UPDATE),
    updateChildcategory
  )
  .delete(auth('admin'), checkAdminPermission(AdminPermissions.CHILDCATEGORY_DELETE), deleteAChildcategoryInfo);

//get single category
//router.route("/singleCategory").get(getSingleCategory)

// get all category in dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.CHILDCATEGORY_VIEW), findAllDashboardChildcategory);

export const ChildcategoryRoutes = router;
