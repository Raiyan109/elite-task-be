import express from 'express';
import { HotDealController } from './hotDeal.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(HotDealController.findAllHotDeal)
    .post(FileUploadHelper.ImageUpload.fields([{ name: "hotDeal_image", maxCount: 1 }]), auth('admin'), checkAdminPermission(AdminPermissions.HOTDEAL_CREATE), HotDealController.createHotDeal)
    .patch(FileUploadHelper.ImageUpload.fields([{ name: "hotDeal_image", maxCount: 1 }]), auth('admin'), checkAdminPermission(AdminPermissions.HOTDEAL_UPDATE), HotDealController.updateHotDeal)


// get all active inactive category for dashboard
router.route("/dashboard").get(HotDealController.findDashboardHotDeal)

// get hotDeals by ids
router.route('/ids').post(HotDealController.findHotDealsByIds)

router.route('/:id').get(HotDealController.findSingleHotDeal)


export const HotDealRoutes = router;