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
  const [filters, setFilters] = useState({
    agency: "",
    productName: "",
    startDate: "",   // From – expiry >= startDate
    endDate: ""      // To   – expiry <= endDate
  });

  const dropdownRef = useRef(null);

  /* --------------------------------------------------------------
     Load agencies
  -------------------------------------------------------------- */
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
      const data = await agencyService.getAllAgencies();
      setAgencies(data);
    } catch (err) {
      console.error("Error fetching agencies:", err);
      setError(err.message || "Failed to load agencies");
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------
     Handlers
  -------------------------------------------------------------- */
  const emitFilters = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAgencySelect = (agencyName) => {
    const agencyValue = agencyName === "All Agencies" ? "" : agencyName;
    const newFilters = { ...filters, agency: agencyValue };
    emitFilters(newFilters);
    setSelectedAgency(agencyName);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleProductNameChange = (e) => {
    const newFilters = { ...filters, productName: e.target.value };
    emitFilters(newFilters);
  };

  const handleDateChange = (type, value) => {
    const newFilters = { ...filters };

    if (type === "startDate") {
      newFilters.startDate = value;

      // If endDate becomes invalid → clear it
      if (newFilters.endDate && value && newFilters.endDate <= value) {
        newFilters.endDate = "";
      }
    } else if (type === "endDate") {
      // Block if endDate <= startDate
      if (filters.startDate && value && value <= filters.startDate) {
        return;
      }
      newFilters.endDate = value;
    }

    emitFilters(newFilters);
  };

  const clearAllFilters = () => {
    const cleared = {
      agency: "",
      productName: "",
      startDate: "",
      endDate: ""
    };
    setFilters(cleared);
    setSelectedAgency("All Agencies");
    setSearchTerm("");
    onFilterChange(cleared);
  };

  const getAgencyName = (agency) =>
    agency.agencyname ||
    agency.name ||
    agency.agencyName ||
    agency.title ||
    "Unknown Agency";

  const filteredAgencies = agencies.filter((a) =>
    getAgencyName(a).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => setSearchTerm("");

  /* --------------------------------------------------------------
     Helper: min for endDate = startDate + 1 day
  -------------------------------------------------------------- */
  const getMinEndDate = () => {
    if (!filters.startDate) return "";
    const next = new Date(filters.startDate);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split("T")[0];
  };

  /* --------------------------------------------------------------
     Render – Loading
  -------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="bg-white border border-[#3F75B0] rounded-lg shadow p-6 mb-6">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading filters...</span>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
     Render – Error
  -------------------------------------------------------------- */
  if (error) {
    return (
      <div className="bg-white border border-[#3F75B0] rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filter Products</h3>
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 border border-red-300 rounded bg-red-50 text-red-900">
            Failed to load agencies
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchAgencies}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>

          {/* Keep other filters usable even when agencies fail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                From Date (Purchase / Updated)
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3F75B0] mb-1">
                To Date (Purchase / Updated)
              </label>
              <input
                type="date"
                value={filters.endDate}
                min={getMinEndDate()}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
                // NOT disabled – can be used alone
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3F75B0] mb-1">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Search product name..."
              value={filters.productName}
              onChange={handleProductNameChange}
              className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
            />
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
     Render – Normal
  -------------------------------------------------------------- */
  return (
    <div className="">
      {/* Header + Clear All */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter Products</h3>
        <button
          onClick={clearAllFilters}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* ==== Agency ==== */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Agency {agencies.length > 0 && `(${agencies.length})`}
          </label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0] bg-white text-left flex items-center justify-between"
          >
            <span className="truncate text-sm">{selectedAgency}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[#E1F2F5] rounded-md shadow-lg max-h-80 flex flex-col">
              {/* Search */}
              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="overflow-y-auto max-h-60">
                <button
                  type="button"
                  onClick={() => handleAgencySelect("All Agencies")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                    selectedAgency === "All Agencies"
                      ? "bg-[#E1F2F5] text-[#3F75B0] font-medium"
                      : ""
                  }`}
                >
                  All Agencies
                </button>

                {filteredAgencies.length > 0 ? (
                  filteredAgencies.map((agency) => {
                    const name = getAgencyName(agency);
                    return (
                      <button
                        key={agency.Agency_ID || agency.id}
                        type="button"
                        onClick={() => handleAgencySelect(name)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[#E1F2F5] transition-colors ${
                          selectedAgency === name
                            ? "bg-[#E1F2F5] text-[#3F75B0] font-medium"
                            : ""
                        }`}
                      >
                        {name}
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

        {/* ==== Product Name ==== */}
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Search product name..."
            value={filters.productName}
            onChange={handleProductNameChange}
            className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>

        {/* ==== From Date (Purchase / Updated) ==== */}
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            From Date (Purchase / Updated)
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>

        {/* ==== To Date (Purchase / Updated) ==== */}
        <div>
          <label className="block text-sm font-medium text-[#3F75B0] mb-1">
            To Date (Purchase / Updated)
          </label>
          <input
            type="date"
            value={filters.endDate}
            min={getMinEndDate()}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
            className="w-full px-3 py-2 border border-[#048dcc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F75B0]"
            // NOT disabled – can be used without startDate
          />
        </div>
      </div>

      {agencies.length === 0 && !loading && (
        <p className="text-sm text-yellow-600">No agencies available.</p>
      )}
    </div>
  );
};

export default ProductFilters;