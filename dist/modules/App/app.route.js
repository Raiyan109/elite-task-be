"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = __importDefault(require("express"));
const app_controller_1 = require("./app.controller");
const auth_1 = require("../../middlewares/auth");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/banner-reels")
    .get(app_controller_1.AppControllers.findBannerAndReels);
router.route("/products/:category")
    .get(app_controller_1.AppControllers.findCategoryWiseProducts);
router.route("/subcategories/:category")
    .get(app_controller_1.AppControllers.findCategoryWiseSubcategories);
// Case 1: Only category → get subcategories
router.route("/subcategories-only/:category")
    .get(app_controller_1.AppControllers.findCategoryWiseOnlySubcategories);
// Case 2: Category + subcategory → get childcategories
router.route("/subcategories-only/:category/:subcategory_id")
    .get(app_controller_1.AppControllers.findCategoryWiseOnlySubcategories);
router.route("/products/:category/:section")
    .get(app_controller_1.AppControllers.findCategorySectionWiseAllProducts);
router.route("/popular")
    .get(app_controller_1.AppControllers.findAllPopularProducts);
router.route("/offered")
    .get(app_controller_1.AppControllers.findAllOfferedProducts);
router.route("/hotDeal")
    .get(app_controller_1.AppControllers.findAllHotDealsProducts);
router.route("/combos")
    .get(app_controller_1.AppControllers.findAllComboProducts);
router.route("/nestle")
    .get(app_controller_1.AppControllers.findAllNestleBrandProducts);
router.route("/unilever")
    .get(app_controller_1.AppControllers.findAllUnileverBrandProducts);
router.route("/product/:id")
    .get(app_controller_1.AppControllers.findSingleProduct);
router.route("/combo/:id")
    .get(app_controller_1.AppControllers.findSingleCombo);
router.route('/common-category-products-app/:category_slug')
    .get(app_controller_1.getCommonCategoryDataApp);
router.route('/product')
    .get(app_controller_1.AppControllers.findAllProductApp);
//common categories
router.route("/category/common")
    .get(app_controller_1.findFilteredCategoriesApp);
//get logged in user info
router.get("/user-profile", (0, auth_1.auth)('user'), app_controller_1.AppControllers.findUserById);
router.patch('/user-profile', FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([
    { name: "user_profile", maxCount: 1 },
]), (0, auth_1.auth)('user'), app_controller_1.AppControllers.updateUserProfile);
router.get('/recent-transactions/user/:user_id', app_controller_1.AppControllers.findRecentOrdersByUserId);
router.get('/my-orders/user/:user_id', app_controller_1.AppControllers.findMyOrdersByUserId);
router.route('/user-refund')
    .get((0, auth_1.auth)('user'), app_controller_1.AppControllers.findRefundByUserId);
exports.AppRoutes = router;
