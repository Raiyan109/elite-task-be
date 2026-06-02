"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CouponSchema = new mongoose_1.default.Schema({
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
}, {
    timestamps: true,
});
// ✅ Add index directly to the schema
CouponSchema.index({ coupon_code: 1 }, { unique: true });
exports.CouponModel = mongoose_1.default.model('coupons', CouponSchema);
