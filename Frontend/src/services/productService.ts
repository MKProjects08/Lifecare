// src/services/productService.ts

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

// Auth token utility
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('authToken');
};

// Common headers for API requests
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handle API response
const handleResponse = async (response: Response): Promise<any> => {
  if (response.status === 401) {
    throw new Error('Authentication failed. Please log in again.');
  }

  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission to perform this action.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
};

// Product API calls matching your backend controller
export const productService = {
  // ✅ Get all products
  getAllProducts: async (): Promise<any[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse(response);
      return data || [];
    } catch (error) {
      console.error('Error in productService.getAllProducts:', error);
      throw error;
    }
  },

  // ✅ Get product by ID (BatchNumber)
  getProductById: async (batchNumber: string): Promise<any> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products/${batchNumber}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in productService.getProductById:', error);
      throw error;
    }
  },

  // ✅ Create new product
  createProduct: async (productData: {
    productname: string;
    generic_name: string;
    BatchNumber: string;
    quantity: number;
    purchase_price: string | number;
    selling_price: string | number;
    expiry_date: string | null;
    Agency_ID: number;
    is_active?: number;
  }): Promise<any> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Prepare data in the format expected by backend
      const apiData = {
        productname: productData.productname.trim(),
        generic_name: productData.generic_name.trim(),
        BatchNumber: productData.BatchNumber.trim(),
        quantity: parseInt(productData.quantity.toString()) || 0,
        purchase_price: parseFloat(productData.purchase_price.toString()).toFixed(2),
        selling_price: parseFloat(productData.selling_price.toString()).toFixed(2),
        expiry_date: productData.expiry_date,
        Agency_ID: parseInt(productData.Agency_ID.toString()),
        is_active: productData.is_active !== undefined ? productData.is_active : 1
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(apiData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in productService.createProduct:', error);
      throw error;
    }
  },

  // ✅ Update product by BatchNumber
  updateProduct: async (batchNumber: string, productData: {
    productname: string;
    generic_name: string;
    quantity: number;
    purchase_price: string | number;
    selling_price: string | number;
    expiry_date: string | null;
    Agency_ID: number;
  }): Promise<any> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Prepare data in the format expected by backend
      const apiData = {
        productname: productData.productname.trim(),
        generic_name: productData.generic_name.trim(),
        quantity: parseInt(productData.quantity.toString()) || 0,
        purchase_price: parseFloat(productData.purchase_price.toString()).toFixed(2),
        selling_price: parseFloat(productData.selling_price.toString()).toFixed(2),
        expiry_date: productData.expiry_date,
        Agency_ID: parseInt(productData.Agency_ID.toString())
      };

      const response = await fetch(`${API_BASE_URL}/products/${batchNumber}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(apiData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in productService.updateProduct:', error);
      throw error;
    }
  },

  // ✅ Soft delete product by BatchNumber
  deleteProduct: async (batchNumber: string): Promise<any> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products/${batchNumber}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in productService.deleteProduct:', error);
      throw error;
    }
  },

  // Utility method to check if product batch exists
  checkProductBatchExists: async (productname: string, batchNumber: string): Promise<any> => {
    try {
      const allProducts = await productService.getAllProducts();
      return allProducts.find(product => 
        product.productname === productname && 
        product.BatchNumber === batchNumber &&
        product.is_active === 1
      ) || null;
    } catch (error) {
      console.error('Error in productService.checkProductBatchExists:', error);
      throw error;
    }
  },

  // Get products with filters (if needed for your frontend)
  getProductsWithFilters: async (filters?: { 
    productname?: string; 
    batchnumber?: string; 
    is_active?: number 
  }): Promise<any[]> => {
    try {
      const allProducts = await productService.getAllProducts();
      
      if (!filters) return allProducts;

      return allProducts.filter(product => {
        let matches = true;

        if (filters.productname) {
          matches = matches && product.productname?.toLowerCase().includes(filters.productname.toLowerCase());
        }

        if (filters.batchnumber) {
          matches = matches && product.BatchNumber?.toLowerCase().includes(filters.batchnumber.toLowerCase());
        }

        if (filters.is_active !== undefined) {
          matches = matches && product.is_active === filters.is_active;
        }

        return matches;
      });
    } catch (error) {
      console.error('Error in productService.getProductsWithFilters:', error);
      throw error;
    }
  }
};

// Export utilities for use in other services
export { getAuthToken, API_BASE_URL, getHeaders, handleResponse };