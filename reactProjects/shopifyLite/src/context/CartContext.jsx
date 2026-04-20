// CartContext.jsx
// This is the "global store" for cart and wishlist state.
// Instead of passing cart data as props through every component (prop drilling),
// we wrap the whole app in <CartProvider> so any component can access cart
// data directly by calling useContext(CartContext).

import React, { createContext, useState } from 'react';

// createContext() creates a Context object.
// This is what components import when they want to READ the cart data.
export const CartContext = createContext();

// CartProvider is a wrapper component that holds the actual state.
// It receives {children} — meaning everything nested inside <CartProvider> in App.jsx.
export const CartProvider = ({ children }) => {
    // cartItems: array of objects like { productId, product, quantity, price }
    const [cartItems, setCartItems] = useState([]);
    // wishlistItems: array of objects like { productId, product }
    const [wishlistItems, setWishlistItems] = useState([]);

    // Adds a product to the cart.
    // If the product already exists, increments its quantity instead of duplicating it.
    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            // Check if this product is already in the cart
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                // Map over all items; only update the matching one's quantity
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Product not in cart yet — add brand new entry with spread operator
            return [...prev, { productId: product.id, product, quantity, price: product.price }];
        });
    };

    // Removes a product from the cart entirely by filtering it out
    const removeFromCart = (productId) => {
        setCartItems((prev) => prev.filter(item => item.productId !== productId));
    };

    // Updates the quantity of a specific item.
    // If quantity drops to 0 or below, remove the item entirely.
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) return removeFromCart(productId);
        setCartItems((prev) =>
            prev.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    // Clears the entire cart — used after a successful checkout
    const clearCart = () => setCartItems([]);

    // Toggles a product in/out of the wishlist.
    // If it's already wishlisted, remove it. Otherwise, add it.
    const toggleWishlist = (product) => {
        setWishlistItems((prev) => {
            const exists = prev.find(item => item.productId === product.id);
            if (exists) {
                // Already in wishlist — remove it (filter it out)
                return prev.filter(item => item.productId !== product.id);
            }
            // Not in wishlist — add it
            return [...prev, { productId: product.id, product }];
        });
    };

    // The Provider makes all these values available to every child component.
    // Any component calling useContext(CartContext) will receive this value object.
    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
            wishlistItems, toggleWishlist
        }}>
            {children}
        </CartContext.Provider>
    );
};
