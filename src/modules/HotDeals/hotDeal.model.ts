import mongoose, { Schema } from 'mongoose';
import { IHotDeal } from './hotDeal.interface';

const HotDealProductsSchema = new mongoose.Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    discount_amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const HotDealSchema = new mongoose.Schema<IHotDeal>(
  {
    hotDeal_title: {
      type: String,
      required: true,
    },
    hotDeal_description: {
      type: String,
    },
    hotDeal_slug: {
      type: String,
      unique: true,
    },
    hotDeal_start_date: {
      type: Date,
    },
    hotDeal_end_date: {
      type: Date,
    },
    hotDeal_status: {
      type: String,
      enum: ['active', 'in-active'],
      required: true,
      default: 'active',
    },
    hotDeal_image: {
      type: String,
    },
    hotDeal_image_key: {
      type: String,
    },
    hotDeal_products: {
      type: [HotDealProductsSchema],
      required: true,
    },
    hotDeal_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: 'admins',
    },
    hotDeal_updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'admins',
    },
    is_delivery_dhaka_only: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// speeds up filtering by active + date range.
HotDealSchema.index({ hotDeal_status: 1, hotDeal_start_date: 1, hotDeal_end_date: 1 })

// speeds up lookup by product IDs inside the array.
HotDealSchema.index({ "hotDeal_products.product_id": 1 })

export const HotDealModel = mongoose.model<IHotDeal>('hotDeals', HotDealSchema);
