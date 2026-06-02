import express from 'express';
import { WebSettingsController } from './webSettings.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(WebSettingsController.getSettings)
    .post(FileUploadHelper.ImageUpload.fields([
        { name: "logo", maxCount: 1 },
        { name: "favicon", maxCount: 1 },
    ]), WebSettingsController.createSettings)
    .patch(FileUploadHelper.ImageUpload.fields([
        { name: "logo", maxCount: 1 },
        { name: "favicon", maxCount: 1 },
    ]), WebSettingsController.updateSettings)

// .delete(CategoryController.deleteCategory)

// get all active inactive category for dashboard
// router.route("/dashboard").get(CategoryController.getAllDashboardCategory)
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), WebSettingsController.createSettings);
// router.get('/', WebSettingsController.getSettings);
// router.patch('/', fileUploadHandler(), WebSettingsController.updateSettings)

export const WebSettingsRoutes = router;