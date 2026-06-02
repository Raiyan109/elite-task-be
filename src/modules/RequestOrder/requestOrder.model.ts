import mongoose, { Schema } from 'mongoose';
import { IRequestOrder } from './requestOrder.interface';

const RequestOrderSchema = new mongoose.Schema<IRequestOrder>(
    {
        product_id: [
            {
                type: Schema.Types.ObjectId,
                ref: 'products', // Adjust the collection name if needed
                required: true,
            },
        ],
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users', // Adjust the collection name if needed
            required: true,
        },
        requestOrder_status: {
            type: String,
            default: 'pending'
        },
        requestOrder_details: [
            {
                product_id: {
                    type: Schema.Types.ObjectId,
                    ref: "products",
                    // required: true,
                },
                requested_quantity: {
                    type: Number,
                    // required: true,
                    min: 1,
                },
            },
        ],
        requestOrder_updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'admins', // Adjust the collection name if needed
        },
    },
    {
        timestamps: true,
    }
);

export const RequestOrderModel = mongoose.model<IRequestOrder>('requestOrders', RequestOrderSchema);
