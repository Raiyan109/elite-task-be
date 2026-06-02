import { Schema, model } from "mongoose";
import { ISubcategoryInterface } from "./subcategory.interface";

// Subcategory Schema
const subcategorySchema = new Schema<ISubcategoryInterface>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "admins",
      //required: true,
    },
    subcategory_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
    },
  },
  {
    timestamps: true,
  }
);

const SubcategoryModel = model<ISubcategoryInterface>("subcategories", subcategorySchema);

export default SubcategoryModel;
