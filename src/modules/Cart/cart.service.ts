import { ComboModel } from "../Combo/combo.model";
import ProductModel from "../Product/product.model";
import { ICart } from "./cart.interface";
import { CartModel } from "./cart.model";

const postCartService = async (payload: ICart) => {
    // const userId = payload.user_id;
    // const newItem = payload.cart_items[0]; // assuming one item is added at a time
    // const productId = newItem._id;

    const cartItems = payload.cart_items;

    const results = await Promise.all(
        cartItems.map(async (item) => {
            if (item.type === "product") {
                const product = await ProductModel.findById(item._id)
                    .select("_id product_name thumbnail_image product_slug product_price product_discount_price product_quantity")
                    .lean();

                if (!product) return null;

                const result: Record<string, any> = {
                    _id: product._id,
                    product_name: product.product_name,
                    product_slug: product.product_slug,
                    product_image: product.thumbnail_image,
                    quantity: item.quantity,
                    stock_quantity: product.product_quantity,
                    type: item.type,
                    product_price: product.product_discount_price || product.product_price,
                };

                return result;
            }

            if (item.type === "combo") {
                const combo = await ComboModel.findById(item._id)
                    .populate('combo_products.product_id', 'product_quantity')
                    .select("_id combo_title combo_slug combo_image combo_price combo_discount_price combo_quantity combo_products")
                    .lean();

                if (!combo) return null;

                console.log('combo >>>>', combo);


                // Get stock quantities from each product in the combo
                const quantities: number[] = (combo.combo_products || [])
                    .map((cp) => (cp?.product_id as any)?.product_quantity)
                    .filter((q): q is number => typeof q === "number");

                const minStock = quantities.length > 0 ? Math.min(...quantities) : null;

                // Sum up all individual combo_prices from combo combo_products
                const totalComboPrice = (combo.combo_products || []).reduce((sum, cp) => {
                    const cpPrice = cp?.combo_price || 0;
                    return sum + cpPrice;
                }, 0);

                const result: Record<string, any> = {
                    _id: combo._id,
                    product_name: combo.combo_title,
                    product_slug: combo.combo_slug,
                    product_image: combo.combo_image,
                    quantity: item.quantity,
                    stock_quantity: minStock,
                    type: item.type,
                    product_price: totalComboPrice
                };

                return result;
            }

            // Skip unknown type
            return null;
        })
    );

    // Filter out nulls (products or combos not found)
    return results.filter(Boolean);

    // Check if cart with this product already exists
    // let existingCart = await CartModel.findOne({
    //     user_id: userId,
    //     "cart_items._id": productId,
    // });

    // const existingProduct = await CartModel.findOne({
    //     "cart_items._id": productId,
    // });

    // console.log(existingProduct, 'existingProduct');


    // if (!existingCart) {
    //     // Create new cart if none exists
    //     return await CartModel.create(payload);
    // }

    // Merge new items with existing cart
    // const newItems = payload.cart_items;
    // const existingItems = existingCart.cart_items;
    // // Update quantities for existing items, add new ones
    // newItems.forEach(newItem => {
    //     const existingItemIndex = existingItems.findIndex(
    //         item => item._id.toString() === newItem._id.toString()
    //     );

    //     if (existingItemIndex >= 0) {
    //         // Update quantity for existing item
    //         // existingItems[existingItemIndex].quantity += newItem.quantity;
    //     } else {
    //         // Add new item
    //         existingItems.push(newItem);
    //     }
    // });
    // console.log('payload >>>>>>>>>', payload);
    // console.log('existingCart >>>>>>>>>', existingCart);
    // console.log('newItems >>>>>>>>>', newItems);

    // Recalculate totals (if you're storing them)
    // existingCart.totalItems = existingItems.reduce((sum, item) => sum + item.product_quantity, 0);
    // existingCart.total = existingItems.reduce((sum, item) => sum + (item.product_final_price * item.product_quantity), 0);

    // Save updated cart
    // return await existingCart.save();
};

const incrementProductQuantityService = async (userId: string, productId: string) => {
    const cart = await CartModel.findOne({ user_id: userId });

    if (!cart) {
        return null;
    }

    const itemIndex = cart.cart_items.findIndex(
        item => item._id.toString() === productId
    );

    if (itemIndex >= 0) {
        cart.cart_items[itemIndex].quantity += 1;
    }

    const updatedCart = await cart.save();

    // Delete cart if empty
    if (updatedCart.cart_items.length === 0) {
        await CartModel.deleteOne({ _id: updatedCart._id });
        return null;
    }

    return updatedCart;
}

const decrementProductQuantityService = async (userId: string, productId: string) => {
    const cart = await CartModel.findOne({ user_id: userId });

    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.cart_items.findIndex(item =>
        item._id.toString() === productId.toString()
    );

    if (itemIndex === -1) throw new Error('Product not found in cart');

    // If quantity > 1, decrement; else remove item
    if (cart.cart_items[itemIndex].quantity > 1) {
        cart.cart_items[itemIndex].quantity -= 1;
    } else {
        cart.cart_items.splice(itemIndex, 1);
    }

    // 🚨 If cart is now empty, delete the cart document
    if (cart.cart_items.length === 0) {
        await CartModel.deleteOne({ user_id: userId });
        return null; // or return a message saying "Cart deleted"
    }

    await cart.save();

    return cart;
};

const removeCartItemService = async (userId: string, productId: string) => {
    const updatedCart = await CartModel.findOneAndUpdate(
        { user_id: userId },
        {
            $pull: { cart_items: { _id: productId } }
        },
        { new: true }
    );

    // If cart is now empty, delete the whole cart
    if (updatedCart && updatedCart.cart_items.length === 0) {
        await CartModel.deleteOne({ user_id: userId });
        return null;
    }

    return updatedCart;
};


const getCartService = async (userId: string): Promise<ICart | null> => {
    const result = await CartModel.findOne({ user_id: userId });
    return result;
};

export const CartServices = {
    postCartService,
    incrementProductQuantityService,
    decrementProductQuantityService,
    removeCartItemService,
    getCartService,
};
