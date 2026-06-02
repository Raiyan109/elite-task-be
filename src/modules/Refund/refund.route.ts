import express from 'express';
import { RefundController } from './refund.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';

const router = express.Router();

router
    .route('/')
    .get(auth('user'), RefundController.findRefundById)
    .post(
        FileUploadHelper.ImageUpload.fields([{ name: 'refund_images', maxCount: 10 }]),
        auth('user'),
        RefundController.createRefund
    );

router.route('/dashboard')
    .get(auth('admin'), checkAdminPermission(AdminPermissions.IS_REFUND_VIEW), RefundController.findAllDashboardRefunds);


router
    .route('/:order_id')
    .get(
        auth('user'),
        RefundController.findRefundByOrderId
    );

router.route('/:id')
    .patch(RefundController.updateRefund)
    .delete(RefundController.deleteRefund);


export const RefundRoutes = router;
