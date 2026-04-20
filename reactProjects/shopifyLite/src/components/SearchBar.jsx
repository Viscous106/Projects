import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ value, onChange, placeholder = "Search products..." }) => {
    return (
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 w-5 h-5" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue sm:text-sm transition-colors text-gray-900 shadow-sm"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
