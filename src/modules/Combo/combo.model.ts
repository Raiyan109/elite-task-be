import mongoose, { Schema } from 'mongoose';
import { ICombo } from './combo.interface';

// Define the sub-schema for combo_products
const ComboProductsSchema = new Schema(
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
        product_quantity: {
            type: Number,
            required: true,
        },
        combo_price: {
            type: Number,
            required: true,
        },
    },
);

// Define the main combo schema
const ComboSchema = new Schema<ICombo>(
    {
        combo_title: {
            type: String,
            required: true,
        },
        combo_description: {
            type: String,
        },
        combo_slug: {
            type: String,
        },
        combo_status: {
            type: String,
            default: 'active'
        },
        combo_image: {
            type: String,
        },
        combo_image_key: {
            type: String,
        },
        combo_products: {
            type: [ComboProductsSchema],
            required: true,
        },
        combo_publisher_id: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
        combo_updated_by: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
        is_delivery_dhaka_only: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // creates createdAt and updatedAt fields
    }
);

// Export the model
export const ComboModel = mongoose.model<ICombo>('combos', ComboSchema);
