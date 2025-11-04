// src/components/product/ProductFilters.jsx
import React, { useState, useEffect } from "react";
import { agencyService } from "../../services/agencyService";

const ProductFilters = ({ onFilterChange }) => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgencies();
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

  const handleAgencyChange = (e) => {
    const agency = e.target.value === "All Agencies" ? "" : e.target.value;
    onFilterChange({ agency, productName: "" });
  };

  const handleProductNameChange = (e) => {
    onFilterChange({ agency: "", productName: e.target.value });
  };

  // Extract agency name from the API response structure
  const getAgencyName = (agency) => {
    return agency.agencyname || agency.name || agency.agencyName || agency.title || 'Unknown Agency';
  };

  const getAgencyValue = (agency) => {
    return getAgencyName(agency);
  };

  const handleRetry = () => {
    fetchAgencies();
  };

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Agency
          </label>
          <select
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
          >
            <option>Loading agencies...</option>
          </select>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Agency
          </label>
          <div className="space-y-2">
            <select
              disabled
              className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-900"
            >
              <option>Failed to load agencies</option>
            </select>
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
          <label htmlFor="product-filter" className="block text-sm font-medium text-gray-700 mb-1">
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
      <div className="flex-1">
        <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Agency {agencies.length > 0 && `(${agencies.length} available)`}
        </label>
        <select
          id="agency-filter"
          onChange={handleAgencyChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All Agencies">All Agencies</option>
          {agencies.map((agency) => (
            <option key={agency.Agency_ID} value={getAgencyValue(agency)}>
              {getAgencyName(agency)}
            </option>
          ))}
        </select>
        {agencies.length === 0 && !loading && (
          <p className="text-sm text-yellow-600 mt-1">No agencies found</p>
        )}
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
        />
      </div>
    </div>
  );
};

export default ProductFilters;