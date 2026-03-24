import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('session_id');

  return (
    <>
      <Helmet>
        <title>Order Successful - Apple Jucy</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Your payment was successful and your order is being processed. We'll send you an email confirmation shortly.
          </p>
          
          {orderId && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Order Reference</p>
              <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-14 text-lg shadow-lg shadow-orange-500/20 transition-all">
                Continue Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default SuccessPage;