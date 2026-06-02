"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPermissions = void 0;
var AdminPermissions;
(function (AdminPermissions) {
    // Dashboard
    AdminPermissions["DASHBOARD_SHOW"] = "dashboard_permission";
    // Product permissions
    AdminPermissions["PRODUCT_VIEW"] = "is_product_view";
    AdminPermissions["PRODUCT_CREATE"] = "is_product_create";
    AdminPermissions["PRODUCT_UPDATE"] = "is_product_update";
    AdminPermissions["PRODUCT_DELETE"] = "is_product_delete";
    // Category permissions
    AdminPermissions["CATEGORY_VIEW"] = "is_category_view";
    AdminPermissions["CATEGORY_CREATE"] = "is_category_create";
    AdminPermissions["CATEGORY_UPDATE"] = "is_category_update";
    AdminPermissions["CATEGORY_DELETE"] = "is_category_delete";
    // Subcategory permissions
    AdminPermissions["SUBCATEGORY_VIEW"] = "is_subcategory_view";
    AdminPermissions["SUBCATEGORY_CREATE"] = "is_subcategory_create";
    AdminPermissions["SUBCATEGORY_UPDATE"] = "is_subcategory_update";
    AdminPermissions["SUBCATEGORY_DELETE"] = "is_subcategory_delete";
    // Childcategory permissions
    AdminPermissions["CHILDCATEGORY_VIEW"] = "is_childcategory_view";
    AdminPermissions["CHILDCATEGORY_CREATE"] = "is_childcategory_create";
    AdminPermissions["CHILDCATEGORY_UPDATE"] = "is_childcategory_update";
    AdminPermissions["CHILDCATEGORY_DELETE"] = "is_childcategory_delete";
    // Staff permissions
    AdminPermissions["STAFF_VIEW"] = "is_staff_view";
    AdminPermissions["STAFF_CREATE"] = "is_staff_create";
    AdminPermissions["STAFF_UPDATE"] = "is_staff_update";
    AdminPermissions["STAFF_DELETE"] = "is_staff_delete";
    // Role permissions
    AdminPermissions["ROLE_VIEW"] = "is_role_view";
    AdminPermissions["ROLE_CREATE"] = "is_role_create";
    AdminPermissions["ROLE_UPDATE"] = "is_role_update";
    AdminPermissions["ROLE_DELETE"] = "is_role_delete";
    // Banner permissions
    AdminPermissions["BANNER_VIEW"] = "is_banner_view";
    AdminPermissions["BANNER_CREATE"] = "is_banner_create";
    AdminPermissions["BANNER_UPDATE"] = "is_banner_update";
    AdminPermissions["BANNER_DELETE"] = "is_banner_delete";
    // Settings permissions
    AdminPermissions["SETTINGS_VIEW"] = "is_settings_view";
    AdminPermissions["SETTINGS_UPDATE"] = "is_settings_update";
    // Custom Order permissions
    AdminPermissions["CUSTOM_ORDER_VIEW"] = "is_customOrder_view";
    AdminPermissions["CUSTOM_ORDER_CREATE"] = "is_customOrder_create";
    AdminPermissions["CUSTOM_ORDER_UPDATE"] = "is_customOrder_update";
    AdminPermissions["CUSTOM_ORDER_DELETE"] = "is_customOrder_delete";
    // Question permissions
    AdminPermissions["QUESTION_VIEW"] = "is_question_view";
    AdminPermissions["QUESTION_CREATE"] = "is_question_create";
    AdminPermissions["QUESTION_UPDATE"] = "is_question_update";
    AdminPermissions["QUESTION_DELETE"] = "is_question_delete";
    // Offers permissions
    AdminPermissions["OFFERS_VIEW"] = "is_offers_view";
    AdminPermissions["OFFERS_CREATE"] = "is_offers_create";
    AdminPermissions["OFFERS_UPDATE"] = "is_offers_update";
    AdminPermissions["OFFERS_DELETE"] = "is_offers_delete";
    // Combo permissions
    AdminPermissions["COMBO_VIEW"] = "is_combo_view";
    AdminPermissions["COMBO_CREATE"] = "is_combo_create";
    AdminPermissions["COMBO_UPDATE"] = "is_combo_update";
    AdminPermissions["COMBO_DELETE"] = "is_combo_delete";
    // Coupon permissions
    AdminPermissions["COUPON_VIEW"] = "is_coupon_view";
    AdminPermissions["COUPON_CREATE"] = "is_coupon_create";
    AdminPermissions["COUPON_UPDATE"] = "is_coupon_update";
    AdminPermissions["COUPON_DELETE"] = "is_coupon_delete";
    // YouTube Link permissions
    AdminPermissions["YT_LINK_VIEW"] = "is_ytLink_view";
    AdminPermissions["YT_LINK_CREATE"] = "is_ytLink_create";
    AdminPermissions["YT_LINK_UPDATE"] = "is_ytLink_update";
    AdminPermissions["YT_LINK_DELETE"] = "is_ytLink_delete";
    // Hot Deals permissions
    AdminPermissions["HOTDEAL_VIEW"] = "is_hotDeal_view";
    AdminPermissions["HOTDEAL_CREATE"] = "is_hotDeal_create";
    AdminPermissions["HOTDEAL_UPDATE"] = "is_hotDeal_update";
    AdminPermissions["HOTDEAL_DELETE"] = "is_hotDeal_delete";
    // Order permissions
    AdminPermissions["ORDER_VIEW"] = "is_order_view";
    AdminPermissions["ORDER_UPDATE"] = "is_order_update";
    // Refund Permissions
    AdminPermissions["IS_REFUND_VIEW"] = "is_refund_view";
})(AdminPermissions || (exports.AdminPermissions = AdminPermissions = {}));
