// useWishlist.js
// Convenience hook for wishlist operations.
// Like useCart.js, it wraps CartContext and adds toast notifications
// so every component gets automatic feedback without extra code.

import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';

export const useWishlist = () => {
    // Read the shared cart/wishlist state from CartContext
    const context = useContext(CartContext);
    if (!context) throw new Error("useWishlist must be used within a CartProvider");

    // Wraps toggleWishlist from CartContext and shows the correct toast
    // depending on whether the product WAS already in the wishlist or not.
    const toggleWishlistWithToast = (product) => {
        // Check BEFORE toggling so we know which direction we're going
        const isRemoving = context.wishlistItems.some(item => item.productId === product.id);
        context.toggleWishlist(product); // Perform the actual add/remove
        if (isRemoving) {
            toast.info('Removed from wishlist', { autoClose: 2000, position: "bottom-right" });
        } else {
            toast.success('Added to wishlist ❤️', { autoClose: 2000, position: "bottom-right" });
        }
    };

    return {
        wishlistItems: context.wishlistItems,
        toggleWishlist: toggleWishlistWithToast,
        // Helper function: quickly check if a product is already wishlisted
        // .some() returns true if at least one item matches the condition
        isInWishlist: (productId) => context.wishlistItems.some(item => item.productId === productId)
    };
};
