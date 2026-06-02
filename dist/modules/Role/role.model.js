"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RoleSchema = new mongoose_1.default.Schema({
    admin_role: {
        type: String,
        required: true,
    },
    // Product permissions
    is_product_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_product_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_product_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_product_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Category permissions
    is_category_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_category_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_category_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_category_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Subcategory permissions
    is_subcategory_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_subcategory_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_subcategory_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_subcategory_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Childcategory permissions
    is_childcategory_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_childcategory_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_childcategory_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_childcategory_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Staff permissions
    is_staff_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_staff_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_staff_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_staff_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Role permissions
    is_role_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_role_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_role_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_role_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Banner permissions
    is_banner_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_banner_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_banner_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_banner_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Custom order permissions
    is_customOrder_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // is_customOrder_create: {
    //   type: Boolean,
    //   //required: true,
    //   //default: false
    // },
    is_customOrder_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // is_customOrder_delete: {
    //   type: Boolean,
    //   //required: true,
    //   //default: false
    // },
    // Question permissions
    is_question_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_question_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_question_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_question_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Offers permissions
    is_offers_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_offers_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_offers_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_offers_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Combo permissions
    is_combo_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_combo_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_combo_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_combo_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Coupon permissions
    is_coupon_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_coupon_create: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_coupon_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_coupon_delete: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Settings permissions
    is_settings_view: {
        type: Boolean,
        //required: true,
        //default: false
    },
    is_settings_update: {
        type: Boolean,
        //required: true,
        //default: false
    },
    // Dashboard permission
    dashboard_permission: {
        type: Boolean,
        //required: false
    },
    is_ytLink_view: {
        type: Boolean,
        //required: false
    },
    is_ytLink_create: {
        type: Boolean,
        //required: false
    },
    is_ytLink_update: {
        type: Boolean,
        //required: false
    },
    is_ytLink_delete: {
        type: Boolean,
        //required: false
    },
    is_hotDeal_view: Boolean,
    is_hotDeal_create: Boolean,
    is_hotDeal_update: Boolean,
    is_hotDeal_delete: Boolean,
    is_order_view: Boolean,
    is_order_update: Boolean,
    is_refund_view: {
        type: Boolean,
        //required: false
    },
}, {
    timestamps: true
});
exports.RoleModel = mongoose_1.default.model('roles', RoleSchema);
