import express from "express";
import { auth } from "../../middlewares/auth";
import { getRequestOrder, getRequestOrderDashboard, postRequestOrder, removeFromRequestOrder, updateRequestOrder, updateRequestOrderByAdmin } from "./requestOrder.controller";

const router = express.Router();

// Create, Update, delete, Get product
router
    .route("/")
    .get(auth('user'), getRequestOrder)
    .post(auth('user'), postRequestOrder)

router
    .route("/dashboard")
    .get(auth('admin'), getRequestOrderDashboard)

router.route('/update-req-order-by-admin').patch(auth('admin'), updateRequestOrderByAdmin)

router
    .route("/:product_id")
    .patch(auth('admin'), updateRequestOrder)

export const RequestOrderRoutes = router;