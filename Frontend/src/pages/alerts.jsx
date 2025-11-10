import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';

const Alerts = () => {
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [summary, setSummary] = useState({
    expiryAlertsCount: 0,
    stockAlertsCount: 0,
    totalAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'expiry', 'stock'

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const alertsData = await alertService.getAllAlerts();
      
      setExpiryAlerts(alertsData.expiryAlerts);
      setStockAlerts(alertsData.stockAlerts);
      setSummary(alertsData.summary);
    } catch (err) {
      setError('Failed to load alerts: ' + err.message);
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getExpiryAlertClass = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return 'bg-red-100 text-red-800 border-red-200';
    if (daysUntilExpiry <= 30) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getStockAlertClass = (quantity) => {
    if (quantity <= 20) return 'bg-red-100 text-red-800 border-red-200';
    if (quantity <= 50) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getExpiryStatusText = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 7) return 'Critical - Expires Soon';
    if (daysUntilExpiry <= 30) return 'Warning - Expiring Soon';
    return 'Notice - Expiring';
  };

  const getStockStatusText = (quantity) => {
    if (quantity <= 20) return 'Critical - Very Low Stock';
    if (quantity <= 50) return 'Warning - Low Stock';
    return 'Notice - Stock Running Low';
  };

  const handleRetry = () => {
    loadAlerts();
  };

  const refreshData = () => {
    loadAlerts();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3F75B0]">Alerts & Notifications</h2>
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
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-800">{summary.totalAlerts}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Expiry Alerts</p>
              <p className="text-2xl font-bold text-gray-800">{summary.expiryAlertsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Within 60 days</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-800">{summary.stockAlertsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Below 100 units</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#E1F2F5] rounded-lg shadow mb-6">
        <div className="border-b border-[#E1F2F5]">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-yellow-600 text-yellow-600 '
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Alerts ({summary.totalAlerts})
            </button>
            <button
              onClick={() => setActiveTab('expiry')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'expiry'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expiry Alerts ({summary.expiryAlertsCount})
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stock Alerts ({summary.stockAlertsCount})
            </button>
          </nav>
        </div>
      </div>

      {/* Alerts Content */}
      <div className="space-y-6">
        {/* Expiry Alerts */}
        {(activeTab === 'all' || activeTab === 'expiry') && expiryAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-orange-600 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expiry Alerts ({expiryAlerts.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-[#E1F2F5]">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Product Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Batch Number</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Expiry Date</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Days Until Expiry</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Quantity</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryAlerts.map((alert) => (
                    <tr key={`expiry-${alert.BatchNumber}`} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{alert.productname}</p>
                          <p className="text-sm text-gray-500">{alert.generic_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-blue-600">{alert.BatchNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{formatDate(alert.expiry_date)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold">{alert.daysUntilExpiry} days</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{alert.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getExpiryAlertClass(alert.daysUntilExpiry)}`}>
                          {getExpiryStatusText(alert.daysUntilExpiry)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Alerts */}
        {(activeTab === 'all' || activeTab === 'stock') && stockAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-red-800 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Stock Alerts ({stockAlerts.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-[#E1F2F5]">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Product Name</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Batch Number</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Current Quantity</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Selling Price</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Stock Value</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockAlerts.map((alert) => (
                    <tr key={`stock-${alert.BatchNumber}`} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{alert.productname}</p>
                          <p className="text-sm text-gray-500">{alert.generic_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-blue-600">{alert.BatchNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold">{alert.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{formatCurrency(alert.selling_price)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{formatCurrency(alert.quantity * alert.selling_price)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStockAlertClass(alert.quantity)}`}>
                          {getStockStatusText(alert.quantity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        

        {/* No Alerts Message */}
        {summary.totalAlerts === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Alerts</h3>
            <p className="text-gray-600">All products are well-stocked and no items are expiring soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;