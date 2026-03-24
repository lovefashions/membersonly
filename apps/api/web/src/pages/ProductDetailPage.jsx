import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getProduct, getProductQuantities } from '@/api/EcommerceApi.js';
import { useCart } from '@/hooks/useCart.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingCart, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedProduct = await getProduct(id);
      
      try {
        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: [fetchedProduct.id]
        });
        
        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(v => variantQuantityMap.set(v.id, v.inventory_quantity));

        const productWithQuantities = {
          ...fetchedProduct,
          variants: fetchedProduct.variants.map(v => ({
            ...v,
            inventory_quantity: variantQuantityMap.get(v.id) ?? v.inventory_quantity
          }))
        };
        
        setProduct(productWithQuantities);
        if (productWithQuantities.variants?.length > 0) {
          setSelectedVariant(productWithQuantities.variants[0]);
        }
      } catch (qErr) {
        // Fallback if quantities fetch fails
        setProduct(fetchedProduct);
        if (fetchedProduct.variants?.length > 0) {
          setSelectedVariant(fetchedProduct.variants[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product && selectedVariant) {
      try {
        await addToCart(product, selectedVariant, quantity, selectedVariant.inventory_quantity);
        toast.success(`Added ${product.title} to cart`);
      } catch (err) {
        toast.error(err.message || 'Failed to add to cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <Button onClick={loadProduct} className="bg-orange-500 hover:bg-orange-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = selectedVariant?.sale_price_formatted || selectedVariant?.price_formatted || `$${(product.price_in_cents / 100).toFixed(2)}`;
  const availableStock = selectedVariant?.inventory_quantity || 0;
  const isStockManaged = selectedVariant?.manage_inventory || false;
  const canAddToCart = !isStockManaged || quantity <= availableStock;

  return (
    <>
      <Helmet>
        <title>{`${product.title} - Apple Jucy`}</title>
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <Link 
            to="/products" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all products
          </Link>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image */}
            <div className="bg-gray-50 rounded-3xl overflow-hidden aspect-square flex items-center justify-center border border-gray-100">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center">
                  <ShoppingCart className="w-24 h-24 mb-4 opacity-50" />
                  <span>No image available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                {product.title}
              </h1>
              
              <div className="text-3xl font-bold text-orange-600 mb-6">
                {displayPrice}
              </div>

              {product.description && (
                <div className="prose prose-orange mb-8 text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
              )}

              <div className="mt-auto space-y-6 pt-8 border-t border-gray-100">
                {/* Variants Selector */}
                {product.variants && product.variants.length > 1 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900">
                      Select Option
                    </label>
                    <Select 
                      value={selectedVariant?.id} 
                      onValueChange={(val) => setSelectedVariant(product.variants.find(v => v.id === val))}
                    >
                      <SelectTrigger className="w-full h-12 text-base">
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.title} - {variant.sale_price_formatted || variant.price_formatted}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quantity and Add to Cart */}
                <div className="flex space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg h-14 w-32">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full text-gray-500 hover:text-orange-600 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-medium text-gray-900">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 h-full text-gray-500 hover:text-orange-600 transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <Button 
                    onClick={handleAddToCart}
                    disabled={!canAddToCart || !product.purchasable}
                    className="flex-1 h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {/* Stock Status */}
                {isStockManaged && canAddToCart && product.purchasable && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {availableStock} in stock
                  </p>
                )}
                {isStockManaged && !canAddToCart && product.purchasable && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Not enough stock. Only {availableStock} left.
                  </p>
                )}
                {!product.purchasable && (
                  <p className="text-sm text-red-500 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Currently unavailable
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductDetailPage;