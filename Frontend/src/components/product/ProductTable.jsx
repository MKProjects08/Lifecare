// src/components/product/ProductTable.jsx
import React, { useState, useEffect } from "react";
import SmartProductModal from "../product/ProductModal";

const ProductTable = ({ filters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);

  // Use consistent API base URL
  const API_BASE_URL = 'http://localhost:3000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  };

  // Fetch agencies for mapping Agency_ID to agency name
  const fetchAgencies = async () => {
    try {
      setAgenciesLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/agencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Agencies fetched:', data);
        setAgencies(data);
      } else {
        console.error('Failed to fetch agencies:', response.status);
        setAgencies([]);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to view products.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Products API response:', data);
      
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAgencies();
      await fetchProducts();
    };
    fetchData();
  }, []);

  // Format date from "2025-12-30T18:30:00.000Z" to "2025-12-30"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Map API field names to component field names
  const mapProductToComponent = (product) => {
    if (!product) return null;
    
    // Find agency by Agency_ID - handle both string and number IDs
    const agency = agencies.find(a => 
      a.Agency_ID == product.Agency_ID || 
      a.agency_id == product.Agency_ID ||
      a.id == product.Agency_ID
    );
    
    const agencyName = agency ? 
      (agency.agencyname || agency.name || `Agency ${product.Agency_ID}`) : 
      `Agency ${product.Agency_ID}`;

    return {
      id: product.Product_ID,
      batchNumber: product.BatchNumber,
      name: product.productname,
      genericName: product.generic_name,
      quantity: product.quantity || 0,
      expiryDate: formatDateForInput(product.expiry_date),
      agency: agencyName,
      purchaseRate: parseFloat(product.purchase_price) || 0,
      sellingRate: parseFloat(product.selling_price) || 0,
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      // Keep all original data for SmartProductModal
      _original: product
    };
  };

  // Get mapped products for display
  const getMappedProducts = () => {
    return products.map(mapProductToComponent).filter(product => product !== null);
  };

  // Apply filters to mapped products
  const filteredProducts = getMappedProducts().filter(product => {
    if (!product) return false;
    
    const matchesAgency = !filters.agency || 
      product.agency.toLowerCase().includes(filters.agency.toLowerCase());
    const matchesProductName = !filters.productName || 
      (product.name && product.name.toLowerCase().includes(filters.productName.toLowerCase()));
    
    return matchesAgency && matchesProductName;
  });

  const calculateTotalValue = (price, quantity) => {
    return (price * quantity).toFixed(2);
  };

  const totalStockValue = filteredProducts.reduce((total, product) => {
    return total + (product.sellingRate * product.quantity);
  }, 0);

  const handleView = (product) => {
    console.log('Viewing product - full data:', product);
    
    // Prepare data in the exact format SmartProductModal expects
    const productData = {
      Product_ID: product.id,
      BatchNumber: product.batchNumber,
      productname: product.name,
      generic_name: product.genericName,
      quantity: product.quantity,
      purchase_price: product.purchaseRate.toString(),
      selling_price: product.sellingRate.toString(),
      expiry_date: product.expiryDate, // This is already formatted correctly
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      // Include original data
      ...product._original
    };
    
    console.log('Data being sent to modal:', productData);
    
    setSelectedProduct(productData);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    console.log('Editing product:', product);
    
    if (!product || !product.batchNumber) {
      console.error('Invalid product data for editing:', product);
      alert('Error: Could not load product data for editing');
      return;
    }
    
    // Prepare data in the exact format SmartProductModal expects
    const productData = {
      Product_ID: product.id,
      BatchNumber: product.batchNumber,
      productname: product.name,
      generic_name: product.genericName,
      quantity: product.quantity,
      purchase_price: product.purchaseRate.toString(),
      selling_price: product.sellingRate.toString(),
      expiry_date: product.expiryDate, // This is already formatted correctly
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      // Include original data
      ...product._original
    };
    
    console.log('Data being sent to modal:', productData);
    
    setSelectedProduct(productData);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (batchNumber) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/products/${batchNumber}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchProducts();
          alert('Product deleted successfully!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete product');
        }
      } catch (err) {
        console.error('Error deleting product:', err);
        alert(`Error deleting product: ${err.message}`);
      }
    }
  };

  const handleSave = async (savedProduct) => {
    try {
      console.log('Product saved successfully:', savedProduct);
      
      // Refresh the products list after successful save
      await fetchProducts();
      setIsModalOpen(false);
      setSelectedProduct(null);
      
      // Show success message based on mode
      if (modalMode === "edit") {
        alert('Product updated successfully!');
      } else {
        alert('Product added successfully!');
      }
    } catch (err) {
      console.error('Error handling save:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    fetchProducts();
    fetchAgencies();
  };

  // Show loading if both products and agencies are loading
  if (loading || agenciesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generic Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agency
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.genericName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.expiryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.agency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.sellingRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${calculateTotalValue(product.sellingRate, product.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleView(product)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.batchNumber)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                  {products.length === 0 ? 'No products found in database' : 'No products match your filters'}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colSpan="7" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                Total Stock Value:
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                ${totalStockValue.toFixed(2)}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredProducts.length} of {getMappedProducts().length} products
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Product
        </button>
      </div>

      {isModalOpen && (
        <SmartProductModal
          product={selectedProduct}
          mode={modalMode}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ProductTable;