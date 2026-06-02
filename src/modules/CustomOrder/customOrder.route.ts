import express from "express";
import {
    deleteACustomOrderInfo,
    findAllCustomOrder,
    findAllDashboardCustomOrder,
    findCustomOrderByUserId,
    postCustomOrder,
    updateCustomOrder,
} from "./customOrder.controller";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";

const router = express.Router();

// Create, Update, Get customOrder
router
    .route("/")
    .get(auth('admin'), checkAdminPermission(AdminPermissions.CUSTOM_ORDER_VIEW), findAllCustomOrder)
    .post(
        FileUploadHelper.ImageUpload.fields([
            { name: "product_image", maxCount: 1 },
        ]),
        postCustomOrder
    )
    .patch(
        FileUploadHelper.ImageUpload.fields([
            { name: "product_image", maxCount: 1 },
        ]),
        updateCustomOrder
    )
    .delete(auth('admin'), checkAdminPermission(AdminPermissions.CUSTOM_ORDER_DELETE), deleteACustomOrderInfo);

//get customOrder by id
router.route("/user").get(auth('user'), findCustomOrderByUserId)

// get all customOrder in dashboard
// router.route("/dashboard").get(findAllDashboardCustomOrder);

export const CustomOrderRoutes = router;
