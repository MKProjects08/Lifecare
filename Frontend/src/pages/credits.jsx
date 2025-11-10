import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { customerService } from '../services/customerService';

const Credit = () => {
  const [customerBalances, setCustomerBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPendingBalance, setTotalPendingBalance] = useState(0);

  useEffect(() => {
    loadCustomerBalances();
  }, []);

  const loadCustomerBalances = async () => {
    try {
      setLoading(true);
      setError('');

      // Get all orders and customers
      const [orders, customers] = await Promise.all([
        orderService.getAllOrders(),
        customerService.getAllCustomers()
      ]);

      // Filter only pending orders that have been printed at least once
      const pendingOrders = orders.filter(order => 
        order.paymentstatus?.toLowerCase() === 'pending' && (order.print_count || 0) > 0
      );

      // Create a map of customers for easy lookup
      const customersMap = {};
      customers.forEach(customer => {
        const customerId = customer.Customer_ID || customer.id;
        customersMap[customerId] = customer;
      });

      // Calculate balance for each customer
      const balancesMap = {};

      // Calculate pending amounts from orders
      pendingOrders.forEach(order => {
        if (order.Customer_ID && customersMap[order.Customer_ID]) {
          const customer = customersMap[order.Customer_ID];
          const customerId = customer.Customer_ID || customer.id;
          const pharmacyName = customer.pharmacyname || `Customer ${customerId}`;
          // Use gross_total as the order value for credits
          const orderValue = parseFloat(order.gross_total) || 0;

          if (!balancesMap[customerId]) {
            balancesMap[customerId] = {
              customerId,
              pharmacyName,
              pendingAmount: 0,
              pendingOrders: 0,
              customerData: customer
            };
          }

          balancesMap[customerId].pendingAmount += orderValue;

          balancesMap[customerId].pendingOrders += 1;
        }
      });

      // Convert to array and sort by highest pending amount
      const balancesArray = Object.values(balancesMap)
        .filter(customer => customer.pendingAmount > 0)
        .sort((a, b) => b.pendingAmount - a.pendingAmount);

      // Calculate total pending balance
      const totalBalance = balancesArray.reduce((sum, customer) => sum + customer.pendingAmount, 0);

      setCustomerBalances(balancesArray);
      setTotalPendingBalance(totalBalance);
    } catch (err) {
      setError('Failed to load customer credit data: ' + err.message);
      console.error('Error loading customer balances:', err);
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-sm text-gray-600">Total Customers with Credit</p>
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
              <p className="text-sm text-gray-600">Total Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {customerBalances.reduce((sum, customer) => sum + customer.pendingOrders, 0)}
              </p>
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
              <p className="text-sm text-gray-600">Total Pending Balance</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPendingBalance)}</p>
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
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Pending Orders</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Pending Amount</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {customerBalances.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No pending payments</p>
                      <p className="text-sm">All customers have cleared their payments</p>
                    </div>
                  </td>
                </tr>
              ) : (
                customerBalances.map((customer) => (
                  <tr key={customer.customerId} className="border-b border-[#E1F2F5]  hover:bg-gray-50 text-left">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{customer.pharmacyName}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500 font-mono">#{customer.customerId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {customer.pendingOrders} order(s)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(customer.pendingAmount)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Payment
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {customerBalances.length > 0 && (
          <div className="border-t border-[#E1F2F5] bg-gray-50 px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {customerBalances.length} customers with pending payments
              </div>
              <div className="text-sm font-semibold text-gray-800 bg-[#b8dae3] px-2.5 py-0.5 rounded-full">
                Total Outstanding: <span className="text-red-600">{formatCurrency(totalPendingBalance)}</span>
              </div>
            </div>
          </div>
        )}
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
                <strong>Note:</strong> This page shows the total pending amount for each customer where payment status is "pending". 
                The amounts are calculated based on the net total of unpaid orders and displayed with actual pharmacy names.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credit;