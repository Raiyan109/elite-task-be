import mongoose, { Schema } from 'mongoose';
import { IRefund } from './refund.interface';

const RefundSchema = new mongoose.Schema<IRefund>(
    {
        refund_images: {
            type: [String],  // Array of strings
        },
        refund_images_key: {
            type: [String],
        },
        refund_reason: {
            type: String,
        },
        order_id: {
            type: String
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        refund_status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        refund_amount: {
            type: Number,
            default: 0,
        },
        refund_message: {
            type: String,
        },
        refund_updated_by: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
    },
    {
        timestamps: true,
    }
);

export const RefundModel = mongoose.model<IRefund>('refunds', RefundSchema);
