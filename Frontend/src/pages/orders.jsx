import React, { useState, useEffect } from 'react';
import OrdersTable from '../components/orders/OrdersTable';
import { orderService } from '../services/orderService';

const Orders = () => {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0
  });
  const [customerOptions, setCustomerOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    orderId: '',
    customerName: '',
    printStatus: '', // '', 'printed', 'notPrinted'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const orders = await orderService.getAllOrders();
      const paidOrders = orders.filter(order => 
        order.paymentstatus?.toLowerCase() === 'paid'
      ).length;
      const pendingOrders = orders.filter(order => 
        order.paymentstatus?.toLowerCase() === 'pending'
      ).length;

      setStats({
        total: orders.length,
        paid: paidOrders,
        pending: pendingOrders
      });

      const uniqueCustomers = Array.from(
        new Set(
          orders
            .map(order => order.CustomerName)
            .filter(name => typeof name === 'string' && name.trim() !== '')
        )
      ).sort((a, b) => a.localeCompare(b));

      setCustomerOptions(uniqueCustomers);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    window.location.reload(); // Simple refresh for now
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#3F75B0]">Orders</h2>
        </div>
        <button
          onClick={refreshOrders}
          className="bg-[#048dcc] text-white px-4 py-2 rounded-lg hover:bg-[#3F75B0] flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Paid Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.paid}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">Order ID</label>
          <input
            type="text"
            value={filters.orderId}
            onChange={(e) => handleFilterChange('orderId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
            placeholder="Search by Order ID..."
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">Customer</label>
          <select
            value={filters.customerName}
            onChange={(e) => handleFilterChange('customerName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white"
          >
            <option value="">All Customers</option>
            {customerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">Print Status</label>
          <select
            value={filters.printStatus}
            onChange={(e) => handleFilterChange('printStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white"
          >
            <option value="">All</option>
            <option value="notPrinted">Not Printed</option>
            <option value="printed">Printed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable filters={filters} />
    </div>
  );
};

export default Orders;