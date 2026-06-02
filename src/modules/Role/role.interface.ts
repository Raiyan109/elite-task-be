export interface IRole {
  _id?: string; // Optional if not yet stored in DB
  admin_role: string;

  // Product permissions
  is_product_view: boolean;
  is_product_create: boolean;
  is_product_update: boolean;
  is_product_delete: boolean;

  // Category permissions
  is_category_view: boolean;
  is_category_create: boolean;
  is_category_update: boolean;
  is_category_delete: boolean;

  // Subcategory permissions
  is_subcategory_view: boolean;
  is_subcategory_create: boolean;
  is_subcategory_update: boolean;
  is_subcategory_delete: boolean;

  // Childcategory permissions
  is_childcategory_view: boolean;
  is_childcategory_create: boolean;
  is_childcategory_update: boolean;
  is_childcategory_delete: boolean;

  // Staff permissions
  is_staff_view: boolean;
  is_staff_create: boolean;
  is_staff_update: boolean;
  is_staff_delete: boolean;

  // Role permissions
  is_role_view: boolean;
  is_role_create: boolean;
  is_role_update: boolean;
  is_role_delete: boolean;

  // Banner permissions
  is_banner_view: boolean;
  is_banner_create: boolean;
  is_banner_update: boolean;
  is_banner_delete: boolean;

  // Hot deals permissions
  is_hotDeal_view: boolean;
  is_hotDeal_create: boolean;
  is_hotDeal_update: boolean;
  is_hotDeal_delete: boolean;

  // Settings permissions (View/Update only)
  is_settings_view: boolean;
  is_settings_update: boolean;

  // Custom order permissions
  is_customOrder_view: boolean;
  is_customOrder_update: boolean;

  // Order permissions
  is_order_view: boolean;
  is_order_update: boolean;

  // Question permissions
  is_question_view: boolean;
  is_question_create: boolean;
  is_question_update: boolean;
  is_question_delete: boolean;

  // Offers permissions
  is_offers_view: boolean;
  is_offers_create: boolean;
  is_offers_update: boolean;
  is_offers_delete: boolean;

  // Combo offer permissions
  is_combo_view: boolean;
  is_combo_create: boolean;
  is_combo_update: boolean;
  is_combo_delete: boolean;

  // Coupon permissions
  is_coupon_view: boolean;
  is_coupon_create: boolean;
  is_coupon_update: boolean;
  is_coupon_delete: boolean;

  // ytLink permissions
  is_ytLink_view: boolean;
  is_ytLink_create: boolean;
  is_ytLink_update: boolean;
  is_ytLink_delete: boolean;

  //refund permissions
  is_refund_view: boolean;
  is_refund_update: boolean;

  // Optional: dashboard access control
  dashboard_permission?: boolean; // or an enum if you define multiple dashboards
}
