import React, { useState, useEffect, useRef } from 'react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { agencyService } from '../../services/agencyService';
import { userService } from '../../services/userService';
import { Search, ChevronDown, X } from 'lucide-react';

const SalesFilters = ({ filters, onFiltersChange }) => {
  const [customers, setCustomers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isAgencyDropdownOpen, setIsAgencyDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isPaymentStatusDropdownOpen, setIsPaymentStatusDropdownOpen] = useState(false);
  
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [agencySearchTerm, setAgencySearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [paymentStatusSearchTerm, setPaymentStatusSearchTerm] = useState('');

  const customerDropdownRef = useRef(null);
  const agencyDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const paymentStatusDropdownRef = useRef(null);

  useEffect(() => {
    loadFilterData();
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
      if (agencyDropdownRef.current && !agencyDropdownRef.current.contains(event.target)) {
        setIsAgencyDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (paymentStatusDropdownRef.current && !paymentStatusDropdownRef.current.contains(event.target)) {
        setIsPaymentStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        name: customer.pharmacyname || customer.name || `Customer ${customer.Customer_ID || customer.id}`
      }));
      
      // Map agencies
      const mappedAgencies = agenciesData.map(agency => ({
        id: agency.Agency_ID || agency.id,
        name: agency.AgencyName || agency.agencyname || agency.name || `Agency ${agency.Agency_ID || agency.id}`
      }));
      
      // Map users
      const mappedUsers = usersData.map(user => ({
        id: user.User_ID || user.id,
        name: user.username || user.name || `User ${user.User_ID || user.id}`
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

  const handleCustomerSelect = (value) => {
    handleFilterChange('customer', value);
    setIsCustomerDropdownOpen(false);
    setCustomerSearchTerm('');
  };

  const handleAgencySelect = (value) => {
    handleFilterChange('agency', value);
    setIsAgencyDropdownOpen(false);
    setAgencySearchTerm('');
  };

  const handleUserSelect = (value) => {
    handleFilterChange('user', value);
    setIsUserDropdownOpen(false);
    setUserSearchTerm('');
  };

  const handlePaymentStatusSelect = (value) => {
    handleFilterChange('paymentStatus', value);
    setIsPaymentStatusDropdownOpen(false);
    setPaymentStatusSearchTerm('');
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

  // Get display names
  const getSelectedCustomerName = () => {
    if (!filters.customer) return 'All Customers';
    const customer = customers.find(c => c.id.toString() === filters.customer.toString());
    return customer ? customer.name : 'All Customers';
  };

  const getSelectedAgencyName = () => {
    if (!filters.agency) return 'All Agencies';
    const agency = agencies.find(a => a.id.toString() === filters.agency.toString());
    return agency ? agency.name : 'All Agencies';
  };

  const getSelectedUserName = () => {
    if (!filters.user) return 'All Users';
    const user = users.find(u => u.id.toString() === filters.user.toString());
    return user ? user.name : 'All Users';
  };

  const getSelectedPaymentStatusName = () => {
    const status = paymentStatusOptions.find(s => s.id === filters.paymentStatus);
    return status ? status.name : 'All Status';
  };

  // Filter options based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(agencySearchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredPaymentStatuses = paymentStatusOptions.filter(status =>
    status.name.toLowerCase().includes(paymentStatusSearchTerm.toLowerCase())
  );

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
    <div className="bg-white border border-[#3F75B0] rounded-lg shadow p-6 mb-6">
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
        {/* Customer Filter - Searchable */}
        <div className="relative" ref={customerDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Customer
          </label>
          <button
            type="button"
            onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] focus:border-[#3F75B0] bg-white text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{getSelectedCustomerName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCustomerDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
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

              <div className="overflow-y-auto max-h-60">
                <button
                  type="button"
                  onClick={() => handleCustomerSelect('')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                    !filters.customer ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                  }`}
                >
                  All Customers
                </button>
                
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleCustomerSelect(customer.id.toString())}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                        filters.customer === customer.id.toString() ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                      }`}
                    >
                      {customer.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No customers found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Agency Filter - Searchable */}
        <div className="relative" ref={agencyDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Agency
          </label>
          <button
            type="button"
            onClick={() => setIsAgencyDropdownOpen(!isAgencyDropdownOpen)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{getSelectedAgencyName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isAgencyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAgencyDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agencies..."
                    value={agencySearchTerm}
                    onChange={(e) => setAgencySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
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

              <div className="overflow-y-auto max-h-60">
                <button
                  type="button"
                  onClick={() => handleAgencySelect('')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                    !filters.agency ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                  }`}
                >
                  All Agencies
                </button>
                
                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map((agency) => (
                    <button
                      key={agency.id}
                      type="button"
                      onClick={() => handleAgencySelect(agency.id.toString())}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                        filters.agency === agency.id.toString() ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                      }`}
                    >
                      {agency.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No agencies found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Filter - Searchable */}
        <div className="relative" ref={userDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            User
          </label>
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{getSelectedUserName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-60">
                <button
                  type="button"
                  onClick={() => handleUserSelect('')}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                    !filters.user ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                  }`}
                >
                  All Users
                </button>
                
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user.id.toString())}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                        filters.user === user.id.toString() ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                      }`}
                    >
                      {user.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Status Filter - Searchable */}
        <div className="relative" ref={paymentStatusDropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Payment Status
          </label>
          <button
            type="button"
            onClick={() => setIsPaymentStatusDropdownOpen(!isPaymentStatusDropdownOpen)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{getSelectedPaymentStatusName()}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isPaymentStatusDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPaymentStatusDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 flex flex-col">
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={paymentStatusSearchTerm}
                    onChange={(e) => setPaymentStatusSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {paymentStatusSearchTerm && (
                    <button
                      onClick={() => setPaymentStatusSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-60">
                {filteredPaymentStatuses.length > 0 ? (
                  filteredPaymentStatuses.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => handlePaymentStatusSelect(status.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                        filters.paymentStatus === status.id ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                      }`}
                    >
                      {status.name}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No status found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>
      </div>
    </div>
  );
};

export default SalesFilters;