"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("./product.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const auth_1 = require("../../middlewares/auth");
const role_constants_1 = require("../Role/role.constants");
const router = express_1.default.Router();
// Create, Update, delete, Get product
router
    .route("/")
    .get(product_controller_1.ProductControllers.findAllProduct)
    .post((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.PRODUCT_CREATE), FileUploadHelper_1.FileUploadHelper.ImageUpload.any(), product_controller_1.ProductControllers.postProduct)
    .patch((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.PRODUCT_UPDATE), FileUploadHelper_1.FileUploadHelper.ImageUpload.any(), product_controller_1.ProductControllers.updateProduct)
    .delete((0, auth_1.auth)('admin'), (0, auth_1.checkAdminPermission)(role_constants_1.AdminPermissions.PRODUCT_DELETE), product_controller_1.ProductControllers.deleteProduct);
router.route('/search').get(product_controller_1.ProductControllers.findSearchProduct);
router.route("/related-products").get(product_controller_1.ProductControllers.findRelatedProducts);
router.route('/dashboard').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ product_controller_1.ProductControllers.findAllDashboardProduct);
router.route('/dashboard/hotdeals').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ product_controller_1.ProductControllers.findDashboardAvailableProductsForHotDeals);
router.route('/dashboard/coupon-not-applied').get(/*auth('admin'), checkAdminPermission(AdminPermissions.PRODUCT_VIEW),*/ product_controller_1.ProductControllers.findDashboardAvailableProductsForCouponNotApplied);
router.route('/popular').get(product_controller_1.ProductControllers.findPopularProduct);
router.route('/hot-deals').get(product_controller_1.ProductControllers.findHotDealsProduct);
router.route('/new-uploaded').get(product_controller_1.ProductControllers.findNewUploadedProduct);
router.route('/offered').get(product_controller_1.ProductControllers.findOfferedProduct);
router.route('/common-category-products/:category_slug').get(product_controller_1.getCommonCategoryData);
// GET /api/pharmacy-sections
router.route('/pharmacy-sections').get(product_controller_1.getPharmacySectionsForWebsiteShow);
// GET /api/skincare-sections
router.route('/skincare-sections').get(product_controller_1.getSkincareSectionsForWebsiteShow);
// GET /api/fashion-sections
router.route('/fashion-sections').get(product_controller_1.getFashionSectionsForWebsiteShow);
// get products by ids (cart)
router.route('/ids').post(product_controller_1.ProductControllers.findProductsByIds);
// get products by brand ids
router.get("/brand", product_controller_1.ProductControllers.findProductsByBrandId);
// get single product
router.route('/dashboard/:productId').get(product_controller_1.ProductControllers.findSingleDashboardProduct);
router.route('/:id').get(product_controller_1.ProductControllers.findSingleProduct);
router.route('/bulk-status').patch(product_controller_1.ProductControllers.statusBulkUpdate);
router.route('/pharmacy-section-bulk-update').patch(product_controller_1.pharmacySectionsShowBulkUpdate);
router.route('/fashion-section-bulk-update').patch(product_controller_1.fashionSectionsShowBulkUpdate);
router.route('/skincare-section-bulk-update').patch(product_controller_1.skincareSectionsShowBulkUpdate);
exports.ProductRoutes = router;
