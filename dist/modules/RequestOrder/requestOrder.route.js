"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestOrderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const requestOrder_controller_1 = require("./requestOrder.controller");
const router = express_1.default.Router();
// Create, Update, delete, Get product
router
    .route("/")
    .get((0, auth_1.auth)('user'), requestOrder_controller_1.getRequestOrder)
    .post((0, auth_1.auth)('user'), requestOrder_controller_1.postRequestOrder);
router
    .route("/dashboard")
    .get((0, auth_1.auth)('admin'), requestOrder_controller_1.getRequestOrderDashboard);
router.route('/update-req-order-by-admin').patch((0, auth_1.auth)('admin'), requestOrder_controller_1.updateRequestOrderByAdmin);
router
    .route("/:product_id")
    .patch((0, auth_1.auth)('admin'), requestOrder_controller_1.updateRequestOrder);
exports.RequestOrderRoutes = router;
