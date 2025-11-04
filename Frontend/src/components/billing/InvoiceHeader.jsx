// src/components/billing/InvoiceHeader.jsx
import React, { useEffect } from 'react';

const InvoiceHeader = ({ 
  invoiceData = {},
  customers = [],
  agencies = [],
  onInvoiceDataChange
}) => {
  const safeInvoiceData = {
    customer_id: '',
    agency_id: '',
    salesperson_id: '',
    date: new Date().toISOString().split('T')[0],
    ...invoiceData
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getCustomerDisplayName = (customer) =>
    customer?.pharmacyname || customer?.customername || customer?.name || 'Unknown Customer';

  const getCustomerId = (customer) =>
    customer?.CustomerID || customer?.customer_id || customer?.id || customer?.Customer_ID || '';

  const getAgencyDisplayName = (agency) =>
    agency?.agencyname || agency?.name || 'Unknown Agency';

  const getAgencyId = (agency) => agency?.Agency_ID || agency?.id || '';

  const getCurrentUser = () => {
    try {
      const username = localStorage.getItem("username");
      const adminId = localStorage.getItem("adminId");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const userID = userId || adminId;

      if (username && userID) {
        return { username, id: parseInt(userID), role };
      }

      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          username: user.username || user.name,
          id: user.User_ID || user.id || user.userId,
          role: user.role
        };
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    return null;
  };

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (currentUser && currentUser.id) {
      onInvoiceDataChange('salesperson_id', currentUser.id.toString());
      onInvoiceDataChange('salesperson_name', currentUser.username);
    } else {
      onInvoiceDataChange('salesperson_id', '');
      onInvoiceDataChange('salesperson_name', '');
    }
  }, [onInvoiceDataChange]);

  const currentUser = getCurrentUser();

  const handleCustomerChange = (value) => {
    onInvoiceDataChange('customer_id', value);
  };

  const handleAgencyChange = (value) => {
    onInvoiceDataChange('agency_id', value);
  };

  const handleDateChange = (value) => {
    onInvoiceDataChange('date', value);
  };

  const renderCustomers = () => {
    if (!Array.isArray(customers)) {
      return <option value="">No customers available</option>;
    }

    return customers.map((customer) => (
      <option key={getCustomerId(customer)} value={getCustomerId(customer)}>
        {getCustomerDisplayName(customer)}
      </option>
    ));
  };

  const renderAgencies = () => {
    if (!Array.isArray(agencies)) {
      return <option value="">No agencies available</option>;
    }

    return agencies.map((agency) => (
      <option key={getAgencyId(agency)} value={getAgencyId(agency)}>
        {getAgencyDisplayName(agency)}
      </option>
    ));
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Customer Field - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer (Pharmacy) 
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <select
            value={safeInvoiceData.customer_id || ''}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select customer (Optional)</option>
            {renderCustomers()}
          </select>
        </div>

        {/* Salesperson Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salesperson <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col">
            <input
              type="text"
              value={currentUser?.username || 'Not logged in'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
              disabled
            />
            <input type="hidden" value={currentUser?.id || ''} />
          </div>
        </div>

        {/* Agency Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency <span className="text-red-500">*</span>
          </label>
          <select
            value={safeInvoiceData.agency_id || ''}
            onChange={(e) => handleAgencyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select agency *</option>
            {renderAgencies()}
          </select>
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={safeInvoiceData.date || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formatDateForDisplay(safeInvoiceData.date)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
