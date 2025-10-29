// src/components/billing/BillingPage.jsx
import React, { useState, useEffect } from "react";
import InvoiceHeader from "./InvoiceHeader";
import ProductTable from "./ProductTable";
import ProductSearchModal from "./ProductSearchModal";
import InvoiceTotals from "./InvoiceTotals";
import { customerService, agencyService, userService, productService } from "../../services";

const BillingPage = () => {
  const [invoiceData, setInvoiceData] = useState({
    customer_id: "",
    salesperson_id: "",
    agency_id: "",
    date: new Date().toISOString().split('T')[0]
  });
  
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [customersData, agenciesData, usersData] = await Promise.all([
        customerService.getAllCustomers(),
        agencyService.getAllAgencies(),
        userService.getAllUsers()
      ]);

      setCustomers(customersData);
      setAgencies(agenciesData);
      
      // Filter users to get salespersons (you might want to adjust this logic based on your user roles)
      const salespersonsData = usersData.filter(user => 
        user.role?.toLowerCase().includes('sales') || 
        user.role?.toLowerCase().includes('user')
      );
      setSalespersons(salespersonsData);

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    const existingItemIndex = invoiceItems.findIndex(
      item => item.batchNumber === product.BatchNumber && item.productId === product.Product_ID
    );

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...invoiceItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].amount = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].rate;
      updatedItems[existingItemIndex].total = 
        (updatedItems[existingItemIndex].quantity + updatedItems[existingItemIndex].freeQuantity) * updatedItems[existingItemIndex].rate;
      setInvoiceItems(updatedItems);
    } else {
      // Add new product
      const newItem = {
        productId: product.Product_ID,
        productName: product.productname,
        batchNumber: product.BatchNumber,
        expiryDate: product.expiry_date,
        quantity: 1,
        freeQuantity: 0,
        rate: parseFloat(product.selling_price) || 0,
        amount: parseFloat(product.selling_price) || 0,
        total: parseFloat(product.selling_price) || 0
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }
    setIsProductModalOpen(false);
  };

  const updateItemQuantity = (index, field, value) => {
    const updatedItems = [...invoiceItems];
    
    if (field === 'quantity') {
      updatedItems[index].quantity = Math.max(0, parseInt(value) || 0);
    } else if (field === 'freeQuantity') {
      updatedItems[index].freeQuantity = Math.max(0, parseInt(value) || 0);
    }
    
    // Recalculate amount and total
    updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    
    // Calculate discount from free quantity
    const freeQuantityDiscount = updatedItems[index].freeQuantity * updatedItems[index].rate;
    
    // Total = (quantity + freeQuantity) * rate - but free quantity is essentially discount
    updatedItems[index].total = (updatedItems[index].quantity * updatedItems[index].rate);
    
    setInvoiceItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
  };

  const handleSubmitInvoice = async () => {
    if (!invoiceData.customer_id || !invoiceData.salesperson_id || !invoiceData.agency_id) {
      alert('Please fill in all required fields');
      return;
    }

    if (invoiceItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate free quantity discount (free items * rate)
      const freeQuantityDiscount = invoiceItems.reduce((total, item) => {
        return total + (item.freeQuantity * item.rate);
      }, 0);

      const totalDiscount = discount + freeQuantityDiscount;

      const invoicePayload = {
        ...invoiceData,
        items: invoiceItems,
        gross_total: grossTotal,
        discount: totalDiscount,
        free_quantity_discount: freeQuantityDiscount,
        additional_discount: discount,
        net_total: netTotal,
        status: 'completed'
      };

      // Note: You'll need to create an invoiceService for this
      // For now, using direct fetch until invoiceService is created
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoicePayload)
      });

      if (response.ok) {
        alert('Invoice created successfully!');
        // Reset form
        setInvoiceItems([]);
        setDiscount(0);
        setInvoiceData({
          customer_id: "",
          salesperson_id: "",
          agency_id: "",
          date: new Date().toISOString().split('T')[0]
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(`Error creating invoice: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const grossTotal = invoiceItems.reduce((total, item) => total + (item.quantity * item.rate), 0);
  const freeQuantityDiscount = invoiceItems.reduce((total, item) => total + (item.freeQuantity * item.rate), 0);
  const totalDiscount = discount + freeQuantityDiscount;
  const netTotal = grossTotal - totalDiscount;

  const handleInvoiceDataChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRetry = () => {
    fetchInitialData();
  };

  if (loading && customers.length === 0 && agencies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  if (error && customers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">Error loading billing data: {error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing</h1>
            <p className="text-gray-600">Create new invoice for customers</p>
          </div>

          {/* Invoice Header */}
          <InvoiceHeader
            invoiceData={invoiceData}
            customers={customers}
            salespersons={salespersons}
            agencies={agencies}
            onInvoiceDataChange={handleInvoiceDataChange}
          />

          {/* Products Table */}
          <ProductTable
            invoiceItems={invoiceItems}
            onAddProduct={() => setIsProductModalOpen(true)}
            onUpdateItem={updateItemQuantity}
            onRemoveItem={removeItem}
          />

          {/* Totals Section */}
          <InvoiceTotals
            grossTotal={grossTotal}
            discount={discount}
            freeQuantityDiscount={freeQuantityDiscount}
            netTotal={netTotal}
            onDiscountChange={setDiscount}
          />

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmitInvoice}
              disabled={invoiceItems.length === 0 || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </div>

      {/* Product Search Modal */}
      {isProductModalOpen && (
        <ProductSearchModal
          onClose={() => setIsProductModalOpen(false)}
          onSelectProduct={handleAddProduct}
          selectedAgencyId={invoiceData.agency_id}
        />
      )}
    </div>
  );
};

export default BillingPage;