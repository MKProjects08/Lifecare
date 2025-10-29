// src/components/billing/InvoiceHeader.jsx
import React, { useEffect } from 'react';

const InvoiceHeader = ({ 
  invoiceData, 
  customers, 
  agencies, 
  onInvoiceDataChange
}) => {
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to get customer display name
  const getCustomerDisplayName = (customer) => {
    return customer.pharmacyname || customer.customername || customer.name || 'Unknown Customer';
  };

  // Helper function to get customer ID
  const getCustomerId = (customer) => {
    return customer.CustomerID || customer.customer_id || customer.id;
  };

  // Helper function to get agency display name
  const getAgencyDisplayName = (agency) => {
    return agency.agencyname || agency.name || 'Unknown Agency';
  };

  // Helper function to get agency ID
  const getAgencyId = (agency) => {
    return agency.Agency_ID || agency.id;
  };

  // Get current user from localStorage
  const getCurrentUser = () => {
    const username = localStorage.getItem("username");
    const adminId = localStorage.getItem("adminId");
    const role = localStorage.getItem("role");
    
    if (username && adminId) {
      return {
        username,
        id: parseInt(adminId),
        role
      };
    }
    return null;
  };

  // Auto-set salesperson when component mounts
  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
      // Set the salesperson data to the current user
      onInvoiceDataChange('salesperson_id', currentUser.id);
      onInvoiceDataChange('salesperson_name', currentUser.username);
    }
  }, [onInvoiceDataChange]);

  const currentUser = getCurrentUser();

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer (Pharmacy) *
          </label>
          <select
            value={invoiceData.customer_id || ''}
            onChange={(e) => onInvoiceDataChange('customer_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select customer</option>
            {customers.map(customer => (
              <option key={getCustomerId(customer)} value={getCustomerId(customer)}>
                {getCustomerDisplayName(customer)}
              </option>
            ))}
          </select>
          {customers.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No customers available</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salesperson *
          </label>
          <input
            type="text"
            value={currentUser?.username || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            readOnly
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency *
          </label>
          <select
            value={invoiceData.agency_id || ''}
            onChange={(e) => onInvoiceDataChange('agency_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select agency</option>
            {agencies.map(agency => (
              <option key={getAgencyId(agency)} value={getAgencyId(agency)}>
                {getAgencyDisplayName(agency)}
              </option>
            ))}
          </select>
          {agencies.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No agencies available</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={invoiceData.date || ''}
            onChange={(e) => onInvoiceDataChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formatDateForDisplay(invoiceData.date)}
          </div>
        </div>
      </div>

     
      
    </div>
  );
};

export default InvoiceHeader;