import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

const Layout = ({ children }) => {
    const { cartItemCount } = useCart();
    const { wishlistItems } = useWishlist();
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 py-3 sm:py-4 shadow-sm border-b border-gray-100 w-full flex justify-center transition-all">
                <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                    {/* LOGO & NAVIGATION WRAPPER */}
                    <div className="flex items-center gap-6 sm:gap-12">
                        {/* LOGO */}
                        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                            <span className="bg-gradient-to-br from-brand-blue to-cyan-500 bg-clip-text text-transparent">Shopify</span>
                            <span className="text-gray-900">Lite</span>
                        </Link>

                        {/* DESKTOP NAV */}
                        <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-full border border-gray-200/50">
                            <Link to="/" className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname === '/' ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>Home</Link>
                            <Link to="/products" className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname.startsWith('/products') ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>Shop</Link>
                            <Link to="/cart" className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${location.pathname.startsWith('/cart') ? 'bg-white shadow-sm text-brand-blue' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}>Cart</Link>
                        </nav>
                    </div>

                    {/* ICONS */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/wishlist" className="relative p-2.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all group">
                            <FiHeart className="w-5 h-5 sm:w-[22px] sm:h-[22px] group-hover:fill-red-50 transition-all" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold border-2 border-white shadow-sm transform scale-110">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>
                        <Link to="/cart" className="relative p-2.5 rounded-full text-gray-500 hover:text-brand-blue hover:bg-blue-50 transition-all group">
                            <FiShoppingCart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 bg-brand-blue text-white text-[10px] rounded-full h-[18px] w-[18px] flex items-center justify-center font-bold border-2 border-white shadow-sm transform scale-110">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>
                        {/* Profile placeholder icon */}
                        <div className="hidden sm:flex ml-2 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 cursor-pointer transition-colors">
                            <FiUser className="w-5 h-5 m-1" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full flex justify-center pb-20">
                <div className="w-full max-w-[1400px]">
                    {children}
                </div>
            </main>

            <footer className="bg-gray-900 text-white py-16 mt-auto w-full flex justify-center border-t border-gray-800">
                <div className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-3 text-center md:text-left">
                        <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity justify-center md:justify-start">
                            <span className="bg-gradient-to-br from-brand-blue to-cyan-500 bg-clip-text text-transparent">Shopify</span>
                            <span className="text-white">Lite</span>
                        </Link>
                        <p className="text-sm text-gray-400 font-medium">copyright@Shreyansh 2026. All rights reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                        <Link to="/" className="text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-colors">Home</Link>
                        <Link to="/products" className="text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-colors">Shop</Link>
                        <Link to="/cart" className="text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-colors">Cart</Link>
                        <Link to="/wishlist" className="text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-colors">Wishlist</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
