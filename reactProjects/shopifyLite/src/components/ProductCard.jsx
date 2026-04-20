// ProductCard.jsx
// A reusable card component that displays a single product.
// It receives one prop: `product` (an object from the Fake Store API).
// Used in both the Home page (featured products) and the Products page (full grid).

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { FiShoppingCart, FiHeart } from 'react-icons/fi'; // Feather Icons
import { FaStar } from 'react-icons/fa'; // Font Awesome star for rating

const ProductCard = ({ product }) => {
    // Pull the cart actions and data from the cart hook
    const { addToCart, cartItems, updateQuantity } = useCart();
    // Pull toggleWishlist and a helper to check if this product is already saved
    const { toggleWishlist, isInWishlist } = useWishlist();
    // Boolean: true if this product's ID is in the wishlist array
    const isWishlisted = isInWishlist(product.id);

    // Get current cart quantity based on ID
    const cartItem = cartItems?.find(item => item.productId === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    return (
        // The outer div is the card itself — flex column so content stacks vertically
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">

            {/* IMAGE SECTION — fixed height (280px) with light pink background */}
            <div className="relative w-full h-[280px] bg-pink-50 border-b border-gray-50 flex items-center justify-center p-6">

                {/* Clicking the image navigates to the product detail page */}
                <Link to={`/products/${product.id}`} className="w-full h-full flex items-center justify-center">
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        // mix-blend-multiply removes the white background from product images
                        className="w-auto h-full max-h-[220px] object-contain mix-blend-multiply"
                    />
                </Link>

                {/* Wishlist heart button — positioned absolute so it floats over the image */}
                <button
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${isWishlisted ? 'bg-brand-pink text-brand-blue' : 'bg-white text-gray-300 hover:text-red-500'
                        }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    {/* fill-current fills the heart SVG solid when wishlisted */}
                    <FiHeart className={isWishlisted ? "fill-current w-5 h-5" : "w-5 h-5"} />
                </button>
            </div>

            {/* DETAILS SECTION — flex-grow makes this fill remaining card height */}
            <div className="p-5 flex flex-col flex-grow bg-gray-50/50">

                {/* Category badge */}
                <span className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-2 truncate">
                    {product.category}
                </span>

                {/* Product title */}
                <Link to={`/products/${product.id}`} className="hover:text-brand-blue transition-colors">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate" title={product.title}>
                        {product.title}
                    </h3>
                </Link>

                {/* Star rating */}
                <div className="flex items-center mb-4">
                    <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                    <span className="text-sm text-gray-700 font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-400 ml-1">({product.reviews?.length || product.stock})</span>
                </div>

                {/* Price + Add to Cart / Quantity Adjust — mt-auto pushes this to the bottom of the card */}
                <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
                    {/* toFixed(2) ensures price always shows 2 decimal places e.g. ₹19.50 */}
                    <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>

                    {cartQuantity > 0 ? (
                        <div className="flex items-center border border-brand-blue rounded bg-gray-50 overflow-hidden h-9">
                            <button
                                onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                                className="w-8 h-full flex items-center justify-center text-brand-blue hover:bg-gray-200 transition-colors font-bold text-lg"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-bold text-brand-blue text-sm">{cartQuantity}</span>
                            <button
                                onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                                className="w-8 h-full flex items-center justify-center text-brand-blue hover:bg-gray-200 transition-colors font-bold text-lg"
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => addToCart(product)}
                            className="flex items-center justify-center bg-brand-pink text-brand-blue hover:bg-opacity-80 transition-colors px-3 py-2 rounded font-bold text-sm gap-2 h-9"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
