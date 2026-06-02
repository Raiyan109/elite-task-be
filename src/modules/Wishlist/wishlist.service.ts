import { WishlistModel } from './wishlist.model';
import { IWishlist } from './wishlist.interface';
import { Types } from 'mongoose';
import { checkProductAvailability } from '../../utils/checkAvailability';
import { IProductInterface } from '../Product/product.interface';
import ProductModel from '../Product/product.model';
import { ComboModel } from '../Combo/combo.model';

// CREATE Wishlist
const postWishlistService = async (payload: IWishlist): Promise<IWishlist> => {
    const existingWishlist = await WishlistModel.findOne({ user_id: payload.user_id });

    if (existingWishlist) {
        // const alreadyExists = existingWishlist.product_id.includes(payload.product_id as any);

        const alreadyExists = existingWishlist.product_id.some((pid) => {
            const id = typeof pid === 'object' && 'toString' in pid ? pid.toString() : String(pid);
            return id === payload.product_id.toString();
        });

        if (alreadyExists) {
            throw new Error('Product already in wishlist');
        }

        existingWishlist.product_id.push(payload.product_id as any);
        await existingWishlist.save();
        return existingWishlist;
    } else {
        const newWishlist = await WishlistModel.create({
            user_id: payload.user_id,
            product_id: [payload.product_id],
        });
        return newWishlist;
    }
};

// GET Wishlist (by user ID)
const getWishlistService = async (userId: Types.ObjectId) => {
    // 1. Fetch the wishlist document
    const wishlist = await WishlistModel.findOne({ user_id: userId }).lean();
    if (!wishlist || !wishlist.product_id?.length) return { product_id: [] };

    const ids = wishlist.product_id;

    // 2. Fetch all products and combos in parallel
    const [products, combos] = await Promise.all([
        ProductModel.find({ _id: { $in: ids } })
            .select(
                "_id product_name product_slug category_id thumbnail_image product_price product_discount_price product_quantity discount_show availability type product_status product_inactivity_start product_inactivity_end"
            )
            .populate("category_id", "_id category_name")
            .lean(),

        ComboModel.find({ _id: { $in: ids } })
            .select("_id combo_title combo_slug combo_status combo_image combo_products")
            .populate({
                path: "combo_products.product_id",
                select:
                    "_id product_name product_slug product_price product_discount_price thumbnail_image availability product_status",
            })
            .lean(),
    ]);

    // 3. Convert to lookup maps
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const comboMap = new Map(combos.map((c) => [c._id.toString(), c]));

    // 4. Enrich the wishlist: keep original order
    const enriched = ids
        .map((id) => {
            const key = id.toString();

            if (productMap.has(key)) {
                const product = productMap.get(key);
                return {
                    ...product,
                    item_type: "product",
                    availability: checkProductAvailability(product as IProductInterface),
                };
            }

            if (comboMap.has(key)) {
                const combo = comboMap.get(key);
                return {
                    ...combo,
                    item_type: "combo",
                    availability: { isAvailable: true }, // combos are always available
                };
            }

            return null; // ID not found
        })
        .filter(Boolean);

    return { ...wishlist, product_id: enriched };
};




// UPDATE Wishlist (replace product list for a user)
const updateWishlistService = async (
    userId: Types.ObjectId,
    updatedData: Partial<IWishlist>
): Promise<IWishlist | null> => {
    const result = await WishlistModel.findOneAndUpdate(
        { user_id: userId },
        { $set: updatedData },
        { new: true }
    );
    return result;
};

// Remove Wishlist 
const removeFromWishlistService = async (userId: string, productId: string): Promise<IWishlist | null> => {
    const wishlist = await WishlistModel.findOne({ user_id: userId });

    if (!wishlist) throw new Error('Wishlist not found');

    wishlist.product_id = wishlist.product_id.filter(
        (id) => id.toString() !== productId
    );

    await wishlist.save();
    return wishlist;
};


export const WishlistServices = {
    postWishlistService,
    getWishlistService,
    updateWishlistService,
    removeFromWishlistService,
};
