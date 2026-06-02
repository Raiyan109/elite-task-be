"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponNotAppliedRoutes = void 0;
const express_1 = __importDefault(require("express"));
const couponNotApplied_controller_1 = require("./couponNotApplied.controller");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    // .get(CouponNotAppliedController.findAllCombo)
    .post(couponNotApplied_controller_1.CouponNotAppliedController.createCouponNotApplied)
    .patch(couponNotApplied_controller_1.CouponNotAppliedController.updateCouponNotApplied);
// get all active inactive category for dashboard
router.route("/dashboard").get(couponNotApplied_controller_1.CouponNotAppliedController.findDashboardCouponNotApplied);
// get combos by ids
// router.route('/ids').post(CouponNotAppliedController.findCombosByIds)
// router.route('/:id')
//.get(CouponNotAppliedController.findSingleCombo)
// .patch(CouponNotAppliedController.updateCouponNotApplied)
// .delete(CouponNotAppliedController.deleteCouponNotApplied);
exports.CouponNotAppliedRoutes = router;
