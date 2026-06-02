"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandValidation = exports.UpdateBrandSchema = exports.BrandSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.BrandSchema = zod_1.z.object({
    _id: zod_1.z.any().optional(), // Allowing any type for _id (MongoDB ObjectId usually)
    brand_name: zod_1.z.string().min(1, "Brand name is required"),
    brand_slug: zod_1.z.string().min(1, "Brand slug is required"),
    brand_logo: zod_1.z.string().url("Invalid URL format for brand logo"),
    brand_logo_key: zod_1.z.string().min(1, "Brand logo key is required"),
    brand_status: zod_1.z.enum(["active", "in-active"]),
    brand_serial: zod_1.z.number().int().positive("Brand serial must be a positive integer"),
    brand_publisher_id: zod_1.z.union([zod_1.z.instanceof(mongoose_1.Types.ObjectId), zod_1.z.any()]).optional(),
    brand_updated_by: zod_1.z.union([zod_1.z.instanceof(mongoose_1.Types.ObjectId), zod_1.z.any()]).optional(),
});
exports.UpdateBrandSchema = zod_1.z.object({
    _id: zod_1.z.any().optional(), // Allowing any type for _id (MongoDB ObjectId usually)
    brand_name: zod_1.z.string().min(1, "Brand name is required").optional(),
    brand_slug: zod_1.z.string().min(1, "Brand slug is required").optional(),
    brand_logo: zod_1.z.string().url("Invalid URL format for brand logo").optional(),
    brand_logo_key: zod_1.z.string().min(1, "Brand logo key is required").optional(),
    brand_status: zod_1.z.enum(["active", "in-active"]).optional(),
    brand_serial: zod_1.z.number().int().positive("Brand serial must be a positive integer").optional(),
    brand_publisher_id: zod_1.z.union([zod_1.z.instanceof(mongoose_1.Types.ObjectId), zod_1.z.any()]).optional(),
    brand_updated_by: zod_1.z.union([zod_1.z.instanceof(mongoose_1.Types.ObjectId), zod_1.z.any()]).optional(),
});
exports.BrandValidation = {
    BrandSchema: exports.BrandSchema,
    UpdateBrandSchema: exports.UpdateBrandSchema
};
