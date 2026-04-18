import React from "react";

const ProductReportFilters = ({ filters, agencies, onChange, onApply, onReset }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#3F75B0]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agency</label>
          <select
            value={filters.agencyId}
            onChange={(e) => onChange({ ...filters, agencyId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#3F75B0]"
          >
            <option value="">All Agencies</option>
            {agencies && agencies.map((agency) => (
              <option key={agency.Agency_ID || agency.id} value={agency.Agency_ID || agency.id}>
                {agency.agencyname}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onApply}
          className="bg-[#3F75B0] text-white rounded-lg px-4 py-2 hover:bg-[#2f5a89] transition-colors"
        >
          Apply Filter
        </button>

        <button
          type="button"
          onClick={onReset}
          className="bg-white border border-[#3F75B0] text-[#3F75B0] rounded-lg px-4 py-2 hover:bg-[#E1F2F5] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default ProductReportFilters;
