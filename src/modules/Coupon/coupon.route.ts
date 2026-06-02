import express from 'express';
import { checkCoupon, createCoupon, deleteCoupon, findAllCoupons, findAllDashboardCoupons, updateCoupon } from './coupon.controller';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';

const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(findAllCoupons)
    .post(createCoupon)

router.route('/dashboard').get(auth('admin'), checkAdminPermission(AdminPermissions.COUPON_VIEW), findAllDashboardCoupons)

router.route('/apply').post(auth('user'), checkCoupon)

router.route('/:_id').patch(updateCoupon)
router.route('/:_id').delete(deleteCoupon)


export const CouponRoutes = router;