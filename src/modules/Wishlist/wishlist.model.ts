import mongoose, { Schema } from 'mongoose';
import { IWishlist } from './wishlist.interface';

const WishlistSchema = new mongoose.Schema<IWishlist>(
    {
        product_id: [
            {
                type: Schema.Types.ObjectId,
                ref: 'products', // just a reference for consistency, but backend will check combos too
                required: true,
            },
        ],
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users', // Adjust the collection name if needed
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const WishlistModel = mongoose.model<IWishlist>('wishlists', WishlistSchema);
