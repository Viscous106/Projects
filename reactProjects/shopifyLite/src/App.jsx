// App.jsx
// The root component of the application.
// It sets up three things that wrap the entire app:
//   1. CartProvider   — global state for cart & wishlist (Context API)
//   2. Router         — enables client-side navigation (React Router)
//   3. Layout         — shared header and footer on every page
// Then it defines all the URL routes.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // The container that renders toast popups
import 'react-toastify/dist/ReactToastify.css';   // Default toast styles

import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';

// Page components — each maps to a URL route below
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';

function App() {
  return (
    // CartProvider wraps everything so CartContext is accessible in every component
    <CartProvider>
      {/* BrowserRouter uses the HTML5 History API to change URLs without page reloads */}
      <Router>
        {/* Layout renders the nav bar and footer — children (the page content) go in the middle */}
        <Layout>
          {/* Routes looks at the current URL and renders the first matching <Route> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            {/* :id is a URL parameter — e.g. /products/5 → id = "5" */}
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Layout>

        {/* ToastContainer renders all toast notifications — placed outside Layout
            so it appears above everything else on the screen */}
        <ToastContainer position="bottom-right" />
      </Router>
    </CartProvider>
  );
}

export default App;
