import React, { useState } from 'react';
import SalesFilters from '../components/sales/SalesFilters';
import SalesTable from '../components/sales/SalesTable';

const Sales = () => {
  const [filters, setFilters] = useState({
    customer: '',
    agency: '',
    user: '',
    paymentStatus: 'all',
    startDate: '',
    endDate: ''
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-600 mt-1">View and analyze all sales records</p>
        </div>
        <button
          onClick={refreshData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <SalesFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow">
        <SalesTable filters={filters} />
      </div>
    </div>
  );
};

export default Sales;