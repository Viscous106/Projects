// useCart.js
// A convenience hook that wraps CartContext for cart-related operations.
// It also adds toast notifications so every component using this hook
// automatically gets "Added to cart!" alerts without any extra code.

import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

export const useCart = () => {
    // useContext reads the current value from CartContext (set by CartProvider in App.jsx)
    const context = useContext(CartContext);

    // Safety check — if someone calls useCart() outside of <CartProvider>, throw a clear error
    if (!context) throw new Error("useCart must be used within a CartProvider");

    // Derived values calculated from the cartItems array.
    // reduce() accumulates a single value by looping over the array.
    // cartTotal: sum of (price × quantity) for every item
    const cartTotal = context.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    // cartItemCount: total number of individual units in the cart (e.g. 2 shirts + 1 shoe = 3)
    const cartItemCount = context.cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Wraps the raw addToCart from context and shows a success toast notification
    const addToCartWithToast = (product, quantity = 1) => {
        context.addToCart(product, quantity);
        toast.success('Added to cart!', { autoClose: 2000, position: "bottom-right" });
    };

    // Wraps the raw removeFromCart and shows an info toast notification
    const removeFromCartWithToast = (productId) => {
        context.removeFromCart(productId);
        toast.info('Removed from cart', { autoClose: 2000, position: "bottom-right" });
    };

    // Return the enriched API — components use addToCart/removeFromCart from HERE,
    // not directly from the context, so they always get toast behavior for free.
    return {
        cartItems: context.cartItems,
        addToCart: addToCartWithToast,
        removeFromCart: removeFromCartWithToast,
        updateQuantity: context.updateQuantity,
        clearCart: context.clearCart,
        cartTotal,
        cartItemCount
    };
};
