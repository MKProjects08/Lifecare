// src/components/order/OrdersTable.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import OrderDetailsPopup from './OrderDetailsPopup';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const OrdersTable = ({ filters = {} }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  /* -----------------------------------------------------------------
     FETCH ORDERS
  ----------------------------------------------------------------- */
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData || []);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingOrderId(orderId);
      setError('');
      const orderDetails = await orderService.getOrderById(orderId);
      setSelectedOrder(orderDetails);
      setShowPopup(true);
    } catch (err) {
      setError('Failed to load order details: ' + err.message);
      console.error('Error loading order details:', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handlePrint = (order) => {
    const oid = order.Order_ID || order.id;
    if (!oid) return;
    navigate(`/print/${oid}`);
  };

  const getPrintLabel = (order) => {
    const printCount = order.print_count || 0;
    return printCount === 0 ? 'Original' : `Copy (${printCount})`;
  };

  const getPrintButtonClass = (order) => {
    const printCount = order.print_count || 0;
    return printCount === 0 ? 'text-[#29996B]' : 'text-orange-300';
  };

  const formatTableCurrency = (value) => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : `${numValue.toFixed(2)}`;
  };

  /* -----------------------------------------------------------------
     FILTER LOGIC
  ----------------------------------------------------------------- */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderIdText = String(
        order.FormattedOrderID || order.Order_ID || order.id || ''
      ).toLowerCase();

      const matchesOrderId =
        !filters.orderId ||
        orderIdText.includes(String(filters.orderId).toLowerCase());

      const matchesCustomer =
        !filters.customerName ||
        (order.CustomerName &&
          order.CustomerName.toLowerCase() === filters.customerName.toLowerCase());

      // Keep support for potential agency / payment status filters (not used on this page now)
      const matchesAgency =
        !filters.agencyName ||
        (order.AgencyName &&
          order.AgencyName.toLowerCase().includes(filters.agencyName.toLowerCase()));

      const matchesPaymentStatus =
        !filters.paymentStatus ||
        order.paymentstatus === filters.paymentStatus;

      const printCount = order.print_count || 0;
      const matchesPrintStatus =
        !filters.printStatus ||
        (filters.printStatus === 'printed' && printCount > 0) ||
        (filters.printStatus === 'notPrinted' && printCount === 0);

      return (
        matchesOrderId &&
        matchesCustomer &&
        matchesAgency &&
        matchesPaymentStatus &&
        matchesPrintStatus
      );
    });
  }, [orders, filters]);

  // Always show latest orders first (highest ID first)
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const aId = a.Order_ID || a.id || 0;
      const bId = b.Order_ID || b.id || 0;
      return bId - aId;
    });
  }, [filteredOrders]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedOrders.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / rowsPerPage));

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  /* -----------------------------------------------------------------
     RENDER – LOADING / ERROR
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={loadOrders}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------------------
     MAIN RENDER
  ----------------------------------------------------------------- */
  return (
    <>
      {/* Error Alert */}
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-4 bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#E1F2F5]">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Order ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Agency Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Gross Total</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Print</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                  {orders.length === 0 ? "No orders found" : "No orders match your filters"}
                </td>
              </tr>
            ) : (
              currentRows.map((order) => (
                <tr key={order.Order_ID || order.id} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                  <td className="py-3 px-4">
                    <span className="font-mono text-blue-600">
                      {order.FormattedOrderID || `ORD-${order.Order_ID || order.id}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">{order.CustomerName || 'N/A'}</td>
                  <td className="py-3 px-4">{order.AgencyName || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{formatTableCurrency(order.gross_total)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentstatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentstatus || 'unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (order.print_count || 0) === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {getPrintLabel(order)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order.Order_ID || order.id)}
                        disabled={loadingOrderId === (order.Order_ID || order.id)}
                        className="flex items-center px-3 py-1 text-sm disabled:cursor-not-allowed"
                        title="View Order Details"
                      >
                        {loadingOrderId === (order.Order_ID || order.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Loading...
                          </>
                        ) : (
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="#3F75B0" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handlePrint(order)}
                        className={`flex items-center px-3 py-1 rounded text-sm ${getPrintButtonClass(order)}`}
                        title="Print Order"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: Dropdown + Showing + Total */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-700">Rows per page:</span>
          <span className="text-gray-700">{rowsPerPage}</span>
        </div>

        <div className="text-sm font-semibold text-gray-700">
          Total Orders: {sortedOrders.length}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex justify-center items-center space-x-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>

          {pageNumbers.length > 0 ? (
            pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentPage === num
                    ? "bg-[#3F75B0] text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))
          ) : (
            <button className="px-3 py-1 rounded text-sm font-medium bg-[#3F75B0] text-white">
              1
            </button>
          )}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, sortedOrders.length)} of {sortedOrders.length} orders
        </div>
      </div>

      {/* Order Details Popup */}
      {showPopup && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => {
            setShowPopup(false);
            setSelectedOrder(null);
          }}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default OrdersTable;