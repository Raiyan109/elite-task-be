import mongoose, { Schema } from 'mongoose';
import { IBrand } from './brand.interface';


const BrandSchema = new mongoose.Schema<IBrand>(
  {
    brand_name: {
      required: true,
      type: String,
    },
    brand_slug: {
      required: true,
      type: String,
      unique: true,
    },
    brand_logo: {
      type: String,
    },
    brand_logo_key: {
      type: String,
    },
    brand_status: {
      required: true,
      type: String,
      enum: ["active", "in-active"],
      default: "active",
    },
    brand_serial: {
      required: true,
      type: Number,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
    },
    brand_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      // required: true,
    },
    brand_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure brand name uniqueness
BrandSchema.index({ brand_name: 1 }, { unique: true });

export const BrandModel = mongoose.model<IBrand>('brands', BrandSchema);