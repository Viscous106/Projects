import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import ProductCard from '../components/ProductCard';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const { wishlistItems } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 px-4 min-h-[60vh]">
        <div className="bg-brand-pink p-6 rounded-full mb-6">
          <FiHeart className="w-16 h-16 text-brand-blue" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Save items you love here so you can easily find them later and add them to your cart.
        </p>
        <Link to="/products" className="bg-brand-blue text-white px-8 py-4 rounded-lg font-bold hover:bg-opacity-90 transition-colors shadow-md">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-500">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          <Link to="/products" className="text-brand-blue hover:text-opacity-80 font-semibold transition-colors">
            Continue Shopping &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map(item => (
            <ProductCard key={item.productId} product={item.product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
