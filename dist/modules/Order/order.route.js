"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const order_controller_1 = require("./order.controller");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, Get Order
router
    .route("/")
    .post((0, auth_1.auth)('user'), order_controller_1.OrderControllers.createOrder);
// Dashboard orders
router
    .route("/dashboard")
    .get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ORDER_VIEW), order_controller_1.OrderControllers.findDashboardOrders);
// Apply from wallet
router
    .route("/apply-from-wallet")
    .post((0, auth_1.auth)('user'), order_controller_1.OrderControllers.applyFromWallet);
// Handle SSLCommerz payment success
router.route("/success/:order_id").post(order_controller_1.OrderControllers.sslSuccess);
// Handle SSLCommerz payment failure
router.route("/fail/:order_id").post(order_controller_1.OrderControllers.sslFail);
// GEt single orde
router.route('/:id').get(order_controller_1.OrderControllers.findSingleOrder);
router.route("/user/:user_id")
    .get(order_controller_1.OrderControllers.findOrdersByUserId);
// Cancel order
router.route("/cancel/:order_id").patch((0, auth_1.auth)('user'), order_controller_1.OrderControllers.cancelOrder);
// Order status update
router.route("/status/:order_id").patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ORDER_UPDATE), order_controller_1.OrderControllers.orderStatusUpdate);
// Order update (item remove / item quantity decrease / status change)
router.route("/single-order/:order_id").patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.ORDER_UPDATE), order_controller_1.OrderControllers.orderUpdate);
exports.OrderRoutes = router;
