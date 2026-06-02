import express from 'express';
import { YTLinkController } from './ytLink.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(YTLinkController.findYTLinks)
    .post(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_CREATE), YTLinkController.createYTLink)
    .patch(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_UPDATE), YTLinkController.updateYTLink)
    .delete(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_DELETE), YTLinkController.deleteYTLinkInfo)

// router.route('/:_id').delete(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_DELETE), YTLinkController.deleteYTLinkInfo)

// get all active inactive category for dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.YT_LINK_VIEW), YTLinkController.findAllDashboardYTLinks)
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)

export const YTLinkRoutes = router;