"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRoutes = void 0;
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("./coupon.controller");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(coupon_controller_1.findAllCoupons)
    .post(coupon_controller_1.createCoupon);
router.route('/dashboard').get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.COUPON_VIEW), coupon_controller_1.findAllDashboardCoupons);
router.route('/apply').post((0, auth_1.auth)('user'), coupon_controller_1.checkCoupon);
router.route('/:_id').patch(coupon_controller_1.updateCoupon);
router.route('/:_id').delete(coupon_controller_1.deleteCoupon);
exports.CouponRoutes = router;
