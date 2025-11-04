import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { agencyService } from '../../services/agencyService';
import { userService } from '../../services/userService';

const SalesFilters = ({ filters, onFiltersChange }) => {
  const [customers, setCustomers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [customersData, agenciesData, usersData] = await Promise.all([
        customerService.getAllCustomers(),
        agencyService.getAllAgencies(),
        userService.getAllUsers()
      ]);
      
      // Map customers
      const mappedCustomers = customersData.map(customer => ({
        id: customer.Customer_ID || customer.id,
        name: customer.CustomerName || customer.name || `Customer ${customer.Customer_ID || customer.id}`
      }));
      
      // Map agencies
      const mappedAgencies = agenciesData.map(agency => ({
        id: agency.Agency_ID || agency.id,
        name: agency.AgencyName || agency.agencyname || agency.name || `Agency ${agency.Agency_ID || agency.id}`
      }));
      
      // Map users
      const mappedUsers = usersData.map(user => ({
        id: user.User_ID || user.id,
        name: user.UserName || user.name || `User ${user.User_ID || user.id}`
      }));

      setCustomers(mappedCustomers);
      setAgencies(mappedAgencies);
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    onFiltersChange({
      ...filters,
      [filterName]: value
    });
  };

  const handleDateChange = (dateType, value) => {
    onFiltersChange({
      ...filters,
      [dateType]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      customer: '',
      agency: '',
      user: '',
      paymentStatus: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const paymentStatusOptions = [
    { id: 'all', name: 'All Status' },
    { id: 'paid', name: 'Paid' },
    { id: 'pending', name: 'Pending' },
    { id: 'cancelled', name: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading filters...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Sales</h3>
        <button
          onClick={clearFilters}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Customer Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={filters.customer}
            onChange={(e) => handleFilterChange('customer', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Agency Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency
          </label>
          <select
            value={filters.agency}
            onChange={(e) => handleFilterChange('agency', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Agencies</option>
            {agencies.map(agency => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User
          </label>
          <select
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {paymentStatusOptions.map(status => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SalesFilters;