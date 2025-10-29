// src/components/billing/InvoiceHeader.jsx
import React from 'react';

const InvoiceHeader = ({ invoiceData, customers, salespersons, agencies, onInvoiceDataChange }) => {
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer (Pharmacy) *
          </label>
          <select
            value={invoiceData.customer_id}
            onChange={(e) => onInvoiceDataChange('customer_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select customer</option>
            {customers.map(customer => (
              <option key={customer.customer_id || customer.id} value={customer.customer_id || customer.id}>
                {customer.customername || customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salesperson *
          </label>
          <select
            value={invoiceData.salesperson_id}
            onChange={(e) => onInvoiceDataChange('salesperson_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select salesperson</option>
            {salespersons.map(salesperson => (
              <option key={salesperson.salesperson_id || salesperson.id} value={salesperson.salesperson_id || salesperson.id}>
                {salesperson.salespersonname || salesperson.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency *
          </label>
          <select
            value={invoiceData.agency_id}
            onChange={(e) => onInvoiceDataChange('agency_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select agency</option>
            {agencies.map(agency => (
              <option key={agency.Agency_ID || agency.id} value={agency.Agency_ID || agency.id}>
                {agency.agencyname || agency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={invoiceData.date}
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