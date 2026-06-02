"use strict";
// src/utils/cartHelper.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItems = exports.getComboCartQuantity = exports.getProductCartQuantity = void 0;
/**
 * Finds the cart quantity for a product
 * @param cartItems Array of cart items
 * @param productId Product ID to check
 * @returns Quantity in cart (0 if not found)
 */
const getProductCartQuantity = (cartItems, productId) => {
    const cartItem = cartItems.find(item => item.type === 'product' && item._id.toString() === productId.toString());
    return cartItem ? cartItem.quantity : 0;
};
exports.getProductCartQuantity = getProductCartQuantity;
/**
 * Finds the cart quantity for a combo
 * @param cartItems Array of cart items
 * @param comboId Combo ID to check
 * @returns Quantity in cart (0 if not found)
 */
const getComboCartQuantity = (cartItems, comboId) => {
    const cartItem = cartItems.find(item => item.type === 'combo' && item._id.toString() === comboId.toString());
    return cartItem ? cartItem.quantity : 0;
};
exports.getComboCartQuantity = getComboCartQuantity;
/**
 * Gets all cart items from user cart
 * @param userCart User cart data from database
 * @returns Array of cart items (empty array if no cart)
 */
const getCartItems = (userCart) => {
    return userCart.length > 0 ? userCart[0].cart_items : [];
};
exports.getCartItems = getCartItems;
