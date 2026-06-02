import express from 'express';
import { ComboController } from './combo.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(ComboController.findAllCombo)
    .post(FileUploadHelper.ImageUpload.fields([{ name: "combo_image", maxCount: 1 }]), ComboController.createCombo)


// get all active inactive category for dashboard
router.route("/dashboard").get(ComboController.findDashboardCombo)

// get combos by ids
router.route('/ids').post(ComboController.findCombosByIds)

router.route('/related-combos/:id').get(ComboController.findRelatedCombos)

router.route('/:id')
    .get(ComboController.findSingleCombo)
    .patch(FileUploadHelper.ImageUpload.fields([{ name: "combo_image", maxCount: 1 }]), ComboController.updateCombo)
    .delete(ComboController.deleteCombo);


export const ComboRoutes = router;