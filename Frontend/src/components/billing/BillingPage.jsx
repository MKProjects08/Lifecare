// src/components/billing/BillingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import InvoiceHeader from "./InvoiceHeader";
import ProductTable from "./ProductTable";
import ProductSearchModal from "./ProductSearchModal";
import InvoiceTotals from "./InvoiceTotals";
import {
  customerService,
  agencyService,
  userService,
  orderService
} from "../../services";

const BillingPage = () => {
  const [invoiceData, setInvoiceData] = useState({
    customer_id: "",
    salesperson_id: "",
    agency_id: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch initial data only once
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersData, agenciesData, usersData] = await Promise.all([
        customerService.getAllCustomers(),
        agencyService.getAllAgencies(),
        userService.getAllUsers(),
      ]);

      setCustomers(customersData);
      setAgencies(agenciesData);

      const salespersonsData = usersData.filter(
        (user) =>
          user.role?.toLowerCase().includes("sales") ||
          user.role?.toLowerCase().includes("user")
      );
      setSalespersons(salespersonsData);
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Memoized callbacks to prevent unnecessary re-renders
  const handleAddProduct = useCallback(
    (product) => {
      setInvoiceItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.batchNumber === product.BatchNumber &&
            item.productId === product.Product_ID
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity += 1;
          updatedItems[existingItemIndex].amount =
            updatedItems[existingItemIndex].quantity *
            updatedItems[existingItemIndex].rate;
          updatedItems[existingItemIndex].total =
            (updatedItems[existingItemIndex].quantity +
              updatedItems[existingItemIndex].freeQuantity) *
            updatedItems[existingItemIndex].rate;
          return updatedItems;
        } else {
          const newItem = {
            productId: product.Product_ID,
            productName: product.productname,
            batchNumber: product.BatchNumber,
            expiryDate: product.expiry_date,
            quantity: 1,
            freeQuantity: 0,
            rate: parseFloat(product.selling_price) || 0,
            amount: parseFloat(product.selling_price) || 0,
            total: parseFloat(product.selling_price) || 0,
          };
          return [...prevItems, newItem];
        }
      });

      setIsProductModalOpen(false);
    },
    []
  );

  const updateItemQuantity = useCallback((index, field, value) => {
    setInvoiceItems((prevItems) => {
      const updatedItems = [...prevItems];

      if (field === "quantity") {
        updatedItems[index].quantity = Math.max(0, parseInt(value) || 0);
      } else if (field === "freeQuantity") {
        updatedItems[index].freeQuantity = Math.max(0, parseInt(value) || 0);
      }

      updatedItems[index].amount =
        updatedItems[index].quantity * updatedItems[index].rate;
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].rate;

      return updatedItems;
    });
  }, []);

  const removeItem = useCallback((index) => {
    setInvoiceItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, []);

  const handleInvoiceDataChange = useCallback((field, value) => {
    setInvoiceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // ✅ Pre-calculate totals (no state updates inside render)
  const grossTotal = invoiceItems.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  );
  const freeQuantityDiscount = invoiceItems.reduce(
    (total, item) => total + item.freeQuantity * item.rate,
    0
  );
  const totalDiscount = discount + freeQuantityDiscount;
  const netTotal = grossTotal - totalDiscount;

  const handleSubmitInvoice = async () => {
    if (
      !invoiceData.customer_id ||
      !invoiceData.salesperson_id ||
      !invoiceData.agency_id
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (invoiceItems.length === 0) {
      alert("Please add at least one product");
      return;
    }

    try {
      setLoading(true);

      const freeQuantityDiscount = invoiceItems.reduce(
        (total, item) => total + item.freeQuantity * item.rate,
        0
      );
      const totalDiscount = discount + freeQuantityDiscount;

      const orderPayload = {
        Customer_ID: parseInt(invoiceData.customer_id),
        Agency_ID: parseInt(invoiceData.agency_id),
        User_ID: parseInt(invoiceData.salesperson_id),
        paid_date: invoiceData.date,
        paymentstatus: "pending",
        print_count: 0,
        gross_total: grossTotal,
        net_total: netTotal,
        discount_amount: totalDiscount,
        items: invoiceItems.map((item) => ({
          productId: item.productId,
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          free_issue_quantity: item.freeQuantity || 0,
        })),
      };

      const result = await orderService.createOrderWithItems(orderPayload);

      alert(`Order created successfully! Order ID: ${result.orderId}`);

      // Reset form
      setInvoiceItems([]);
      setDiscount(0);
      setInvoiceData({
        customer_id: "",
        salesperson_id: "",
        agency_id: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert(
        `Error creating order: ${
          error.response?.data?.error || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchInitialData();
  };

  // ✅ Render states
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
            <p className="text-red-600 mb-4">
              Error loading billing data: {error}
            </p>
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
            <p className="text-gray-600">Create new order for customers</p>
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
              {loading ? "Creating Order..." : "Create Order"}
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
