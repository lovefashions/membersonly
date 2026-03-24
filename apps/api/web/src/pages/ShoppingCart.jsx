import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart.jsx';
import { initializeCheckout } from '@/api/EcommerceApi.js';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ShoppingCartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = `${window.location.origin}/cart`;
      
      const checkoutItems = cartItems.map(item => ({
        variant_id: item.variant.id,
        quantity: item.quantity
      }));

      const { url } = await initializeCheckout({ items: checkoutItems, successUrl, cancelUrl });
      window.location.href = url;
    } catch (error) {
      toast.error(error.message || 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Your Cart - Apple Jucy</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-orange-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md">
                Looks like you haven't added any items to your cart yet. Discover our premium products and start shopping!
              </p>
              <Link to="/products">
                <Button className="bg-orange-500 hover:bg-orange-600 h-12 px-8 text-base">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.variant.id} className="overflow-hidden border-gray-100 shadow-sm">
                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.product.title}</h3>
                        {item.variant.title && item.variant.title !== 'Default Title' && (
                          <p className="text-sm text-gray-500 mt-1">Variant: {item.variant.title}</p>
                        )}
                        <div className="text-orange-600 font-semibold mt-2">
                          {item.variant.sale_price_formatted || item.variant.price_formatted}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-lg h-10">
                          <button 
                            onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                            className="px-3 h-full text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            className="px-3 h-full text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.variant.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-gray-100 shadow-sm sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{getCartTotal()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {getCartTotal()}
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                    
                    <div className="mt-4 text-center">
                      <Link to="/products" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                        Continue Shopping
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ShoppingCartPage;