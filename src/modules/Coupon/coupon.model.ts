import mongoose from 'mongoose';
import { ICoupon } from './coupon.interface';

const CouponSchema = new mongoose.Schema<ICoupon>(
    {
        coupon_code: {
            type: String,
            required: true,
            unique: true,
        },
        coupon_start_date: {
            type: String,
            required: true,
        },
        coupon_end_date: {
            type: String,
            required: true,
        },
        coupon_discount_amount: {
            type: Number,
            required: true,
        },
        coupon_min_order: {
            type: Number,
            required: true,
        },
        coupon_status: {
            type: String,
            required: true,
            enum: ['active', 'expired', 'in-active'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);


// ✅ Add index directly to the schema
CouponSchema.index({ coupon_code: 1 }, { unique: true });

export const CouponModel = mongoose.model<ICoupon>('coupons', CouponSchema);
