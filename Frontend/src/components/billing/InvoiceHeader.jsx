// src/components/billing/InvoiceHeader.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

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

  // Dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isAgencyDropdownOpen, setIsAgencyDropdownOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  
  const customerDropdownRef = useRef(null);
  const agencyDropdownRef = useRef(null);

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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
      if (agencyDropdownRef.current && !agencyDropdownRef.current.contains(event.target)) {
        setIsAgencyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentUser = getCurrentUser();

  const handleCustomerChange = (value) => {
    onInvoiceDataChange('customer_id', value);
    setIsCustomerDropdownOpen(false);
    setCustomerSearchTerm('');
  };

  const handleAgencyChange = (value) => {
    onInvoiceDataChange('agency_id', value);
    setIsAgencyDropdownOpen(false);
    setAgencySearchTerm('');
  };

  const handleDateChange = (value) => {
    onInvoiceDataChange('date', value);
  };

  // Get selected customer display name
  const getSelectedCustomerName = () => {
    if (!safeInvoiceData.customer_id) return 'Select customer (Optional)';
    const customer = customers.find(c => getCustomerId(c) === safeInvoiceData.customer_id);
    return customer ? getCustomerDisplayName(customer) : 'Select customer (Optional)';
  };

  // Get selected agency display name
  const getSelectedAgencyName = () => {
    if (!safeInvoiceData.agency_id) return 'Select agency *';
    const agency = agencies.find(a => getAgencyId(a) === safeInvoiceData.agency_id);
    return agency ? getAgencyDisplayName(agency) : 'Select agency *';
  };

  // Filter customers based on search
  const filteredCustomers = Array.isArray(customers) 
    ? customers.filter(customer => 
        getCustomerDisplayName(customer).toLowerCase().includes(customerSearchTerm.toLowerCase())
      )
    : [];

  // Filter agencies based on search
  const filteredAgencies = Array.isArray(agencies)
    ? agencies.filter(agency =>
        getAgencyDisplayName(agency).toLowerCase().includes(agencySearchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[#3F75B0] mb-4">Invoice Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Customer Field - Optional - Searchable */}
        <div className="relative" ref={customerDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Customer (Pharmacy) 
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          
          <button
            type="button"
            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
            className="w-full px-3 py-2 border border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]  focus:border-[#3F75B0] bg-[#E1F2F5] text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{getSelectedCustomerName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCustomerDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {customerSearchTerm && (
                    <button
                      onClick={() => setCustomerSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto max-h-60">
                               
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const customerId = getCustomerId(customer);
                    const customerName = getCustomerDisplayName(customer);
                    return (
                      <button
                        key={customerId}
                        type="button"
                        onClick={() => handleCustomerChange(customerId)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5]  transition-colors ${
                          safeInvoiceData.customer_id === customerId ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                        }`}
                      >
                        {customerName}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No customers found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Salesperson Field */}
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Salesperson <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col">
            <input
              type="text"
              value={currentUser?.username || 'Not logged in'}
              className="w-full px-3 py-2 border border-[#048dcc] rounded-md bg-[#E1F2F5] cursor-not-allowed"
              readOnly
              disabled
            />
            <input type="hidden" value={currentUser?.id || ''} />
          </div>
        </div>

        {/* Agency Field - Required - Searchable */}
        <div className="relative" ref={agencyDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Agency <span className="text-red-500">*</span>
          </label>
          
          <button
            type="button"
            onClick={() => setIsAgencyDropdownOpen(!isAgencyDropdownOpen)}
            className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none bg-[#E1F2F5] text-left flex items-center focus:ring-2 focus:ring-[#3F75B0]  focus:border-[#3F75B0] justify-between"
          >
            <span className="truncate text-sm">{getSelectedAgencyName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isAgencyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAgencyDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agencies..."
                    value={agencySearchTerm}
                    onChange={(e) => setAgencySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0] "
                    onClick={(e) => e.stopPropagation()}
                  />
                  {agencySearchTerm && (
                    <button
                      onClick={() => setAgencySearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="overflow-y-auto max-h-60">
                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map((agency) => {
                    const agencyId = getAgencyId(agency);
                    const agencyName = getAgencyDisplayName(agency);
                    return (
                      <button
                        key={agencyId}
                        type="button"
                        onClick={() => handleAgencyChange(agencyId)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                          safeInvoiceData.agency_id === agencyId ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                        }`}
                      >
                        {agencyName}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No agencies found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1  border-[#048dcc]">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={safeInvoiceData.date || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#E1F2F5] border  border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
            required
          />
         
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;