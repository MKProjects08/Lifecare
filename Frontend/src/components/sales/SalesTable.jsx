import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const SalesTable = ({ filters }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError('');
      const salesData = await orderService.getAllOrders();
      setSales(salesData);
    } catch (err) {
      setError('Failed to load sales data: ' + err.message);
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to sales data
  const filteredSales = sales.filter(sale => {
    // Customer filter
    if (filters.customer && sale.Customer_ID != filters.customer) {
      return false;
    }

    // Agency filter
    if (filters.agency && sale.Agency_ID != filters.agency) {
      return false;
    }

    // User filter
    if (filters.user && sale.User_ID != filters.user) {
      return false;
    }

    // Payment status filter
    if (filters.paymentStatus !== 'all' && sale.paymentstatus !== filters.paymentStatus) {
      return false;
    }

    // Date range filter
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

  // Calculate totals
  const totals = filteredSales.reduce((acc, sale) => {
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleRetry = () => {
    loadSales();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div>
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
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
                  No sales records found
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
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

      

      {/* Results Count */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredSales.length} of {sales.length} sales records
        </div>
        {filteredSales.length > 0 && (
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTable;