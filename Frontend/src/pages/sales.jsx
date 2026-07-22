import React, { useState } from 'react';
import SalesFilters from '../components/sales/SalesFilters';
import SalesTable from '../components/sales/SalesTable';
import { analyticsService } from '../services/analyticsService';

const Sales = () => {
  const [filters, setFilters] = useState({
    customer: '',
    agency: '',
    user: '',
    paymentStatus: 'all',
    startDate: '',
    endDate: '',
    paidStartDate: '',
    paidEndDate: ''
  });

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const refreshData = () => {
    window.location.reload();
  };

  const handlePrint = async () => {
    try {
      const html = await analyticsService.getSalesReportPrintHtml(filters);
      document.open();
      document.write(html);
      document.close();
    } catch (e) {
      console.error('Failed to open printable sales report:', e);
      alert('Failed to open sales report for printing: ' + (e.message || 'Unknown error'));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await analyticsService.downloadSalesReportExcel(filters);
    } catch (e) {
      console.error('Failed to download sales report Excel:', e);
      alert('Failed to download sales report Excel: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3F75B0]">Sales</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="bg-[#048dcc] text-white px-4 py-2 rounded-lg hover:bg-bg-[#E1F2F5] flex items-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={handlePrint}
            className="bg-white border border-[#048dcc] text-[#048dcc] px-4 py-2 rounded-lg hover:bg-[#E1F2F5] flex items-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4a2 2 0 012-2h8a2 2 0 012 2v5M6 18H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2h-1M10 18h4" />
            </svg>
            Print
          </button>
          <button
            onClick={handleDownloadExcel}
            className="bg-white border border-[#29996B] text-[#29996B] px-4 py-2 rounded-lg hover:bg-[#E1F2F5] flex items-center transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <SalesFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Sales Table */}
     
        <SalesTable filters={filters} />
    
    </div>
  );
};

export default Sales;