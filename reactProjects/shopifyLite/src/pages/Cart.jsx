import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

    const tax = cartTotal * 0.08;
    const finalTotal = cartTotal + tax;


    if (cartItems.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
                <div className="bg-brand-pink p-6 rounded-full mb-6">
                    <FiShoppingBag className="w-16 h-16 text-brand-blue" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md text-center">
                    Looks like you haven't added anything to your cart yet. Browse our products and discover amazing deals!
                </p>
                <Link to="/products" className="bg-brand-blue text-white px-8 py-4 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="sm:col-span-6">Product</div>
                                <div className="sm:col-span-2 text-center">Price</div>
                                <div className="sm:col-span-2 text-center">Quantity</div>
                                <div className="sm:col-span-2 text-right">Total</div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cartItems.map(item => (
                                    <div key={item.productId} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-6 items-center">
                                        <div className="sm:col-span-6 flex items-center gap-4 border-b sm:border-b-0 pb-4 sm:pb-0">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-pink-50 border border-gray-100 rounded-lg p-2 flex items-center justify-center">
                                                <img
                                                    src={item.product.thumbnail}
                                                    alt={item.product.title}
                                                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-brand-blue uppercase mb-1">{item.product.category}</span>
                                                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-brand-blue transition-colors line-clamp-2">
                                                    {item.product.title}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 text-left sm:text-center text-gray-600 font-medium">
                                            <span className="sm:hidden text-gray-400 text-sm mr-2">Price:</span>
                                            ₹{item.price.toFixed(2)}
                                        </div>

                                        <div className="sm:col-span-2 flex justify-start sm:justify-center items-center">
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="p-2 text-gray-500 hover:text-brand-blue hover:bg-gray-100 transition-colors rounded-l-lg"
                                                >
                                                    <FiMinus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="p-2 text-gray-500 hover:text-brand-blue hover:bg-gray-100 transition-colors rounded-r-lg"
                                                >
                                                    <FiPlus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2 flex justify-between sm:justify-end items-center font-bold text-gray-900 pt-4 sm:pt-0">
                                            <span className="sm:hidden text-gray-400 text-sm font-normal">Total:</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-900">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Estimated Tax (8%)</span>
                                    <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mb-8">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-gray-900 text-xl">Total</span>
                                    <span className="font-bold text-brand-blue text-3xl">₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="w-full flex items-center justify-center bg-brand-blue text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg">
                                Proceed to Checkout <FiArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
