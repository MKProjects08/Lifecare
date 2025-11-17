// src/components/sales/SalesTable.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { orderService } from '../../services/orderService';
import OrderDetailsPopup from '../orders/OrderDetailsPopup';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const SalesTable = ({ filters = {} }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [paymentEditOrderId, setPaymentEditOrderId] = useState(null);
  const [paymentEditDate, setPaymentEditDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* -----------------------------------------------------------------
     FETCH SALES
  ----------------------------------------------------------------- */
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError('');
      const salesData = await orderService.getAllOrders();
      setSales(salesData || []);
    } catch (err) {
      setError('Failed to load sales data: ' + err.message);
      console.error('Error loading sales:', err);
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

  /* -----------------------------------------------------------------
     FILTER LOGIC
  ----------------------------------------------------------------- */
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (filters.customer && sale.Customer_ID != filters.customer) return false;
      if (filters.agency && sale.Agency_ID != filters.agency) return false;
      if (filters.user && sale.User_ID != filters.user) return false;
      if (filters.paymentStatus !== 'all' && sale.paymentstatus !== filters.paymentStatus) return false;

      // Only include orders that have been printed at least once
      if (!sale.print_count || sale.print_count <= 0) return false;

      if (filters.startDate || filters.endDate) {
        const orderDate = sale.created_at || sale.paid_date;
        if (!orderDate) return false;
        const saleDate = new Date(orderDate);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate && saleDate < startDate) return false;
        if (endDate && saleDate > endDate) return false;
      }

      if (filters.paidStartDate || filters.paidEndDate) {
        const paidDateValue = sale.paid_date;
        if (!paidDateValue) return false;

        const paidDate = new Date(paidDateValue);
        const paidStart = filters.paidStartDate ? new Date(filters.paidStartDate) : null;
        const paidEnd = filters.paidEndDate ? new Date(filters.paidEndDate) : null;

        if (paidStart && paidDate < paidStart) return false;
        if (paidEnd && paidDate > paidEnd) return false;
      }
      return true;
    });
  }, [sales, filters]);

  /* -----------------------------------------------------------------
     TOTALS FOR WIDGETS (ALL FILTERED SALES, ALL PAGES)
  ----------------------------------------------------------------- */
  const widgetTotals = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const grossTotal = parseFloat(sale.gross_total) || 0;
      const discount = parseFloat(sale.discount_amount) || 0;
      return {
        grossTotal: acc.grossTotal + grossTotal,
        discount: acc.discount + discount,
        count: acc.count + 1
      };
    }, { grossTotal: 0, discount: 0, count: 0 });
  }, [filteredSales]);

  /* -----------------------------------------------------------------
     ROWS-PER-PAGE OPTIONS (LOCKED TO 15)
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    return [15];
  }, []);

  /* -----------------------------------------------------------------
     DEFAULT ROWS-PER-PAGE – largest when ≤15, allow any selection
  ----------------------------------------------------------------- */
  useEffect(() => {
    const total = filteredSales.length;

    if (total === 0) {
      setRowsPerPage(15);
      return;
    }

    const lastOption = pageSizeOptions[pageSizeOptions.length - 1];

    // First render: if total ≤15 → default to largest
    if (total <= 15 && rowsPerPage === 15) {
      setRowsPerPage(lastOption);
      return;
    }

    // Reset if current value is invalid
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 15);
    }
  }, [pageSizeOptions, rowsPerPage, filteredSales.length]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredSales.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(filteredSales.length / rowsPerPage));

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
     CALCULATIONS (WIDGET TOTALS BASED ON FILTERED SALES)
  ----------------------------------------------------------------- */
  const totals = widgetTotals;

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleRetry = () => {
    loadSales();
  };

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

  const handleOpenPaidEditor = (sale) => {
    const oid = sale.Order_ID || sale.id;
    if (!oid) return;

    // Default date: today in YYYY-MM-DD
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    setPaymentEditOrderId(oid);
    setPaymentEditDate(`${y}-${m}-${d}`);
  };

  const handleConfirmMarkAsPaid = async (sale) => {
    const oid = sale.Order_ID || sale.id;
    if (!oid) return;

    if (!paymentEditDate) {
      toast.error('Please select a paid date.');
      return;
    }

    try {
      await orderService.updateOrderPaymentStatus(oid, 'paid', paymentEditDate);
      toast.success('Payment status updated to paid');
      setPaymentEditOrderId(null);
      setPaymentEditDate('');
      loadSales();
    } catch (err) {
      console.error('Error updating payment status:', err);
      toast.error('Failed to update payment status: ' + err.message);
    }
  };

  const handleCancelMarkAsPaid = () => {
    setPaymentEditOrderId(null);
    setPaymentEditDate('');
  };

  /* -----------------------------------------------------------------
     RENDER – LOADING / ERROR
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales...</p>
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
            onClick={handleRetry}
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
      {/* SCREEN VIEW (hidden when printing) */}
      <div className="print:hidden">
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

        {/* Totals Section */}
        {filteredSales.length > 0 && (
          <div className="mt-4 bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{totals.count}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-600">
                <p className="text-sm text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.grossTotal)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-600">
                <p className="text-sm text-gray-600">Total Discount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.discount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#E1F2F5]">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Order ID</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Agency</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">User</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Order Date</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Payment Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Gross Total</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-4 px-4 text-center text-gray-500">
                    {sales.length === 0 ? "No sales records found" : "No sales match your filters"}
                  </td>
                </tr>
              ) : (
                currentRows.map((sale) => (
                  <tr key={sale.Order_ID || sale.id} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                    <td className="py-3 px-4">
                      <span className="font-mono text-blue-600">
                        {sale.FormattedOrderID || `ORD-${sale.Order_ID || sale.id}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">{sale.CustomerName || 'N/A'}</td>
                    <td className="py-3 px-4">{sale.AgencyName || 'N/A'}</td>
                    <td className="py-3 px-4">{sale.UserName || 'N/A'}</td>
                    <td className="py-3 px-4">{formatDate(sale.created_at)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sale.paymentstatus === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.paymentstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {sale.paymentstatus || 'unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {formatCurrency(parseFloat(sale.gross_total) || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrder(sale.Order_ID || sale.id)}
                            disabled={loadingOrderId === (sale.Order_ID || sale.id)}
                            className="flex items-center px-3 py-1 text-sm disabled:cursor-not-allowed"
                            title="View Order Details"
                          >
                            {loadingOrderId === (sale.Order_ID || sale.id) ? (
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
                          {sale.paymentstatus === 'pending' && (
                            <button
                              onClick={() => handleOpenPaidEditor(sale)}
                              className="flex items-center px-3 py-1 rounded text-sm bg-green-600 text-white hover:bg-green-700"
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>

                        {sale.paymentstatus === 'pending' && paymentEditOrderId === (sale.Order_ID || sale.id) && (
                          <div className="flex items-center space-x-2 text-sm">
                            <input
                              type="date"
                              value={paymentEditDate}
                              onChange={(e) => setPaymentEditDate(e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1"
                            />
                            <button
                              onClick={() => handleConfirmMarkAsPaid(sale)}
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={handleCancelMarkAsPaid}
                              className="px-3 py-1 rounded bg-gray-300 text-gray-800 hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {sale.paymentstatus === 'paid' && sale.paid_date
                        ? formatDate(sale.paid_date)
                        : '-'}
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
            Total Sales: {filteredSales.length}
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
            Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, filteredSales.length)} of {filteredSales.length} sales records
          </div>
        </div>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      {showPopup && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => {
            setShowPopup(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* PRINT VIEW (only when printing) */}
      <div className="hidden print:block">
        <h2 className="text-2xl font-bold mb-2">Sales Report</h2>
        <p className="mb-4 text-sm">Printed on {new Date().toLocaleString()}</p>

        {filteredSales.length === 0 ? (
          <p className="text-sm text-gray-700">No sales match your filters.</p>
        ) : (
          <table className="min-w-full table-auto text-xs border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-2 py-1 text-left">Order ID</th>
                <th className="border border-gray-400 px-2 py-1 text-left">Customer</th>
                <th className="border border-gray-400 px-2 py-1 text-left">Agency</th>
                <th className="border border-gray-400 px-2 py-1 text-left">User</th>
                <th className="border border-gray-400 px-2 py-1 text-left">Order Date</th>
                <th className="border border-gray-400 px-2 py-1 text-left">Payment</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Gross</th>
                <th className="border border-gray-400 px-2 py-1 text-right">Discount</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.Order_ID || sale.id}>
                  <td className="border border-gray-400 px-2 py-1">
                    {sale.FormattedOrderID || `ORD-${sale.Order_ID || sale.id}`}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">{sale.CustomerName || 'N/A'}</td>
                  <td className="border border-gray-400 px-2 py-1">{sale.AgencyName || 'N/A'}</td>
                  <td className="border border-gray-400 px-2 py-1">{sale.UserName || 'N/A'}</td>
                  <td className="border border-gray-400 px-2 py-1">{formatDate(sale.created_at)}</td>
                  <td className="border border-gray-400 px-2 py-1">{sale.paymentstatus || 'unknown'}</td>
                  <td className="border border-gray-400 px-2 py-1 text-right">
                    {formatCurrency(parseFloat(sale.gross_total) || 0)}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-right">
                    {formatCurrency(parseFloat(sale.discount_amount) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default SalesTable;