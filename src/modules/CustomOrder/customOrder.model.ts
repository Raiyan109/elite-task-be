import mongoose, { Schema } from 'mongoose';
import { ICustomOrder } from './customOrder.interface';

const CustomOrderSchema = new mongoose.Schema<ICustomOrder>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        product_image: {
            type: String,
        },
        product_image_key: {
            type: String,
        },
        product_description: {
            type: String,
            required: true,
        },
        customOrder_status: {
            type: String,
            required: true,
            enum: ['pending', 'processing', 'completed', 'cancelled'], // add/change statuses as needed
            default: 'pending',
        },
        customer_phone: {
            type: String
        },
        customer_address: {
            type: String
        },
    },
    {
        timestamps: true,
    }
);

export const CustomOrderModel = mongoose.model<ICustomOrder>('custom_orders', CustomOrderSchema);
