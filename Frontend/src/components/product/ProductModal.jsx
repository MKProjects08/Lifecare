// src/components/product/SmartProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { productService } from "../../services/productService";
import { agencyService } from "../../services/agencyService";
import { Search, ChevronDown, X } from "lucide-react";

const SmartProductModal = ({ product, mode = "add", onClose, onSave }) => {
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
  const [existingProducts, setExistingProducts] = useState([]);
  const [existingBatches, setExistingBatches] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isNewBatch, setIsNewBatch] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedBatchNumber, setSelectedBatchNumber] = useState("");

  // Searchable dropdown states
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isAgencyDropdownOpen, setIsAgencyDropdownOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [agencySearchTerm, setAgencySearchTerm] = useState("");
  
  const productDropdownRef = useRef(null);
  const agencyDropdownRef = useRef(null);

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

  // Initialize form data when product prop changes or modal opens
  useEffect(() => {
    console.log("SmartProductModal received props:", {
      product,
      mode,
      hasProduct: !!product,
      productName: product?.productname,
      expiryDate: product?.expiry_date
    });

    if (product && (mode === "view" || mode === "edit")) {
      console.log("Initializing form with product data:", product);
      
      const formattedExpiryDate = formatDateForInput(product.expiry_date);
      console.log("Formatted expiry date:", formattedExpiryDate);

      const initialFormData = {
        productname: product.productname || "",
        generic_name: product.generic_name || "",
        BatchNumber: product.BatchNumber || "",
        quantity: product.quantity || 0,
        purchase_price: product.purchase_price || "0.00",
        selling_price: product.selling_price || "0.00",
        expiry_date: formattedExpiryDate,
        Agency_ID: product.Agency_ID?.toString() || "",
        is_active: product.is_active !== undefined ? product.is_active : 1
      };

      console.log("Initial form data being set:", initialFormData);
      
      setFormData(initialFormData);
      setSelectedProductName(product.productname || "");
      setSelectedBatchNumber(product.BatchNumber || "");
      setIsNewProduct(false);
      setIsNewBatch(false);
    } else if (mode === "add") {
      setFormData({
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
      setSelectedProductName("");
      setSelectedBatchNumber("");
      setIsNewProduct(false);
      setIsNewBatch(false);
    }
  }, [product, mode]);

  // Fetch initial data
  useEffect(() => {
    fetchAgencies();
    if (mode === "add") {
      fetchAllProducts();
    }
  }, [mode]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target)) {
        setIsProductDropdownOpen(false);
      }
      if (agencyDropdownRef.current && !agencyDropdownRef.current.contains(event.target)) {
        setIsAgencyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAgencies = async () => {
    try {
      const data = await agencyService.getAllAgencies();
      setAgencies(data);
      if (data.length > 0 && !formData.Agency_ID && mode === "add") {
        setFormData(prev => ({ ...prev, Agency_ID: data[0].Agency_ID.toString() }));
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setAllProducts(data);
      
      const uniqueProducts = data.reduce((acc, product) => {
        if (product.is_active === 1) {
          const existing = acc.find(p => p.productname === product.productname);
          if (!existing) {
            acc.push({
              productname: product.productname,
              generic_name: product.generic_name
            });
          }
        }
        return acc;
      }, []);
      
      setExistingProducts(uniqueProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesForProduct = async (productName) => {
    try {
      const data = await productService.getProducts({ 
        productname: productName, 
        is_active: 1 
      });
      
      const batches = data
        .filter(product => product.productname === productName && product.is_active === 1)
        .map(product => product.BatchNumber)
        .filter((batch, index, self) => self.indexOf(batch) === index);
      
      setExistingBatches(batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleProductSelect = (selectedValue) => {
    if (mode === "view") return;
    
    setSelectedProductName(selectedValue);
    setIsProductDropdownOpen(false);
    setProductSearchTerm("");
    
    if (selectedValue === "__NEW__") {
      setIsNewProduct(true);
      setIsNewBatch(true);
      setFormData(prev => ({
        ...prev,
        productname: "",
        generic_name: "",
        BatchNumber: "",
        quantity: 0,
        purchase_price: "0.00",
        selling_price: "0.00",
        expiry_date: ""
      }));
      setExistingBatches([]);
    } else {
      setIsNewProduct(false);
      const selectedProduct = existingProducts.find(p => p.productname === selectedValue);
      
      setFormData(prev => ({
        ...prev,
        productname: selectedValue,
        generic_name: selectedProduct ? selectedProduct.generic_name : ""
      }));

      if (selectedValue) {
        fetchBatchesForProduct(selectedValue);
      }
    }
  };

  const handleAgencySelect = (agencyId) => {
    if (mode === "view") return;
    
    setFormData(prev => ({ ...prev, Agency_ID: agencyId }));
    setIsAgencyDropdownOpen(false);
    setAgencySearchTerm("");
  };

  const handleBatchNumberChange = (e) => {
    if (mode === "view") return;
    
    const selectedValue = e.target.value;
    setSelectedBatchNumber(selectedValue);
    
    if (selectedValue === "__NEW_BATCH__") {
      setIsNewBatch(true);
      setFormData(prev => ({
        ...prev,
        BatchNumber: "",
        quantity: 0,
        purchase_price: "0.00",
        selling_price: "0.00",
        expiry_date: ""
      }));
    } else {
      setIsNewBatch(false);
      
      const existingProduct = allProducts.find(product => 
        product.productname === selectedProductName && 
        product.BatchNumber === selectedValue &&
        product.is_active === 1
      );

      if (existingProduct) {
        const originalProduct = existingProduct._original || existingProduct;
        
        setFormData(prev => ({
          ...prev,
          BatchNumber: selectedValue,
          quantity: originalProduct.quantity || 0,
          purchase_price: originalProduct.purchase_price ? 
            parseFloat(originalProduct.purchase_price).toString() : 
            (existingProduct.purchaseRate ? existingProduct.purchaseRate.toString() : "0.00"),
          selling_price: originalProduct.selling_price ? 
            parseFloat(originalProduct.selling_price).toString() : 
            (existingProduct.sellingRate ? existingProduct.sellingRate.toString() : "0.00"),
          expiry_date: formatDateForInput(originalProduct.expiry_date),
          Agency_ID: originalProduct.Agency_ID ? 
            originalProduct.Agency_ID.toString() : 
            (existingProduct.Agency_ID ? existingProduct.Agency_ID.toString() : prev.Agency_ID),
          is_active: originalProduct.is_active !== undefined ? originalProduct.is_active : 1
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          BatchNumber: selectedValue
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    if (mode === "view") return;
    
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    if (type === 'number') {
      if (name === 'quantity') {
        processedValue = parseInt(value) || 0;
      }
    }
    
    if (name.includes('price')) {
      let cleanedValue = value.replace(/[^\d.]/g, '');
      
      const decimalCount = (cleanedValue.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const parts = cleanedValue.split('.');
        cleanedValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      if (cleanedValue === '') {
        processedValue = '0.00';
      } else if (cleanedValue === '.') {
        processedValue = '0.';
      } else if (cleanedValue.includes('.')) {
        const [whole, decimal] = cleanedValue.split('.');
        processedValue = whole + '.' + (decimal || '').substring(0, 2);
      } else {
        processedValue = cleanedValue;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === "view") {
      onClose();
      return;
    }
    
    setSaving(true);
    
    try {
      if (!formData.productname.trim() || !formData.generic_name.trim() || !formData.BatchNumber.trim()) {
        alert('Please fill in all required fields');
        setSaving(false);
        return;
      }

      const existingProduct = await productService.checkProductBatchExists(
        formData.productname.trim(), 
        formData.BatchNumber.trim()
      );
      
      let apiData = {
        productname: formData.productname.trim(),
        generic_name: formData.generic_name.trim(),
        BatchNumber: formData.BatchNumber.trim(),
        quantity: parseInt(formData.quantity) || 0,
        purchase_price: parseFloat(formData.purchase_price || 0).toFixed(2),
        selling_price: parseFloat(formData.selling_price || 0).toFixed(2),
        Agency_ID: parseInt(formData.Agency_ID) || (agencies[0]?.Agency_ID || 1),
        is_active: formData.is_active
      };

      if (formData.expiry_date) {
        const date = new Date(formData.expiry_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        apiData.expiry_date = `${year}-${month}-${day}`;
      } else {
        apiData.expiry_date = null;
      }

      let result;
      let method = 'POST';

      if (mode === "edit" || (existingProduct && !isNewBatch && !isNewProduct)) {
        method = 'PUT';
        
        if (mode === "edit") {
          const confirmUpdate = window.confirm(
            `Are you sure you want to update "${formData.productname}" - "${formData.BatchNumber}"?`
          );
          
          if (!confirmUpdate) {
            setSaving(false);
            return;
          }
        }

        result = await productService.updateProduct(formData.BatchNumber.trim(), apiData);
      } else {
        result = await productService.createProduct(apiData);
      }

      console.log('Product saved successfully:', result);
      
      let message = method === "PUT" ? 
        `Product updated successfully!` : 
        'Product added successfully!';
      
      alert(message);
      onSave(result);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case "view":
        return "View Product";
      case "edit":
        return "Edit Product";
      case "add":
      default:
        return "Add Product";
    }
  };

  const getSelectedProductDisplay = () => {
    if (isNewProduct) return "+ Add New Product";
    return selectedProductName || "Select Product";
  };

  const getSelectedAgencyDisplay = () => {
    if (!formData.Agency_ID) return "Select Agency";
    const agency = agencies.find(a => a.Agency_ID.toString() === formData.Agency_ID);
    return agency ? agency.agencyname : "Select Agency";
  };

  const filteredProducts = existingProducts.filter(product =>
    product.productname.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const filteredAgencies = agencies.filter(agency =>
    agency.agencyname.toLowerCase().includes(agencySearchTerm.toLowerCase())
  );

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Close Button */}
        <div className="px-6 py-4 border-b bg-[#E1F2F5] border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#3F75B0]">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4 text-left">
            {/* Product Name - Searchable Dropdown */}
            <div className="relative" ref={productDropdownRef}>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1 text-left">
                Product Name *
              </label>
              {isAddMode && isNewProduct ? (
                <input
                  type="text"
                  name="productname"
                  value={formData.productname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={saving || isViewMode}
                  placeholder="Enter new product name"
                  autoFocus
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => !isViewMode && !saving && !loading && isAddMode && setIsProductDropdownOpen(!isProductDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={saving || loading || isViewMode || !isAddMode}
                  >
                    <span className="truncate text-sm">{getSelectedProductDisplay()}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isProductDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProductDropdownOpen && isAddMode && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
                      <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {productSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setProductSearchTerm('')}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-60">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.productname}
                              type="button"
                              onClick={() => handleProductSelect(product.productname)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                                selectedProductName === product.productname ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                              }`}
                            >
                              {product.productname}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No products found
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleProductSelect("__NEW__")}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors text-[#3F75B0] font-medium border-t"
                        >
                          + Add New Product
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {loading && (
                <p className="text-xs text-gray-500 mt-1">Loading products...</p>
              )}
            </div>

            {/* Generic Name */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Generic Name *
              </label>
              <input
                type="text"
                name="generic_name"
                value={formData.generic_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                required
                disabled={saving || isViewMode || (!isNewProduct && formData.productname && isAddMode)}
                placeholder={!isNewProduct && formData.productname && isAddMode ? "Auto-filled from selected product" : "Enter generic name"}
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Batch Number *
              </label>
              {isAddMode && !isNewProduct && formData.productname && existingBatches.length > 0 && !isNewBatch ? (
                <select
                  value={selectedBatchNumber}
                  onChange={handleBatchNumberChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                  required
                  disabled={saving || isViewMode}
                >
                  <option value="">Select Batch Number</option>
                  {existingBatches.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                  <option value="__NEW_BATCH__">+ Add New Batch</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="BatchNumber"
                  value={formData.BatchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                  required
                  disabled={saving || isViewMode}
                  placeholder="Enter batch number"
                  autoFocus={isNewBatch}
                />
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                required
                min="0"
                disabled={saving || isViewMode}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                  Purchase Price (Rs) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                  required
                  disabled={saving || isViewMode}
                  placeholder="0.00"
                  pattern="[0-9]*[.]?[0-9]*"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                  Selling Price (Rs) *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                  required
                  disabled={saving || isViewMode}
                  placeholder="0.00"
                  pattern="[0-9]*[.]?[0-9]*"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                disabled={saving || isViewMode}
              />
            </div>

            {/* Agency - Searchable Dropdown */}
            <div className="relative" ref={agencyDropdownRef}>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                Agency *
              </label>
              <button
                type="button"
                onClick={() => !isViewMode && !saving && setIsAgencyDropdownOpen(!isAgencyDropdownOpen)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={saving || isViewMode}
              >
                <span className="truncate text-sm">{getSelectedAgencyDisplay()}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isAgencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAgencyDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
                  <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search agencies..."
                        value={agencySearchTerm}
                        onChange={(e) => setAgencySearchTerm(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {agencySearchTerm && (
                        <button
                          type="button"
                          onClick={() => setAgencySearchTerm('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-60">
                  
                    
                    {filteredAgencies.length > 0 ? (
                      filteredAgencies.map((agency) => (
                        <button
                          key={agency.Agency_ID}
                          type="button"
                          onClick={() => handleAgencySelect(agency.Agency_ID.toString())}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                            formData.Agency_ID === agency.Agency_ID.toString() ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                          }`}
                        >
                          {agency.agencyname}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No agencies found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    is_active: e.target.checked ? 1 : 0
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={saving || isViewMode}
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            
            {!isViewMode && (
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#29996B] hover:bg-green-700 rounded-md focus:outline-none  disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isEditMode ? "Update Product" : "Add Product"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartProductModal;