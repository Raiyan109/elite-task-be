import express from "express";
import { OrderControllers } from "./order.controller";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";

const router = express.Router();

// Create, Update, Get Order
router
    .route("/")
    .post(auth('user'), OrderControllers.createOrder)

// Dashboard orders
router
    .route("/dashboard")
    .get(auth('admin'), checkAdminPermission(AdminPermissions.ORDER_VIEW), OrderControllers.findDashboardOrders)

// Apply from wallet
router
    .route("/apply-from-wallet")
    .post(auth('user'), OrderControllers.applyFromWallet);

// Handle SSLCommerz payment success
router.route("/success/:order_id").post(OrderControllers.sslSuccess);

// Handle SSLCommerz payment failure
router.route("/fail/:order_id").post(OrderControllers.sslFail);

// GEt single orde
router.route('/:id').get(OrderControllers.findSingleOrder)

router.route("/user/:user_id")
    .get(OrderControllers.findOrdersByUserId)


router.route("/user-transactions/:user_id")
    .get(OrderControllers.findTransactionsByUserId)


// Cancel order
router.route("/cancel/:order_id").patch(auth('user'), OrderControllers.cancelOrder)

// Order status update
router.route("/status/:order_id").patch(auth('admin'), checkAdminPermission(AdminPermissions.ORDER_UPDATE), OrderControllers.orderStatusUpdate);

// Order update (item remove / item quantity decrease / status change)
router.route("/single-order/:order_id").patch(auth('admin'), checkAdminPermission(AdminPermissions.ORDER_UPDATE), OrderControllers.orderUpdate);

export const OrderRoutes = router;