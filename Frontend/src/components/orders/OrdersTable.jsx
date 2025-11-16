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
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  // Reset page when filters or rowsPerPage change
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
      const matchesCustomer =
        !filters.customerName ||
        (order.CustomerName &&
          order.CustomerName.toLowerCase().includes(filters.customerName.toLowerCase()));

      const matchesAgency =
        !filters.agencyName ||
        (order.AgencyName &&
          order.AgencyName.toLowerCase().includes(filters.agencyName.toLowerCase()));

      const matchesStatus =
        !filters.paymentStatus ||
        order.paymentstatus === filters.paymentStatus;

      return matchesCustomer && matchesAgency && matchesStatus;
    });
  }, [orders, filters]);

  /* -----------------------------------------------------------------
     DYNAMIC ROWS-PER-PAGE OPTIONS (4 options)
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    const total = filteredOrders.length;
    if (total === 0) return [10];

    const options = new Set();
    options.add(total);
    let power = 1;
    while (power <= total) {
      options.add(power);
      power *= 2;
    }
    [2, 3, 5, 10].forEach((divisor) => {
      const val = Math.floor(total / divisor);
      if (val >= 5 && val <= total) options.add(val);
    });
    const sorted = Array.from(options).sort((a, b) => a - b);
    return sorted.slice(-4);
  }, [filteredOrders.length]);

  /* -----------------------------------------------------------------
     DEFAULT ROWS-PER-PAGE – keep largest as default when ≤10,
     but **allow any selection**
  ----------------------------------------------------------------- */
  useEffect(() => {
    const total = filteredOrders.length;

    if (total === 0) {
      setRowsPerPage(10);
      return;
    }

    const lastOption = pageSizeOptions[pageSizeOptions.length - 1];

    // First render only: if total ≤10 → default to largest option
    if (total <= 10 && rowsPerPage === 10) {
      setRowsPerPage(lastOption);
      return;
    }

    // If current rowsPerPage is no longer valid → reset to first option
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 10);
    }
  }, [pageSizeOptions, rowsPerPage, filteredOrders.length]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredOrders.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));

  const getPageNumbers = () => {
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push(-1);
    for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) pages.push(i);
    if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
    for (let i = currentPage + 1; i <= Math.min(totalPages - 1, currentPage + 2); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push(-1);
    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) pages.push(totalPages);
    return Array.from(new Set(pages.filter(p => p > 0)));
  };

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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rowsPerPage}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setRowsPerPage(size);
                      setDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-blue-100 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

       
        </div>

        <div className="text-sm font-semibold text-gray-700">
          Total Orders: {filteredOrders.length}
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

          {getPageNumbers().length > 0 ? (
            getPageNumbers().map((num) => (
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
          Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, filteredOrders.length)} of {filteredOrders.length} orders
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