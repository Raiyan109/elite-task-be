import mongoose, { Schema } from 'mongoose';
import { ICart } from './cart.interface';

const CartItemSchema = new mongoose.Schema(
    {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    }
);

const CartSchema = new mongoose.Schema<ICart>(
    {
        cart_items: {
            type: [CartItemSchema],
            required: true,
            default: [],
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const CartModel = mongoose.model<ICart>('carts', CartSchema);
