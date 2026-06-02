"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_1 = require("../modules/Admin/admin.routes");
const user_route_1 = require("../modules/User/user.route");
const webSettings_route_1 = require("../modules/WebSettings/webSettings.route");
const banner_route_1 = require("../modules/Banner/banner.route");
const category_routes_1 = require("../modules/Category/category.routes");
const subcategory_routes_1 = require("../modules/Subcategory/subcategory.routes");
const product_routes_1 = require("../modules/Product/product.routes");
const childcategory_routes_1 = require("../modules/Childcategory/childcategory.routes");
const address_route_1 = require("../modules/Address/address.route");
const role_route_1 = require("../modules/Role/role.route");
const ytLink_route_1 = require("../modules/YTLink/ytLink.route");
const review_route_1 = require("../modules/Review/review.route");
const customOrder_route_1 = require("../modules/CustomOrder/customOrder.route");
const question_route_1 = require("../modules/Question/question.route");
const cart_route_1 = require("../modules/Cart/cart.route");
const combo_route_1 = require("../modules/Combo/combo.route");
const offer_route_1 = require("../modules/Offer/offer.route");
const search_route_1 = require("../modules/Search/search.route");
const order_route_1 = require("../modules/Order/order.route");
const coupon_route_1 = require("../modules/Coupon/coupon.route");
const refund_route_1 = require("../modules/Refund/refund.route");
const hotDeal_route_1 = require("../modules/HotDeals/hotDeal.route");
const wishlist_route_1 = require("../modules/Wishlist/wishlist.route");
const app_route_1 = require("../modules/App/app.route");
const brand_routes_1 = require("../modules/Brand/brand.routes");
const requestOrder_route_1 = require("../modules/RequestOrder/requestOrder.route");
const couponNotApplied_route_1 = require("../modules/CouponNotApplied/couponNotApplied.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/auth',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/admin',
        route: admin_routes_1.AdminRegRoutes,
    },
    {
        path: '/role',
        route: role_route_1.RoleRoutes,
    },
    {
        path: '/web-settings',
        route: webSettings_route_1.WebSettingsRoutes,
    },
    {
        path: '/banner',
        route: banner_route_1.BannerRoutes,
    },
    {
        path: '/ytLink',
        route: ytLink_route_1.YTLinkRoutes,
    },
    {
        path: '/category',
        route: category_routes_1.CategoryRoutes,
    },
    {
        path: '/subcategory',
        route: subcategory_routes_1.SubcategoryRoutes,
    },
    {
        path: '/childcategory',
        route: childcategory_routes_1.ChildcategoryRoutes,
    },
    {
        path: '/product',
        route: product_routes_1.ProductRoutes,
    },
    {
        path: '/address',
        route: address_route_1.AddressRoutes,
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes,
    },
    {
        path: '/question',
        route: question_route_1.QuestionRoutes,
    },
    {
        path: '/custom-order',
        route: customOrder_route_1.CustomOrderRoutes,
    },
    {
        path: '/cart',
        route: cart_route_1.CartRoutes,
    },
    {
        path: '/combo',
        route: combo_route_1.ComboRoutes,
    },
    {
        path: '/hotDeal',
        route: hotDeal_route_1.HotDealRoutes,
    },
    {
        path: '/offer',
        route: offer_route_1.OfferRoutes,
    },
    {
        path: '/search',
        route: search_route_1.SearchRoutes,
    },
    {
        path: '/order',
        route: order_route_1.OrderRoutes,
    },
    {
        path: '/coupon',
        route: coupon_route_1.CouponRoutes,
    },
    {
        path: '/refund',
        route: refund_route_1.RefundRoutes,
    },
    {
        path: '/wishlist',
        route: wishlist_route_1.WishlistRoutes,
    },
    {
        path: '/requestOrder',
        route: requestOrder_route_1.RequestOrderRoutes,
    },
    {
        path: '/app',
        route: app_route_1.AppRoutes,
    },
    {
        path: '/brand',
        route: brand_routes_1.BrandRoutes,
    },
    {
        path: '/coupon-not-applied',
        route: couponNotApplied_route_1.CouponNotAppliedRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
