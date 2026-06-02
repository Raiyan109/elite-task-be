"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Childcategory Schema
const childcategorySchema = new mongoose_1.Schema({
    childcategory_name: {
        required: true,
        type: String,
    },
    childcategory_slug: {
        required: true,
        type: String,
        unique: true,
    },
    childcategory_logo: {
        required: true,
        type: String,
    },
    childcategory_logo_key: {
        required: true,
        type: String,
    },
    childcategory_banner: {
        type: [String],
    },
    childcategory_banner_key: {
        type: [String],
    },
    childcategory_status: {
        required: true,
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    childcategory_serial: {
        required: true,
        type: Number,
    },
    childcategory_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
        //required: true,
    },
    childcategory_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    category_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "categories",
    },
    subcategory_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "subcategories",
    },
}, {
    timestamps: true,
});
const ChildcategoryModel = (0, mongoose_1.model)("childcategories", childcategorySchema);
exports.default = ChildcategoryModel;
