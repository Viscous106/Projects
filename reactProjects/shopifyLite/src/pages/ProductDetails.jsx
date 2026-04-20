import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { FiShoppingCart, FiHeart, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { addToCart, cartItems, updateQuantity } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadProduct = async () => {
            try {
                setLoading(true);
                const res = await fetchProductById(id);
                if (isMounted) {
                    const p = res.data;
                    setProduct({ ...p, price: p.price * 50 }); // Multiply by 50 to match other components
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError("Failed to load product details");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadProduct();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="text-brand-blue text-xl font-bold animate-pulse">Loading product details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-md text-center max-w-lg mx-auto mt-10 w-full">
                {error}
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                <Link to="/products" className="text-brand-blue hover:underline">Return to Shop</Link>
            </div>
        );
    }

    const isWishlisted = isInWishlist(product.id);

    const handleAddToCart = () => {
        addToCart(product);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const cartItem = cartItems?.find(item => item.productId === product.id);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    return (
        <div className="w-full flex justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-brand-blue mb-8 transition-colors">
                    <FiArrowLeft className="mr-2" /> Back to Products
                </Link>

                <div className="flex flex-col md:flex-row gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Product Image */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-pink-50">
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="max-w-full h-auto max-h-[400px] object-contain mix-blend-multiply"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
                        <span className="text-sm font-bold text-brand-blue uppercase tracking-widest mb-3">
                            {product.category}
                        </span>
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {product.title}
                        </h1>

                        <div className="flex items-center mb-6">
                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                <FaStar className="text-yellow-400 w-4 h-4 mr-1" />
                                <span className="text-sm font-bold text-yellow-700">{product.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500 ml-3 font-medium">{product.reviews?.length || product.stock} Reviews</span>
                        </div>

                        <p className="text-4xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-8">
                            ₹{product.price.toFixed(2)}
                        </p>

                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-base">
                                {product.description}
                            </p>
                        </div>

                        <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                            {cartQuantity > 0 ? (
                                <div className="flex-1 flex items-center justify-between border-2 border-brand-blue rounded-lg overflow-hidden h-[60px] bg-gray-50">
                                    <button
                                        onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                                        className="h-full px-6 flex items-center justify-center hover:bg-gray-200 text-brand-blue font-bold text-2xl transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-xl text-gray-900 border-x-2 border-brand-blue/10 px-8 py-2">
                                        {cartQuantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                                        className="h-full px-6 flex items-center justify-center hover:bg-gray-200 text-brand-blue font-bold text-2xl transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addedToCart}
                                    className={`flex-1 flex items-center justify-center py-4 rounded-lg font-bold text-lg transition-all ${addedToCart
                                        ? 'bg-green-500 text-white'
                                        : 'bg-brand-blue text-white hover:bg-opacity-90 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {addedToCart ? (
                                        <><FiCheck className="w-6 h-6 mr-2" /> Added to Cart</>
                                    ) : (
                                        <><FiShoppingCart className="w-6 h-6 mr-2" /> Add to Cart</>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`flex items-center justify-center px-6 py-4 rounded-lg font-bold text-lg border-2 transition-colors ${isWishlisted
                                    ? 'border-brand-pink bg-brand-pink text-brand-blue'
                                    : 'border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                                    }`}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <FiHeart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
