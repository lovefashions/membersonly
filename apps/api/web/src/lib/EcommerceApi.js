export const EcommerceApi = {
  fetchProducts: async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return { error: error.message || 'An unexpected error occurred' };
    }
  },

  fetchProductById: async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product details');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      return { error: error.message || 'An unexpected error occurred' };
    }
  },

  createCheckout: async (items, successUrl, cancelUrl) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, successUrl, cancelUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Checkout process failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating checkout:', error);
      return { error: error.message || 'An unexpected error occurred during checkout' };
    }
  }
};