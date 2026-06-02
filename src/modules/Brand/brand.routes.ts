import express from 'express';
import { BrandController } from './brand.controller';
import { BrandValidation } from './brand.validation';
import validateRequest from '../../middlewares/validateRequest';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';

const router = express.Router();

// Create, Get category
router
    .route("/")
    .get(BrandController.findAllBrand)
    .post(
        FileUploadHelper.ImageUpload.fields([
            { name: "brand_logo", maxCount: 1 },
        ]),
        BrandController.postBrand
    )
    .patch(
        FileUploadHelper.ImageUpload.fields([
            { name: "brand_logo", maxCount: 1 },
        ]),
        validateRequest(BrandValidation.UpdateBrandSchema),
        BrandController.updateBrand
    )
    .delete(BrandController.deleteABrandInfo);

//get single brand
//router.route("/singleBrand").get(getSingleBrand)

// get all category in dashboard
router.route("/dashboard").get(BrandController.findAllDashboardBrands);

// get all nestle and unilever brands
router.route("/nestle-and-unilever").get(BrandController.findNestleAndUnileverBrands);

export const BrandRoutes = router;