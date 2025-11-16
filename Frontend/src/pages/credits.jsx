// src/components/credit/Credit.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { customerService } from '../services/customerService';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Credit = () => {
  const [customerBalances, setCustomerBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCredits, setTotalCredits] = useState(0);
  const [withCreditsCount, setWithCreditsCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* -----------------------------------------------------------------
     FETCH CUSTOMER BALANCES
  ----------------------------------------------------------------- */
  useEffect(() => {
    loadCustomerBalances();
  }, []);

  const loadCustomerBalances = async () => {
    try {
      setLoading(true);
      setError('');

      const customers = await customerService.getAllCustomers();
      const toNumber = (v) => {
        const n = typeof v === 'string' ? parseFloat(v) : v;
        return isNaN(n) ? 0 : n;
      };

      const balancesArray = customers
        .map((c) => {
          const customerId = c.Customer_ID || c.id;
          const pharmacyName = c.pharmacyname || `Customer ${customerId}`;
          const credits = toNumber(c.credits);
          return {
            customerId,
            pharmacyName,
            credits,
            statusLabel: credits > 0 ? 'Has Credit' : 'No Credit',
            customerData: c
          };
        })
        .sort((a, b) => b.credits - a.credits);

      const total = balancesArray.reduce((sum, c) => sum + c.credits, 0);
      const withCredits = balancesArray.filter(c => c.credits > 0).length;

      setCustomerBalances(balancesArray);
      setTotalCredits(total);
      setWithCreditsCount(withCredits);
    } catch (err) {
      setError('Failed to load customer credit data: ' + err.message);
      console.error('Error loading customer balances:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page when rowsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

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
     DYNAMIC ROWS-PER-PAGE OPTIONS (4 options)
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    const total = customerBalances.length;
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
  }, [customerBalances.length]);

  /* -----------------------------------------------------------------
     DEFAULT ROWS-PER-PAGE – largest when less than or equal to 10, allow any selection
  ----------------------------------------------------------------- */
  useEffect(() => {
    const total = customerBalances.length;

    if (total === 0) {
      setRowsPerPage(10);
      return;
    }

    const lastOption = pageSizeOptions[pageSizeOptions.length - 1];

    // First render: if total less than or equal to 10 → default to largest
    if (total <= 10 && rowsPerPage === 10) {
      setRowsPerPage(lastOption);
      return;
    }

    // Reset if current value is invalid
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 10);
    }
  }, [pageSizeOptions, rowsPerPage, customerBalances.length]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = customerBalances.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(customerBalances.length / rowsPerPage));

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
     HELPERS
  ----------------------------------------------------------------- */
  const formatCurrency = (amount) => {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  const handleRetry = () => {
    loadCustomerBalances();
  };

  const refreshData = () => {
    loadCustomerBalances();
  };

  /* -----------------------------------------------------------------
     RENDER – LOADING / ERROR
  ----------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading customer credits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  /* -----------------------------------------------------------------
     MAIN RENDER
  ----------------------------------------------------------------- */
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3F75B0]">Customer Credit</h2>
        </div>
        <button
          onClick={refreshData}
          className="bg-[#048dcc] text-white px-4 py-2 rounded-lg hover:bg-[#3F75B0] flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-800">{customerBalances.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Customers With Credit</p>
              <p className="text-2xl font-bold text-gray-800">{withCreditsCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Balances Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-[#E1F2F5]">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Pharmacy Name</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer ID</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Credits Amount</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm">Add customers to see credit values</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRows.map((customer) => (
                  <tr key={customer.customerId} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{customer.pharmacyName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500 font-mono">#{customer.customerId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-lg font-bold text-red-600">{formatCurrency(customer.credits)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.credits > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {customer.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-[#E1F2F5] bg-gray-50 px-4 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
              Total Customers: {customerBalances.length}
            </div>
          </div>

          {/* Pagination Buttons */}
          <div className="mt-4 flex justify-center items-center space-x-1">
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

          <div className="mt-2 text-center text-sm text-gray-500">
            Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, customerBalances.length)} of {customerBalances.length} customers
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {customerBalances.length > 0 && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> This page shows the credits stored on each customer record. Values are read directly from the Customers table.
              </p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Credit;