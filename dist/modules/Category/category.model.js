"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Category Schema
const categorySchema = new mongoose_1.Schema({
    category_name: {
        required: true,
        type: String,
    },
    category_slug: {
        required: true,
        type: String,
        unique: true,
    },
    category_logo: {
        required: true,
        type: String,
    },
    category_logo_key: {
        required: true,
        type: String,
    },
    category_banner: {
        type: [String],
    },
    // category_banner_key: {
    //   type: [String],
    // },
    category_other_banner: {
        type: [String],
    },
    // category_other_banner_key: {
    //   type: [String],
    // },
    category_status: {
        required: true,
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    category_serial: {
        required: true,
        type: Number,
    },
    category_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
        //required: true,
    },
    category_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
}, {
    timestamps: true,
});
// Ensure category name uniqueness
categorySchema.index({ category_name: 1 }, { unique: true });
const CategoryModel = (0, mongoose_1.model)("categories", categorySchema);
exports.default = CategoryModel;
