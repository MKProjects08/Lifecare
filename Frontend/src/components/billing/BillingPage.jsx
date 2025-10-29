// src/components/billing/BillingPage.jsx
import React, { useState, useEffect } from "react";
import InvoiceHeader from "./InvoiceHeader";
import ProductTable from "./ProductTable";
import ProductSearchModal from "./ProductSearchModal";
import InvoiceTotals from "./InvoiceTotals";

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

  // Fetch initial data
  useEffect(() => {
    fetchCustomers();
    fetchSalespersons();
    fetchAgencies();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  };

  const fetchCustomers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSalespersons = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/api/salespersons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSalespersons(data);
      }
    } catch (error) {
      console.error('Error fetching salespersons:', error);
    }
  };

  const fetchAgencies = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:3000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
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
      const token = getAuthToken();
      
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

      const response = await fetch('http://localhost:3000/api/invoices', {
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
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice. Please try again.');
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
              disabled={invoiceItems.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Create Invoice
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