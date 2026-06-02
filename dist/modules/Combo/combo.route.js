"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComboRoutes = void 0;
const express_1 = __importDefault(require("express"));
const combo_controller_1 = require("./combo.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(combo_controller_1.ComboController.findAllCombo)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "combo_image", maxCount: 1 }]), combo_controller_1.ComboController.createCombo);
// get all active inactive category for dashboard
router.route("/dashboard").get(combo_controller_1.ComboController.findDashboardCombo);
// get combos by ids
router.route('/ids').post(combo_controller_1.ComboController.findCombosByIds);
router.route('/related-combos/:id').get(combo_controller_1.ComboController.findRelatedCombos);
router.route('/:id')
    .get(combo_controller_1.ComboController.findSingleCombo)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "combo_image", maxCount: 1 }]), combo_controller_1.ComboController.updateCombo)
    .delete(combo_controller_1.ComboController.deleteCombo);
exports.ComboRoutes = router;
