import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from '../assets/banner.jpg';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

const Home = () => {
    const { products, loading, error } = useProducts();
    const featuredProducts = products?.slice(0, 4) || [];

    return (
        <div className="w-full flex flex-col items-center">
            {/* Banner Section */}
            <div className="relative w-full h-[400px] md:h-[500px]">
                <img
                    src={bannerImg}
                    alt="Banner"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Featured Products */}
            <div className="w-full px-4 py-16 flex flex-col items-center">
                <div className="w-full flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
                        <p className="text-gray-500">Handpicked items just for you</p>
                    </div>
                    <Link to="/products" className="text-brand-blue font-semibold hover:underline hidden sm:block">
                        View All Products &rarr;
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center w-full h-40">
                        <div className="text-brand-blue font-bold animate-pulse">Loading featured products...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded text-center w-full">
                        Failed to load products: {error}
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center sm:hidden w-full">
                    <Link to="/products" className="inline-block bg-brand-pink text-brand-blue font-semibold px-6 py-3 rounded">
                        View All Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
