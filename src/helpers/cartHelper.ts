// src/utils/cartHelper.ts

export interface CartItem {
    _id: string;
    quantity: number;
    type: 'product' | 'combo';
}

/**
 * Finds the cart quantity for a product
 * @param cartItems Array of cart items
 * @param productId Product ID to check
 * @returns Quantity in cart (0 if not found)
 */
export const getProductCartQuantity = (cartItems: CartItem[], productId: string): number => {
    const cartItem = cartItems.find(item =>
        item.type === 'product' && item._id.toString() === productId.toString()
    );
    return cartItem ? cartItem.quantity : 0;
};

/**
 * Finds the cart quantity for a combo
 * @param cartItems Array of cart items
 * @param comboId Combo ID to check
 * @returns Quantity in cart (0 if not found)
 */
export const getComboCartQuantity = (cartItems: CartItem[], comboId: string): number => {
    const cartItem = cartItems.find(item =>
        item.type === 'combo' && item._id.toString() === comboId.toString()
    );
    return cartItem ? cartItem.quantity : 0;
};

/**
 * Gets all cart items from user cart
 * @param userCart User cart data from database
 * @returns Array of cart items (empty array if no cart)
 */
export const getCartItems = (userCart: any[]): CartItem[] => {
    return userCart.length > 0 ? userCart[0].cart_items : [];
};