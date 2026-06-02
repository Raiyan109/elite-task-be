import { z } from 'zod';
import { Types } from "mongoose";

export const BrandSchema = z.object({
  _id: z.any().optional(), // Allowing any type for _id (MongoDB ObjectId usually)
  brand_name: z.string().min(1, "Brand name is required"),
  brand_slug: z.string().min(1, "Brand slug is required"),
  brand_logo: z.string().url("Invalid URL format for brand logo"),
  brand_logo_key: z.string().min(1, "Brand logo key is required"),
  brand_status: z.enum(["active", "in-active"]),
  brand_serial: z.number().int().positive("Brand serial must be a positive integer"),
  brand_publisher_id: z.union([z.instanceof(Types.ObjectId), z.any()]).optional(),
  brand_updated_by: z.union([z.instanceof(Types.ObjectId), z.any()]).optional(),
});

export const UpdateBrandSchema = z.object({
  _id: z.any().optional(), // Allowing any type for _id (MongoDB ObjectId usually)
  brand_name: z.string().min(1, "Brand name is required").optional(),
  brand_slug: z.string().min(1, "Brand slug is required").optional(),
  brand_logo: z.string().url("Invalid URL format for brand logo").optional(),
  brand_logo_key: z.string().min(1, "Brand logo key is required").optional(),
  brand_status: z.enum(["active", "in-active"]).optional(),
  brand_serial: z.number().int().positive("Brand serial must be a positive integer").optional(),
  brand_publisher_id: z.union([z.instanceof(Types.ObjectId), z.any()]).optional(),
  brand_updated_by: z.union([z.instanceof(Types.ObjectId), z.any()]).optional(),
});


export const BrandValidation = {
  BrandSchema,
  UpdateBrandSchema
};