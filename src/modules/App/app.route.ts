import express from 'express';

import { AppControllers, findFilteredCategoriesApp, getCommonCategoryDataApp } from './app.controller';
import { auth } from '../../middlewares/auth';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';


const router = express.Router();

// get user active category and post update delete category
router.route("/banner-reels")
    .get(AppControllers.findBannerAndReels)
router.route("/products/:category")
    .get(AppControllers.findCategoryWiseProducts)
router.route("/subcategories/:category")
    .get(AppControllers.findCategoryWiseSubcategories)
// Case 1: Only category → get subcategories
router.route("/subcategories-only/:category")
    .get(AppControllers.findCategoryWiseOnlySubcategories);
// Case 2: Category + subcategory → get childcategories
router.route("/subcategories-only/:category/:subcategory_id")
    .get(AppControllers.findCategoryWiseOnlySubcategories);
router.route("/products/:category/:section")
    .get(AppControllers.findCategorySectionWiseAllProducts)
router.route("/popular")
    .get(AppControllers.findAllPopularProducts)
router.route("/offered")
    .get(AppControllers.findAllOfferedProducts)
router.route("/hotDeal")
    .get(AppControllers.findAllHotDealsProducts)
router.route("/combos")
    .get(AppControllers.findAllComboProducts)
router.route("/nestle")
    .get(AppControllers.findAllNestleBrandProducts)
router.route("/unilever")
    .get(AppControllers.findAllUnileverBrandProducts)
router.route("/product/:id")
    .get(AppControllers.findSingleProduct)
router.route("/combo/:id")
    .get(AppControllers.findSingleCombo)
router.route('/common-category-products-app/:category_slug')
    .get(getCommonCategoryDataApp)

router.route('/product')
    .get(AppControllers.findAllProductApp)

//common categories
router.route("/category/common")
    .get(findFilteredCategoriesApp);

//get logged in user info
router.get("/user-profile", auth('user'), AppControllers.findUserById)

router.patch('/user-profile', FileUploadHelper.ImageUpload.fields([
    { name: "user_profile", maxCount: 1 },
]), auth('user'), AppControllers.updateUserProfile)

router.get('/user/recent-transactions', auth('user'), AppControllers.findRecentTransactionsByUserId)

router.get('/user/my-orders', auth('user'), AppControllers.findMyOrdersByUserId)

router.route('/user-refund')
    .get(auth('user'), AppControllers.findRefundByUserId)

router.route('/user/address')
    .get(auth('user'), AppControllers.getAddressApp)

router.get("/user/user-name-wallet", auth('user'), AppControllers.getUserNameWalletAmount);

export const AppRoutes = router;