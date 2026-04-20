import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [priceRange, setPriceRange] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const limit = 12;

    const debouncedSearchTerm = useDebounce(searchTerm, 1000); // reduced debounce for better UX

    // Reset page to 1 when search or category changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, selectedCategory]);

    // Fetch data using the customized hook
    const { products, categories, totalProducts, loading, error } = useProducts(selectedCategory, debouncedSearchTerm, page, limit);

    const filteredAndSortedProducts = useMemo(() => {
        if (!products) return [];

        let result = [...products];

        // Filter by Price Range (Client Side)
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            result = result.filter(p => {
                if (priceRange === '1000+') return p.price >= 1000;
                return p.price >= min && p.price <= max;
            });
        }

        // Sort appropriately
        if (sortBy === 'price_asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'newest') {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [products, sortBy, priceRange]);

    const totalPages = Math.ceil(totalProducts / limit) || 1;

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 w-full">
                <div className="text-brand-blue text-xl font-bold animate-pulse">Loading amazing products...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-md text-center max-w-lg mx-auto mt-10 w-full">
                <h3 className="font-bold text-lg mb-2">Oops! Something went wrong</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
            <div className="w-full">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Collection</h1>
                        <p className="text-gray-500">Showing {products?.length || 0} of {totalProducts || 0} products</p>
                    </div>
                    <div className="flex-1 max-w-md">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search for products or categories..."
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar / Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Filters</h2>

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Category</h3>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue font-medium">
                                        <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="accent-brand-pink w-4 h-4" />
                                        All Products
                                    </label>
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue capitalize font-medium">
                                            <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} className="accent-brand-pink w-4 h-4" />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Price Range</h3>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue font-medium">
                                        <input type="radio" name="price" checked={priceRange === ''} onChange={() => setPriceRange('')} className="accent-brand-pink w-4 h-4" />
                                        Any Price
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue font-medium">
                                        <input type="radio" name="price" checked={priceRange === '0-4000'} onChange={() => setPriceRange('0-4000')} className="accent-brand-pink w-4 h-4" />
                                        Under ₹4000
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue font-medium">
                                        <input type="radio" name="price" checked={priceRange === '4000-10000'} onChange={() => setPriceRange('4000-10000')} className="accent-brand-pink w-4 h-4" />
                                        ₹4000 - ₹10,000
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-brand-blue font-medium">
                                        <input type="radio" name="price" checked={priceRange === '10000+'} onChange={() => setPriceRange('10000+')} className="accent-brand-pink w-4 h-4" />
                                        Over ₹10,000
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Sort By</h3>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:border-transparent focus:ring-brand-pink text-sm font-medium text-gray-800 bg-gray-50 hover:bg-white transition-all cursor-pointer"
                                >
                                    <option value="">Best Match</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="newest">Newest Arrivals</option>
                                </select>
                            </div>

                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        {loading && (
                            <div className="text-center py-10 w-full animate-pulse text-brand-blue font-medium">
                                Fetching products...
                            </div>
                        )}

                        {!loading && filteredAndSortedProducts.length === 0 && (
                            <div className="w-full text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found for this page/filter</h3>
                                <p className="text-gray-500 mb-6">Try adjusting your filters, search term or go back.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); setPriceRange(''); setSortBy(''); setPage(1); }}
                                    className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}

                        {filteredAndSortedProducts.length > 0 && (
                            <>
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredAndSortedProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-12 bg-white flex-wrap py-4 px-6 rounded-xl border border-gray-100 shadow-sm w-fit mx-auto">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="font-medium text-gray-600">
                                            Page <span className="font-bold text-brand-blue">{page}</span> of {totalPages}
                                        </div>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="px-4 py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
