import express from "express";
import { fashionSectionsShowBulkUpdate, getCommonCategoryData, getFashionSectionsForWebsiteShow, getPharmacySectionsForWebsiteShow, getSkincareSectionsForWebsiteShow, pharmacySectionsShowBulkUpdate, ProductControllers, skincareSectionsShowBulkUpdate } from "./product.controller";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { auth, checkAdminPermission } from "../../middlewares/auth";
import { AdminPermissions } from "../Role/role.constants";

const router = express.Router();

// Create, Update, delete, Get product
router
    .route("/")
    .get(ProductControllers.findAllProduct)
    .post(auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_CREATE), FileUploadHelper.ImageUpload.any(), ProductControllers.postProduct)
    .patch(auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_UPDATE), FileUploadHelper.ImageUpload.any(), ProductControllers.updateProduct)
    .delete(auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_DELETE), ProductControllers.deleteProduct);

router.route('/search').get(ProductControllers.findSearchProduct)
router.route("/related-products").get(ProductControllers.findRelatedProducts)
router.route('/dashboard').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ ProductControllers.findAllDashboardProduct)
router.route('/dashboard/hotdeals').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ ProductControllers.findDashboardAvailableProductsForHotDeals)
router.route('/dashboard/coupon-not-applied').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ ProductControllers.findDashboardAvailableProductsForCouponNotApplied)
router.route('/popular').get(ProductControllers.findPopularProduct)
router.route('/hot-deals').get(ProductControllers.findHotDealsProduct)
router.route('/new-uploaded').get(ProductControllers.findNewUploadedProduct)
router.route('/offered').get(ProductControllers.findOfferedProduct)

router.route('/common-category-products/:category_slug').get(getCommonCategoryData)

// GET /api/pharmacy-sections
router.route('/pharmacy-sections').get(getPharmacySectionsForWebsiteShow);
// GET /api/skincare-sections
router.route('/skincare-sections').get(getSkincareSectionsForWebsiteShow);
// GET /api/fashion-sections
router.route('/fashion-sections').get(getFashionSectionsForWebsiteShow);

// get products by ids (cart)
router.route('/ids').post(ProductControllers.findProductsByIds)

// get products by brand ids
router.get("/brand", ProductControllers.findProductsByBrandId);

// get single product
router.route('/dashboard/:productId').get(ProductControllers.findSingleDashboardProduct)
router.route('/:id').get(ProductControllers.findSingleProduct)

router.route('/bulk-status').patch(ProductControllers.statusBulkUpdate)

router.route('/pharmacy-section-bulk-update').patch(pharmacySectionsShowBulkUpdate)

router.route('/fashion-section-bulk-update').patch(fashionSectionsShowBulkUpdate)

router.route('/skincare-section-bulk-update').patch(skincareSectionsShowBulkUpdate)

export const ProductRoutes = router;