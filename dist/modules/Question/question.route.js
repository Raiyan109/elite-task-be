"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const question_controller_1 = require("./question.controller");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get((0, auth_1.auth)('user'), question_controller_1.QuestionController.findQuestions)
    .post((0, auth_1.auth)('user', 'admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.QUESTION_CREATE), question_controller_1.QuestionController.createQuestion)
    .patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.QUESTION_UPDATE), question_controller_1.QuestionController.updateQuestion);
// get all active inactive category for dashboard
router.route("/dashboard").get((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.QUESTION_VIEW), question_controller_1.QuestionController.findAllDashboardQuestions);
router.route("/:question_product_id").get(question_controller_1.QuestionController.findQuestionByProductId);
router.route('/:_id').delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.QUESTION_DELETE), question_controller_1.QuestionController.deleteQuestionInfo);
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)
exports.QuestionRoutes = router;
