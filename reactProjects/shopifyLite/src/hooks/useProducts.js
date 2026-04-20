// useProducts.js
// Custom hook that fetches product data from the DummyJSON API.
// Supports pagination, search, and category querying.

import { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../services/api';

export const useProducts = (selectedCategory = '', debouncedSearchTerm = '', page = 1, limit = 12) => {
    // State to hold the fetched product array
    const [products, setProducts] = useState([]);
    // State to hold the total number of products for pagination
    const [totalProducts, setTotalProducts] = useState(0);
    // State to hold the list of unique categories
    const [categories, setCategories] = useState([]);
    // True while the API request is in flight
    const [loading, setLoading] = useState(true);
    // Holds any error message if the fetch fails
    const [error, setError] = useState(null);

    // Fetch categories only once on mount
    useEffect(() => {
        let isMounted = true;
        fetchCategories().then(res => {
            if (isMounted) setCategories(res.data.map(c => c.slug));
        }).catch(err => console.error("Failed to fetch categories:", err));

        return () => { isMounted = false; };
    }, []);

    // Fetch products whenever params change
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const skip = (page - 1) * limit;

                // Prioritize search term over category if both are provided (Due to API constraint)
                const productsRes = await fetchProducts({ limit, skip, category: selectedCategory, search: debouncedSearchTerm });

                if (isMounted) {
                    // Multiply prices by 80 on the API response level
                    const updatedProducts = productsRes.data.products.map(p => ({
                        ...p,
                        price: p.price * 50
                    }));
                    setProducts(updatedProducts);
                    setTotalProducts(productsRes.data.total);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) setError(err.message || "Failed to fetch data");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        // Cleanup function
        return () => { isMounted = false; };
    }, [selectedCategory, debouncedSearchTerm, page, limit]);

    // Expose data to any component that calls this hook
    return { products, totalProducts, categories, loading, error };
};
