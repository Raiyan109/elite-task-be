export enum AdminPermissions {
    // Dashboard
    DASHBOARD_SHOW = 'dashboard_permission',

    // Product permissions
    PRODUCT_VIEW = 'is_product_view',
    PRODUCT_CREATE = 'is_product_create',
    PRODUCT_UPDATE = 'is_product_update',
    PRODUCT_DELETE = 'is_product_delete',

    // Category permissions
    CATEGORY_VIEW = 'is_category_view',
    CATEGORY_CREATE = 'is_category_create',
    CATEGORY_UPDATE = 'is_category_update',
    CATEGORY_DELETE = 'is_category_delete',

    // Subcategory permissions
    SUBCATEGORY_VIEW = 'is_subcategory_view',
    SUBCATEGORY_CREATE = 'is_subcategory_create',
    SUBCATEGORY_UPDATE = 'is_subcategory_update',
    SUBCATEGORY_DELETE = 'is_subcategory_delete',

    // Childcategory permissions
    CHILDCATEGORY_VIEW = 'is_childcategory_view',
    CHILDCATEGORY_CREATE = 'is_childcategory_create',
    CHILDCATEGORY_UPDATE = 'is_childcategory_update',
    CHILDCATEGORY_DELETE = 'is_childcategory_delete',

    // Staff permissions
    STAFF_VIEW = 'is_staff_view',
    STAFF_CREATE = 'is_staff_create',
    STAFF_UPDATE = 'is_staff_update',
    STAFF_DELETE = 'is_staff_delete',

    // Role permissions
    ROLE_VIEW = 'is_role_view',
    ROLE_CREATE = 'is_role_create',
    ROLE_UPDATE = 'is_role_update',
    ROLE_DELETE = 'is_role_delete',

    // Banner permissions
    BANNER_VIEW = 'is_banner_view',
    BANNER_CREATE = 'is_banner_create',
    BANNER_UPDATE = 'is_banner_update',
    BANNER_DELETE = 'is_banner_delete',

    // Settings permissions
    SETTINGS_VIEW = 'is_settings_view',
    SETTINGS_UPDATE = 'is_settings_update',

    // Custom Order permissions
    CUSTOM_ORDER_VIEW = 'is_customOrder_view',
    CUSTOM_ORDER_CREATE = 'is_customOrder_create',
    CUSTOM_ORDER_UPDATE = 'is_customOrder_update',
    CUSTOM_ORDER_DELETE = 'is_customOrder_delete',


    // Question permissions
    QUESTION_VIEW = 'is_question_view',
    QUESTION_CREATE = 'is_question_create',
    QUESTION_UPDATE = 'is_question_update',
    QUESTION_DELETE = 'is_question_delete',

    // Offers permissions
    OFFERS_VIEW = 'is_offers_view',
    OFFERS_CREATE = 'is_offers_create',
    OFFERS_UPDATE = 'is_offers_update',
    OFFERS_DELETE = 'is_offers_delete',

    // Combo permissions
    COMBO_VIEW = 'is_combo_view',
    COMBO_CREATE = 'is_combo_create',
    COMBO_UPDATE = 'is_combo_update',
    COMBO_DELETE = 'is_combo_delete',

    // Coupon permissions
    COUPON_VIEW = 'is_coupon_view',
    COUPON_CREATE = 'is_coupon_create',
    COUPON_UPDATE = 'is_coupon_update',
    COUPON_DELETE = 'is_coupon_delete',

    // YouTube Link permissions
    YT_LINK_VIEW = 'is_ytLink_view',
    YT_LINK_CREATE = 'is_ytLink_create',
    YT_LINK_UPDATE = 'is_ytLink_update',
    YT_LINK_DELETE = 'is_ytLink_delete',

    // Hot Deals permissions
    HOTDEAL_VIEW = 'is_hotDeal_view',
    HOTDEAL_CREATE = 'is_hotDeal_create',
    HOTDEAL_UPDATE = 'is_hotDeal_update',
    HOTDEAL_DELETE = 'is_hotDeal_delete',


    // Order permissions
    ORDER_VIEW = 'is_order_view',
    ORDER_UPDATE = 'is_order_update',

    // Refund Permissions
    IS_REFUND_VIEW = 'is_refund_view'


}
