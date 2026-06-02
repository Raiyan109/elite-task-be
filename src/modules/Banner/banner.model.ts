import mongoose, { Schema } from 'mongoose';
import { IBanner } from './banner.interface';

const BannerSchema = new mongoose.Schema<IBanner>(
  {
    banner_image: {
      type: String,
      required: true,
    },
    banner_image_key: {
      type: String,
      required: true,
    },
    banner_status: {
      required: true,
      type: String,
      enum: ["active", "in-active"],
      default: "active",
    },
    banner_path: {
      type: String,
      // required: true,
    },
    banner_serial: {
      required: true,
      type: Number,
    },
    banner_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: "admins",
      // required: true,
    },
    banner_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "admins",
    },

    banner_position: {
      type: String,
      required: true,
      //enum: ["home-top", "home-center", "popular-products", "combo", "hot-deal", "weekday"],
      //banner_position field will be treated as common category names (e.g. --> electronics, toys etc.)
    },
  },
  {
    timestamps: true,
  }
);

export const BannerModel = mongoose.model<IBanner>('banners', BannerSchema);