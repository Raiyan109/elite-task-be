"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Subcategory Schema
const subcategorySchema = new mongoose_1.Schema({
    subcategory_name: {
        required: true,
        type: String,
    },
    subcategory_slug: {
        required: true,
        type: String,
        unique: true,
    },
    subcategory_logo: {
        required: true,
        type: String,
    },
    subcategory_logo_key: {
        required: true,
        type: String,
    },
    subcategory_banner: {
        type: [String],
    },
    subcategory_banner_key: {
        type: [String],
    },
    subcategory_status: {
        required: true,
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    subcategory_serial: {
        required: true,
        type: Number,
    },
    subcategory_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
        //required: true,
    },
    subcategory_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "categories",
    },
}, {
    timestamps: true,
});
const SubcategoryModel = (0, mongoose_1.model)("subcategories", subcategorySchema);
exports.default = SubcategoryModel;
