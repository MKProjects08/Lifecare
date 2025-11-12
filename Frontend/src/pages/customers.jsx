import React, { useState, useEffect } from 'react';
import CustomersTable from '../components/customers/CustomersTable';
import { customerService } from '../services/customerService';

const Customers = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withCredits: 0,
    totalCredits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const customers = await customerService.getAllCustomers();
      const activeCustomers = customers.filter(customer => customer.is_active !== false).length;
      const customersWithCredits = customers.filter(customer => (customer.credits || 0) > 0).length;
      const toNumber = (v) => {
        const n = typeof v === 'string' ? parseFloat(v) : v;
        return isNaN(n) ? 0 : n;
      };
      const totalCredits = customers.reduce((sum, customer) => sum + toNumber(customer.credits), 0);

      setStats({
        total: customers.length,
        active: activeCustomers,
        withCredits: customersWithCredits,
        totalCredits
      });
    } catch (error) {
      console.error('Error loading customer stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  const formatCurrency = (amount) => {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <main className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#3F75B0]">Pharmacy Management</h2>
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

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Pharmacies</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Active Pharmacies</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">With Credits</p>
                  <p className="text-2xl font-bold text-red-600">{stats.withCredits}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            
          </div>
        )}

        {/* Customers Table */}
       
          <CustomersTable />
       
      </main>
    </div>
  );
};

export default Customers;