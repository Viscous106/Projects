// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCart } from '../hooks/useCart';
import { FiCheckCircle, FiShield, FiCreditCard, FiMapPin, FiUser, FiLock } from 'react-icons/fi';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  zip: yup.string().required('ZIP code is required'),
  cardNumber: yup.string().min(16, 'Minimum 16 digits').required('Card number required'),
  expiry: yup.string().matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY').required('Required'),
  cvv: yup.string().min(3, 'Required').required('Required'),
});

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = (data) => {
    setIsSuccess(true);
    clearCart();
    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + tax;

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 px-4 min-h-[70vh]">
        <div className="bg-green-50 p-8 rounded-full mb-8 relative">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          <FiCheckCircle className="w-20 h-20 text-green-500 relative z-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">Order Confirmed!</h2>
        <p className="text-gray-500 mb-10 max-w-lg text-center text-lg leading-relaxed">
          Thank you for your purchase. We've received your order and are preparing it for shipment.
          You'll be automatically redirected to the home page shortly.
        </p>
        <Link to="/" className="px-8 py-4 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full flex flex-col items-center py-24 px-4 min-h-[60vh] justify-center">
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900 tracking-tight">Your checkout is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to your cart before proceeding.</p>
        <Link to="/products" className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-brand-blue font-bold text-lg transition-colors shadow-md">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">

        {/* Header / Trust Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Secure Checkout</h1>
            <p className="text-gray-500 mt-2 font-medium">Please enter your payment and shipping details.</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
            <FiLock className="w-4 h-4" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Contact Info Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue text-white font-bold text-sm shadow-sm">1</div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Contact Information</h2>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input {...register('firstName')} placeholder="John" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input {...register('lastName')} placeholder="Doe" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input {...register('email')} type="email" placeholder="john.doe@example.com" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
                  </div>
                </div>
              </section>

              {/* Shipping Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-blue text-white font-bold text-sm shadow-sm">2</div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Shipping Details</h2>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                    <input {...register('address')} placeholder="123 Shopping Blvd" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                    {errors.address && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                      <input {...register('city')} placeholder="New York" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.city && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ZIP / Postal Code</label>
                      <input {...register('zip')} placeholder="10001" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-brand-blue/15 focus:border-brand-blue outline-none transition-all shadow-sm ${errors.zip ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.zip && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.zip.message}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Section */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white font-bold text-sm shadow-sm">3</div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">Payment Details</h2>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiCreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input {...register('cardNumber')} placeholder="0000 0000 0000 0000" className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-gray-200 focus:border-gray-900 outline-none transition-all shadow-sm font-mono text-lg tracking-widest ${errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.cardNumber.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                      <input {...register('expiry')} placeholder="MM/YY" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-gray-200 focus:border-gray-900 outline-none transition-all shadow-sm font-mono text-center text-lg ${errors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.expiry.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                      <input {...register('cvv')} placeholder="123" type="password" maxLength="4" className={`w-full px-5 py-3.5 border rounded-xl focus:ring-4 focus:ring-gray-200 focus:border-gray-900 outline-none transition-all shadow-sm font-mono text-center text-lg tracking-widest ${errors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`} />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.cvv.message}</p>}
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </div>

          {/* Cart Sidebar */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-28 transition-all hover:shadow-md">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>

              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-3 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex gap-4 items-center">
                    <img src={item.product.thumbnail} alt={item.product.title} className="w-16 h-16 object-contain bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0 p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.product.title}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium pb-2 border-b border-gray-100/50 w-max">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-gray-900 text-base whitespace-nowrap">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 pt-6 border-t border-gray-100 text-sm">
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 text-base">₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Estimated Tax <span className="text-xs bg-gray-100 py-0.5 px-2 rounded-full text-gray-400 ml-1">8%</span></span>
                  <span className="font-bold text-gray-900 text-base">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs uppercase tracking-wider">Free</span>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-gray-100 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 text-xl">Total</span>
                  <span className="font-extrabold text-brand-blue text-3xl tracking-tight">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full flex items-center justify-center bg-gray-900 text-white py-4 sm:py-5 rounded-xl font-extrabold text-lg sm:text-xl hover:bg-brand-blue transition-all duration-300 shadow-xl shadow-gray-900/10 active:transform active:scale-95 group"
              >
                Confirm Order
                <FiLock className="ml-3 w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>

              <p className="text-center text-xs text-gray-400 font-medium mt-6 mx-auto max-w-[250px]">
                By pressing "Confirm Order", you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
