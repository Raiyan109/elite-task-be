import express from 'express';
import { BannerController } from './banner.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(BannerController.findBanners)
    .post(auth('admin'), checkAdminPermission(AdminPermissions.BANNER_CREATE), FileUploadHelper.ImageUpload.fields([{ name: "banner_image", maxCount: 1 }]), BannerController.createBanner)
    .patch(auth('admin'), checkAdminPermission(AdminPermissions.BANNER_UPDATE), FileUploadHelper.ImageUpload.fields([
        { name: "banner_image", maxCount: 1 },
    ]),
        BannerController.updateBanner)
    .delete(auth('admin'), checkAdminPermission(AdminPermissions.BANNER_DELETE), BannerController.deleteBannerInfo)

// router.route('/:_id').delete(BannerController.deleteBannerInfo)

// get all active inactive category for dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.BANNER_VIEW), BannerController.findAllDashboardBanners)
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)

export const BannerRoutes = router;