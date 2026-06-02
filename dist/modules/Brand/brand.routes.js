"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandRoutes = void 0;
const express_1 = __importDefault(require("express"));
const brand_controller_1 = require("./brand.controller");
const brand_validation_1 = require("./brand.validation");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const router = express_1.default.Router();
// Create, Get category
router
    .route("/")
    .get(brand_controller_1.BrandController.findAllBrand)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "brand_logo", maxCount: 1 },
]), brand_controller_1.BrandController.postBrand)
    .patch(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "brand_logo", maxCount: 1 },
]), (0, validateRequest_1.default)(brand_validation_1.BrandValidation.UpdateBrandSchema), brand_controller_1.BrandController.updateBrand)
    .delete(brand_controller_1.BrandController.deleteABrandInfo);
//get single brand
//router.route("/singleBrand").get(getSingleBrand)
// get all category in dashboard
router.route("/dashboard").get(brand_controller_1.BrandController.findAllDashboardBrands);
// get all nestle and unilever brands
router.route("/nestle-and-unilever").get(brand_controller_1.BrandController.findNestleAndUnileverBrands);
exports.BrandRoutes = router;
