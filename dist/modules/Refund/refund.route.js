"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundRoutes = void 0;
const express_1 = __importDefault(require("express"));
const refund_controller_1 = require("./refund.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
router
    .route('/')
    .get((0, auth_1.auth)('user'), refund_controller_1.RefundController.findRefundById)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: 'refund_images', maxCount: 10 }]), (0, auth_1.auth)('user'), refund_controller_1.RefundController.createRefund);
router.route('/dashboard')
    .get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.IS_REFUND_VIEW), refund_controller_1.RefundController.findAllDashboardRefunds);
router
    .route('/:order_id')
    .get((0, auth_1.auth)('user'), refund_controller_1.RefundController.findRefundByOrderId);
router.route('/:id')
    .patch(refund_controller_1.RefundController.updateRefund)
    .delete(refund_controller_1.RefundController.deleteRefund);
exports.RefundRoutes = router;
