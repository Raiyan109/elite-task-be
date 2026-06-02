import express from 'express';
import { QuestionController } from './question.controller';
import { auth, checkAdminPermission } from '../../middlewares/auth';
import { AdminPermissions } from '../Role/role.constants';

const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(auth('user'), QuestionController.findQuestions)
    .post(auth('user', 'admin'), checkAdminPermission(AdminPermissions.QUESTION_CREATE), QuestionController.createQuestion)
    .patch(auth('admin'), checkAdminPermission(AdminPermissions.QUESTION_UPDATE), QuestionController.updateQuestion)


// get all active inactive category for dashboard
router.route("/dashboard").get(auth('admin'), checkAdminPermission(AdminPermissions.QUESTION_VIEW), QuestionController.findAllDashboardQuestions)

router.route("/:question_product_id").get(QuestionController.findQuestionByProductId)


router.route('/:_id').delete(auth('admin'), checkAdminPermission(AdminPermissions.QUESTION_DELETE), QuestionController.deleteQuestionInfo)

// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)

export const QuestionRoutes = router;