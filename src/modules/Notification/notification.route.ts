import express from "express";
import { createNotification, getAllNotifications, getUserNotifications, /*getNotifications*/ } from "./notification.controller";
import { auth, checkAdminPermission } from "../../middlewares/auth";
// import { AdminPermissions } from "../Admin/admin.interface";
// import { auth } from "../../middlewares/auth";

const router = express.Router();

router.route("/")
    .get(getAllNotifications)   // get all (or filter by user_id)
    .post(auth('admin'), /*checkAdminPermission(AdminPermissions.WEBSITE_UPDATE),*/ createNotification) // create

router.route("/user-notification").get(auth('user'), getUserNotifications)


export const NotificationRoutes = router;