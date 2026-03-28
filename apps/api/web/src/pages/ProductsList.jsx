import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { getProducts } from '@/api/EcommerceApi.js';
import Header from '@/components/Header.jsx';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingBag, RefreshCw } from 'lucide-react';
const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts();
      setProducts(response.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);
  return (
    <>
      <Helmet>
        <title>Shop - Apple Jucy</title>
        <meta
          name="description"
          content="Browse our collection of premium juices and merchandise."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <Header />

        <main className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              My Products
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover my subscription packages and also my digital products.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-none shadow-md">
                  <Skeleton className="h-64 w-full rounded-none" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl shadow-sm border border-orange-100">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load products</h2>
              <p className="text-gray-600 mb-6 max-w-md">{error}</p>
              <Button
                onClick={loadProducts}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl shadow-sm border border-orange-100">
              <ShoppingBag className="w-20 h-20 text-orange-200 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No products available</h2>
              <p className="text-gray-600 max-w-md">
                We're currently updating our inventory. Please check back later for new items!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block h-full">
                  <Card className="h-full flex flex-col overflow-hidden border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {product.title}
                      </h3>
                      {product.description ? (
                        <div
                          className="text-gray-600 text-sm line-clamp-2 mb-4"
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      ) : (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          Premium quality product from Apple Jucy.
                        </p>
                      )}
                      <div className="mt-auto">
                        <span className="text-lg font-bold text-gray-900">
                          {product.variants?.[0]?.price_formatted ||
                            `$${(product.price_in_cents / 100).toFixed(2)}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};
export default ProductsList;
