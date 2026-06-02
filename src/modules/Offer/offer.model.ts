import mongoose, { Schema } from 'mongoose';
import { IOffer } from './offer.interface';

// Define the sub-schema for offer_products
const OfferProductSchema = new Schema(
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
        // product_quantity: {
        //     type: Number,
        //     required: true,
        // },
    },
);

// Define the main offer schema
const OfferSchema = new Schema<IOffer>(
    {
        offer_label: {
            type: String,
            enum: ["weekday", "monthly"],
            required: true,
        },
        offer_title: {
            type: String,
            required: true,
        },
        offer_description: {
            type: String,
        },
        offer_start_date: {
            type: String,
        },
        offer_end_date: {
            type: String,
        },
        offer_slug: {
            type: String,
        },
        offer_status: {
            type: String,
            default: 'active'
        },
        offer_image: {
            type: String,
        },
        offer_image_key: {
            type: String,
        },
        offer_product: {
            type: OfferProductSchema,
            required: true,
        },
        // offer_products: {
        //     type: [OfferProductsSchema],
        //     required: true,
        // },
        offer_publisher_id: {
            type: Schema.Types.ObjectId,
            ref: 'admins',
        },
        offer_updated_by: {
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
export const OfferModel = mongoose.model<IOffer>('offers', OfferSchema);
