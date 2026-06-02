"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSettingsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const webSettings_controller_1 = require("./webSettings.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(webSettings_controller_1.WebSettingsController.getSettings)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]), webSettings_controller_1.WebSettingsController.createSettings)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]), webSettings_controller_1.WebSettingsController.updateSettings);
// .delete(CategoryController.deleteCategory)
// get all active inactive category for dashboard
// router.route("/dashboard").get(CategoryController.getAllDashboardCategory)
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), WebSettingsController.createSettings);
// router.get('/', WebSettingsController.getSettings);
// router.patch('/', fileUploadHandler(), WebSettingsController.updateSettings)
exports.WebSettingsRoutes = router;
