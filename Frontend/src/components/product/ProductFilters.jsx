// src/components/product/ProductFilters.jsx
import React, { useState, useEffect, useRef } from "react";
import { agencyService } from "../../services/agencyService";
import { Search, ChevronDown, X } from "lucide-react";

const ProductFilters = ({ onFilterChange }) => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("All Agencies");
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const agenciesData = await agencyService.getAllAgencies();
      setAgencies(agenciesData);
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError(err.message);
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgencySelect = (agency) => {
    const agencyValue = agency === "All Agencies" ? "" : agency;
    setSelectedAgency(agency);
    onFilterChange({ agency: agencyValue, productName: "" });
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleProductNameChange = (e) => {
    onFilterChange({ agency: "", productName: e.target.value });
  };

  const getAgencyName = (agency) => {
    return agency.agencyname || agency.name || agency.agencyName || agency.title || 'Unknown Agency';
  };

  const handleRetry = () => {
    fetchAgencies();
  };

  const filteredAgencies = agencies.filter((agency) =>
    getAgencyName(agency).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Agency
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
            Loading agencies...
          </div>
        </div>
        
        <div className="flex-1">
          <label htmlFor="product-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Product Name
          </label>
          <input
            type="text"
            id="product-filter"
            placeholder="Search product name..."
            onChange={handleProductNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Filter by Agency
          </label>
          <div className="space-y-2">
            <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-900">
              Failed to load agencies
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <label htmlFor="product-filter" className="block text-sm font-medium text-[#3F75B0] mb-1">
            Filter by Product Name
          </label>
          <input
            type="text"
            id="product-filter"
            placeholder="Search product name..."
            onChange={handleProductNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-[#3F75B0] mb-1">
          Filter by Agency {agencies.length > 0 && `(${agencies.length} available)`}
        </label>
        
        {/* Custom Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] focus:border-[#3F75B0] bg-white text-left flex items-center justify-between"
        >
          <span className="truncate">{selectedAgency}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[#E1F2F5] rounded-md shadow-lg max-h-80 flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-60">
              <button
                type="button"
                onClick={() => handleAgencySelect("All Agencies")}
                className={`w-full text-left px-4 py-2 hover:bg-[#E1F2F5] transition-colors ${
                  selectedAgency === "All Agencies" ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
                }`}
              >
                All Agencies
              </button>
              
              {filteredAgencies.length > 0 ? (
                filteredAgencies.map((agency) => {
                  const agencyName = getAgencyName(agency);
                  return (
                    <button
                      key={agency.Agency_ID}
                      type="button"
                      onClick={() => handleAgencySelect(agencyName)}
                      className={`w-full text-left px-4 py-2 hover:bg-[#E1F2F5] transition-colors ${
                        selectedAgency === agencyName ? 'bg-[#E1F2F5] text-[#3F75B0] font-medium' : ''
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

        {agencies.length === 0 && !loading && (
          <p className="text-sm text-yellow-600 mt-1">No agencies found</p>
        )}
      </div>
      
      <div className="flex-1">
        <label htmlFor="product-filter" className="block text-sm font-medium text-[#3F75B0] mb-1">
          Filter by Product Name
        </label>
        <input
          type="text"
          id="product-filter"
          placeholder="Search product name..."
          onChange={handleProductNameChange}
          className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] focus:border-[#3F75B0]"
        />
      </div>
    </div>
  );
};

export default ProductFilters;