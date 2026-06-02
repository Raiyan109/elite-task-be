"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Product Schema
const productSchema = new mongoose_1.Schema({
    product_name: {
        required: true,
        type: String,
    },
    product_slug: {
        required: true,
        type: String,
        unique: true,
    },
    product_sku: {
        type: String,
    },
    product_status: {
        required: true,
        type: String,
        enum: ["active", "in-active", "temporary-in-active"],
        default: "active",
    },
    product_inactivity_start: {
        type: String,
    },
    product_inactivity_end: {
        type: String,
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "categories",
        required: true,
    },
    subcategory_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "subcategories",
    },
    childcategory_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "childcategories",
    },
    // attributes_details: [
    //   {
    //     attribute_name: {
    //       type: String,
    //     },
    //     attribute_values: [
    //       {
    //         attribute_value_name: {
    //           type: String,
    //         },
    //       },
    //     ],
    //   },
    // ],
    product_barcode: {
        type: String,
    },
    product_barcode_image: {
        type: String,
    },
    description: {
        type: String,
    },
    thumbnail_image: {
        type: String,
        required: true, // Assuming thumbnail image is required
    },
    thumbnail_image_key: {
        type: String,
    },
    additional_images: [
        {
            additional_image: {
                type: String,
            },
            additional_image_key: {
                type: String,
            },
        },
    ],
    product_price: {
        type: Number,
    },
    product_buying_price: {
        type: Number,
    },
    product_discount_price: {
        type: Number,
        default: null, // unlimited if not specified
        min: 0,
    },
    // product_quantity: {
    //   type: String,
    // },
    product_quantity: {
        type: Number,
        default: null, // unlimited if not specified
        min: 0,
    },
    product_alert_quantity: {
        type: Number,
    },
    // is_variation: {
    //   type: Boolean,
    //   default: false, // Default value can be added
    // },
    product_warrenty: {
        type: String,
    },
    product_return: {
        type: String,
    },
    unit: {
        type: String,
    },
    unit_quantity: {
        type: Number,
    },
    meta_title: {
        type: String,
    },
    meta_description: {
        type: String,
    },
    meta_keywords: [
        {
            keyword: {
                type: String,
            },
        },
    ],
    product_delivery_time: {
        type: String,
    },
    product_is_delivery_dhaka_only: {
        type: Boolean,
    },
    popular_product_show: {
        type: Boolean,
    },
    bestselling_product_show: {
        type: Boolean,
    },
    product_order_count: {
        type: Number,
        default: 0,
    },
    offered_product_show: {
        type: Boolean,
        default: false,
    },
    product_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    product_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    // product_campaign_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: "campaigns",
    // },
    // product_supplier_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: "suppliers",
    // },
    video_url: {
        type: String,
    },
    discount_show: {
        type: String,
        // enum: ['flat', 'percent']
    },
    // is_flat_discount_show:{
    //   type: Boolean,
    // },
    // is_percent_discount_show:{
    //   type: Boolean,
    // },
    brand_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "brands",
    },
    pharmacy_section_1_show: {
        type: Boolean,
    },
    pharmacy_section_2_show: {
        type: Boolean,
    },
    pharmacy_section_3_show: {
        type: Boolean,
    },
    pharmacy_section_4_show: {
        type: Boolean,
    },
    pharmacy_section_5_show: {
        type: Boolean,
    },
    pharmacy_section_6_show: {
        type: Boolean,
    },
    skincare_section_1_show: {
        type: Boolean,
    },
    skincare_section_2_show: {
        type: Boolean,
    },
    skincare_section_3_show: {
        type: Boolean,
    },
    skincare_section_4_show: {
        type: Boolean,
    },
    skincare_section_5_show: {
        type: Boolean,
    },
    skincare_section_6_show: {
        type: Boolean,
    },
    fashion_section_1_show: {
        type: Boolean,
    },
    fashion_section_2_show: {
        type: Boolean,
    },
    fashion_section_3_show: {
        type: Boolean,
    },
    fashion_section_4_show: {
        type: Boolean,
    },
    fashion_section_5_show: {
        type: Boolean,
    },
    fashion_section_6_show: {
        type: Boolean,
    },
}, {
    timestamps: true,
});
// General category + status queries
productSchema.index({ category_id: 1, product_status: 1 });
// Popular products
productSchema.index({ category_id: 1, product_status: 1, product_order_count: -1 });
// Offered products
productSchema.index({ category_id: 1, product_status: 1, offered_product_show: 1 });
// New uploaded products
productSchema.index({ category_id: 1, product_status: 1, createdAt: -1 });
// Brand-specific queries
productSchema.index({ category_id: 1, product_status: 1, brand_id: 1 });
// Pharmacy sections
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_1_show: 1 });
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_2_show: 1 });
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_3_show: 1 });
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_4_show: 1 });
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_5_show: 1 });
productSchema.index({ category_id: 1, product_status: 1, pharmacy_section_6_show: 1 });
const ProductModel = (0, mongoose_1.model)("products", productSchema);
exports.default = ProductModel;
