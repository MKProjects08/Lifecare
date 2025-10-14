// src/components/product/ProductModal.jsx
import React, { useState, useEffect } from "react";

const ProductModal = ({ product, mode, onClose, onSave, onAddProduct }) => {
  const [formData, setFormData] = useState({
    productname: "",
    generic_name: "",
    BatchNumber: "",
    quantity: 0,
    purchase_price: "0.00",
    selling_price: "0.00",
    expiry_date: "",
    Agency_ID: "",
    is_active: 1
  });

  const [agencies, setAgencies] = useState([]);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAgencies();
  }, [mode]);

  useEffect(() => {
    if (product) {
      // Map the product data to match the database fields
      const originalProduct = product._original || product;
      
      setFormData({
        productname: originalProduct.productname || product.name || "",
        generic_name: originalProduct.generic_name || product.genericName || "",
        BatchNumber: originalProduct.BatchNumber || product.batchNumber || "",
        quantity: originalProduct.quantity || product.quantity || 0,
        purchase_price: originalProduct.purchase_price ? 
          parseFloat(originalProduct.purchase_price).toString() : 
          (product.purchaseRate ? product.purchaseRate.toString() : "0.00"),
        selling_price: originalProduct.selling_price ? 
          parseFloat(originalProduct.selling_price).toString() : 
          (product.sellingRate ? product.sellingRate.toString() : "0.00"),
        expiry_date: originalProduct.expiry_date ? 
          // Convert database date to YYYY-MM-DD format for input
          new Date(originalProduct.expiry_date).toISOString().split('T')[0] : 
          (product.expiryDate || ""),
        Agency_ID: originalProduct.Agency_ID ? 
          originalProduct.Agency_ID.toString() : 
          (product.Agency_ID ? product.Agency_ID.toString() : ""),
        is_active: originalProduct.is_active !== undefined ? originalProduct.is_active : 1
      });
    }
  }, [product]);

  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  };

  const fetchAgencies = async () => {
    try {
      setLoadingAgencies(true);
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:3000/api/agencies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      }
    } catch (error) {
      console.error('Error fetching agencies for modal:', error);
    } finally {
      setLoadingAgencies(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    if (type === 'checkbox') {
      processedValue = checked ? 1 : 0;
    } else if (type === 'number') {
      // For quantity, parse as integer
      if (name === 'quantity') {
        processedValue = parseInt(value) || 0;
      } 
      // For prices, keep as string with 2 decimal places
      else if (name.includes('price')) {
        processedValue = parseFloat(value || 0).toFixed(2);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare data for API - ensure proper data types
      const apiData = {
        productname: formData.productname.trim(),
        generic_name: formData.generic_name.trim(),
        BatchNumber: formData.BatchNumber.trim(),
        quantity: parseInt(formData.quantity) || 0,
        purchase_price: parseFloat(formData.purchase_price || 0).toFixed(2),
        selling_price: parseFloat(formData.selling_price || 0).toFixed(2),
        Agency_ID: parseInt(formData.Agency_ID) || 1,
        is_active: formData.is_active
      };

      // Handle expiry_date - convert to MySQL compatible format
      if (formData.expiry_date) {
        // For MySQL, we need to format as 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'
        // Remove timezone and time part, keep only date
        const date = new Date(formData.expiry_date);
        
        // Format as YYYY-MM-DD for MySQL DATE type
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        apiData.expiry_date = `${year}-${month}-${day}`;
        
        console.log('Formatted expiry date for MySQL:', apiData.expiry_date);
      } else {
        // If no expiry date provided, set to null
        apiData.expiry_date = null;
      }

      console.log('Submitting data to API:', apiData);
      
      await onSave(apiData);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setSaving(false);
    }
  };

  const isViewMode = mode === "view";

  // Get agency name for display
  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Agency_ID === parseInt(agencyId));
    return agency ? agency.agencyname : `Agency ${agencyId}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Format status for display
  const getStatusText = (isActive) => {
    return isActive === 1 ? 'Active' : 'Inactive';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Add Product Button */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "view" && "Product Details"}
            {mode === "edit" && "Edit Product"}
            {mode === "add" && "Add New Product"}
          </h2>
          
          {/* Add Product Button - Only show when not in add mode */}
          {mode !== "add" && onAddProduct && (
            <button
              onClick={onAddProduct}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formData.productname || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="productname"
                  value={formData.productname}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                />
              )}
            </div>

            {/* Generic Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generic Name *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formData.generic_name || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="generic_name"
                  value={formData.generic_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                />
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Number *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formData.BatchNumber || 'N/A'}
                </div>
              ) : (
                <input
                  type="text"
                  name="BatchNumber"
                  value={formData.BatchNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving}
                />
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formData.quantity || 0}
                </div>
              ) : (
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  disabled={saving}
                />
              )}
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($) *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  ${parseFloat(formData.purchase_price || 0).toFixed(2)}
                </div>
              ) : (
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={saving}
                />
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price ($) *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  ${parseFloat(formData.selling_price || 0).toFixed(2)}
                </div>
              ) : (
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={saving}
                />
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {formatDate(formData.expiry_date)}
                </div>
              ) : (
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              )}
            </div>

            {/* Agency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency *
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {getAgencyName(formData.Agency_ID)}
                </div>
              ) : (
                <select
                  name="Agency_ID"
                  value={formData.Agency_ID}
                  onChange={handleChange}
                  disabled={loadingAgencies || saving}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                >
                  <option value="">Select Agency</option>
                  {agencies.map((agency) => (
                    <option key={agency.Agency_ID} value={agency.Agency_ID}>
                      {agency.agencyname}
                    </option>
                  ))}
                </select>
              )}
              {loadingAgencies && !isViewMode && (
                <p className="text-xs text-gray-500 mt-1">Loading agencies...</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isViewMode ? (
                <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                  {getStatusText(formData.is_active)}
                </div>
              ) : (
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      is_active: e.target.checked ? 1 : 0
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              )}
            </div>

            {/* Additional Fields for View Mode */}
            {isViewMode && product && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID
                  </label>
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                    {product.id || product.Product_ID || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                    {product._original?.created_at ? 
                      new Date(product._original.created_at).toLocaleString() : 'N/A'
                    }
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            {!isViewMode && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {mode === "add" ? "Add Product" : "Save Changes"}
                </button>
              </>
            )}
            {isViewMode && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;