import mongoose, { Schema } from 'mongoose';
import { IReview } from './review.interface';

const ReviewSchema = new mongoose.Schema<IReview>(
  {
    review_comment: {
      type: String,
      // required: true,
    },
    review_rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review_status: {
      type: String,
      required: true,
      enum: ['active', 'in-active'],
      default: 'active',
    },
    review_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    review_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'products',
    },
    review_combo_id: {
      type: Schema.Types.ObjectId,
      ref: 'combos',
    },
  },
  {
    timestamps: true,
  }
);

export const ReviewModel = mongoose.model<IReview>('reviews', ReviewSchema);
