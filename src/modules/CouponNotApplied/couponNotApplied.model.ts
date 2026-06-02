import mongoose, { Schema } from 'mongoose';
import { ICouponNotApplied } from './couponNotApplied.interface';

// Define the sub-schema for coupon not applied products
const CouponNotAppliedProducts = new Schema(
    {
        product_id: {
            type: Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
    },
    { _id: false } // Disable _id for each subdocument
);

// Define the main coupon_not_applied schema
const CouponNotAppliedSchema = new Schema<ICouponNotApplied>(
    {
        coupon_not_applied_products: {
            type: [CouponNotAppliedProducts],
            required: true,
        },
        coupon_not_applied_publisher_id: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
        coupon_not_applied_updated_by: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
        // is_delivery_dhaka_only: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    {
        timestamps: true, // creates createdAt and updatedAt fields
    }
);

// ✅ Index on array field (exactly the index you need for your coupon eligibility check.)
CouponNotAppliedSchema.index({ "coupon_not_applied_products.product_id": 1 });

// Export the model
export const CouponNotAppliedModel = mongoose.model<ICouponNotApplied>('couponnotapplieds', CouponNotAppliedSchema);
