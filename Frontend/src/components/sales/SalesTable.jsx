// src/components/sales/SalesTable.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { orderService } from '../../services/orderService';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const SalesTable = ({ filters = {} }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

      if (filters.startDate || filters.endDate) {
        const orderDate = sale.created_at || sale.paid_date;
        if (!orderDate) return false;
        const saleDate = new Date(orderDate);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (startDate && saleDate < startDate) return false;
        if (endDate && saleDate > endDate) return false;
      }
      return true;
    });
  }, [sales, filters]);

  /* -----------------------------------------------------------------
     DYNAMIC ROWS-PER-PAGE OPTIONS (4 options)
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    const total = filteredSales.length;
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
  }, [filteredSales.length]);

  /* -----------------------------------------------------------------
     DEFAULT ROWS-PER-PAGE – largest when ≤10, allow any selection
  ----------------------------------------------------------------- */
  useEffect(() => {
    const total = filteredSales.length;

    if (total === 0) {
      setRowsPerPage(10);
      return;
    }

    const lastOption = pageSizeOptions[pageSizeOptions.length - 1];

    // First render: if total ≤10 → default to largest
    if (total <= 10 && rowsPerPage === 10) {
      setRowsPerPage(lastOption);
      return;
    }

    // Reset if current value is invalid
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 10);
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
     CALCULATIONS
  ----------------------------------------------------------------- */
  const totals = currentRows.reduce((acc, sale) => {
    const grossTotal = parseFloat(sale.gross_total) || 0;
    const netTotal = parseFloat(sale.net_total) || 0;
    const discount = parseFloat(sale.discount_amount) || 0;
    return {
      grossTotal: acc.grossTotal + grossTotal,
      netTotal: acc.netTotal + netTotal,
      discount: acc.discount + discount,
      count: acc.count + 1
    };
  }, { grossTotal: 0, netTotal: 0, discount: 0, count: 0 });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleRetry = () => {
    loadSales();
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totals.count}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-600">
              <p className="text-sm text-gray-600">Gross Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.grossTotal)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-600">
              <p className="text-sm text-gray-600">Total Discount</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.discount)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-600">
              <p className="text-sm text-gray-600">Net Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.netTotal)}</p>
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
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Net Total</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
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
                  <td className="py-3 px-4 font-semibold">
                    {formatCurrency(parseFloat(sale.net_total) || 0)}
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
    </>
  );
};

export default SalesTable;