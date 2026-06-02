import { Schema, model } from "mongoose";
import { IChildcategoryInterface } from "./childcategory.interface";

// Childcategory Schema
const childcategorySchema = new Schema<IChildcategoryInterface>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "admins",
      //required: true,
    },
    childcategory_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
    },
    subcategory_id: {
      type: Schema.Types.ObjectId,
      ref: "subcategories",
    },
  },
  {
    timestamps: true,
  }
);

const ChildcategoryModel = model<IChildcategoryInterface>("childcategories", childcategorySchema);

export default ChildcategoryModel;
