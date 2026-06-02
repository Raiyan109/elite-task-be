import express from 'express';
import { CouponNotAppliedController } from './couponNotApplied.controller';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    // .get(CouponNotAppliedController.findAllCombo)
    .post(CouponNotAppliedController.createCouponNotApplied)
    .patch(CouponNotAppliedController.updateCouponNotApplied)


// get all active inactive category for dashboard
router.route("/dashboard").get(CouponNotAppliedController.findDashboardCouponNotApplied)

// get combos by ids
// router.route('/ids').post(CouponNotAppliedController.findCombosByIds)

// router.route('/:id')
    //.get(CouponNotAppliedController.findSingleCombo)
    // .patch(CouponNotAppliedController.updateCouponNotApplied)
    // .delete(CouponNotAppliedController.deleteCouponNotApplied);


export const CouponNotAppliedRoutes = router;