import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Download, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { EcommerceApi } from '@/lib/EcommerceApi';
import { useAuth } from '@/contexts/AuthContext';

const placeholderImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, profile } = useAuth();

  const isDigitalProduct = product.downloadFile;
  const hasAccess = profile?.tier && profile.tier.toLowerCase() !== 'fan';

  const handleDownload = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please log in to download products.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasAccess) {
      toast({
        title: 'Upgrade Required',
        description: 'Upgrade your membership to download digital products.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('pb_auth');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const authData = JSON.parse(token);
      const response = await fetch(`/api/products/${product.id}/download`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      // The response should redirect to the file URL
      // or we can handle the blob download here
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = product.downloadFile;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download Started! 📁',
        description: `${product.name} is downloading.`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [product, currentUser, hasAccess, toast]);

  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // For digital products, redirect to download if user has access
      if (isDigitalProduct && hasAccess) {
        handleDownload(e);
        return;
      }

      // For physical products, add to cart
      try {
        await addToCart(product, null, 1, 999); // Simplified for PocketBase products
        toast({
          title: 'Added to Cart! 🛒',
          description: `${product.name} has been added to your cart.`,
        });
      } catch (error) {
        toast({
          title: 'Error adding to cart',
          description: error.message,
        });
      }
    },
    [product, addToCart, toast, isDigitalProduct, hasAccess, handleDownload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product.id}`}>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm glass-card border-0 text-white overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="relative">
            <img
              src={product.image || placeholderImage}
              alt={product.name}
              className="w-full h-64 object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
            {isDigitalProduct && (
              <div className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Digital Download
              </div>
            )}
            <div className="absolute top-3 right-3 bg-purple-500/80 text-white text-xs font-bold px-3 py-1 rounded-full">
              ${product.price}
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold truncate">{product.name}</h3>
            <p className="text-sm text-gray-300 h-10 overflow-hidden">
              {product.description || 'Digital product available for download'}
            </p>
            <Button
              onClick={handleAddToCart}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              {isDigitalProduct && hasAccess ? (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download
                </>
              ) : isDigitalProduct && !hasAccess ? (
                <>
                  <Download className="mr-2 h-4 w-4" /> Upgrade to Download
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await EcommerceApi.fetchProducts();

        if (response.error) {
          setError(response.error);
          return;
        }

        // Filter to only active products
        const activeProducts = response.products.filter(product => product.active !== false);
        setProducts(activeProducts);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Error loading products: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;
