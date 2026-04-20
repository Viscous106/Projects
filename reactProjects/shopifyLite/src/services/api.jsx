import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com'
});

export const fetchProducts = ({ limit = 30, skip = 0, category = '', search = '' } = {}) => {
  if (search) {
    return api.get(`/products/search?q=${search}&limit=${limit}&skip=${skip}`);
  }
  if (category) {
    return api.get(`/products/category/${category}?limit=${limit}&skip=${skip}`);
  }
  return api.get(`/products?limit=${limit}&skip=${skip}`);
};

export const fetchCategories = () => api.get('/products/categories');
export const fetchProductById = (id) => api.get(`/products/${id}`);

export default api;
