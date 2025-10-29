// src/components/billing/InvoiceHeader.jsx
import React from 'react';

const InvoiceHeader = ({ invoiceData, customers, salespersons, agencies, onInvoiceDataChange }) => {
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

  // Helper function to get salesperson display name
  const getSalespersonDisplayName = (salesperson) => {
    return salesperson.username || salesperson.salespersonname || salesperson.name || 'Unknown Salesperson';
  };

  // Helper function to get salesperson ID
  const getSalespersonId = (salesperson) => {
    return salesperson.UserID || salesperson.salesperson_id || salesperson.id;
  };

  // Helper function to get agency display name
  const getAgencyDisplayName = (agency) => {
    return agency.agencyname || agency.name || 'Unknown Agency';
  };

  // Helper function to get agency ID
  const getAgencyId = (agency) => {
    return agency.Agency_ID || agency.id;
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
          <select
            value={invoiceData.salesperson_id}
            onChange={(e) => onInvoiceDataChange('salesperson_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select salesperson</option>
            {salespersons.map(salesperson => (
              <option key={getSalespersonId(salesperson)} value={getSalespersonId(salesperson)}>
                {getSalespersonDisplayName(salesperson)}
              </option>
            ))}
          </select>
          {salespersons.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No salespersons available</p>
          )}
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

      {/* Customer Details Preview */}
      {invoiceData.customer_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Selected Customer Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {(() => {
              const selectedCustomer = customers.find(c => 
                getCustomerId(c) === parseInt(invoiceData.customer_id)
              );
              return selectedCustomer ? (
                <>
                  <div>
                    <span className="font-medium">Owner:</span> {selectedCustomer.owner_name}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedCustomer.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedCustomer.email}
                  </div>
                  <div>
                    <span className="font-medium">Credits:</span> ${selectedCustomer.credits || 0}
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Agency Details Preview */}
      {invoiceData.agency_id && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Selected Agency Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {(() => {
              const selectedAgency = agencies.find(a => 
                getAgencyId(a) === parseInt(invoiceData.agency_id)
              );
              return selectedAgency ? (
                <>
                  <div>
                    <span className="font-medium">Contact:</span> {selectedAgency.contact_person}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedAgency.phone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedAgency.email}
                  </div>
                  <div>
                    <span className="font-medium">Sales:</span> ${selectedAgency.sales || 0}
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceHeader;