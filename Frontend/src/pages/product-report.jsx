import React, { useEffect, useState } from "react";
import ProductReportFilters from "../components/product-report/ProductReportFilters";
import ProductReportTable from "../components/product-report/ProductReportTable";
import { productReportService } from "../services/productReportService";
import { agencyService } from "../services/agencyService";

const ProductReport = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    agencyId: "",
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportRule, setReportRule] = useState("");
  const [agencies, setAgencies] = useState([]);

  const loadAgencies = async () => {
    try {
      const data = await agencyService.getActiveAgencies();
      setAgencies(data || []);
    } catch (error) {
      console.error("Failed to load agencies:", error);
    }
  };

  const loadReport = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await productReportService.getProductSalesReport(nextFilters);
      setRows(Array.isArray(response?.data) ? response.data : []);
      setReportRule(response?.filters?.rule || "");
    } catch (error) {
      console.error("Failed to load product report:", error);
      alert(`Failed to load product report: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
    loadReport();
  }, []);

  const onApply = () => {
    loadReport(filters);
  };

  const onReset = () => {
    const resetFilters = { startDate: "", endDate: "", agencyId: "" };
    setFilters(resetFilters);
    loadReport(resetFilters);
  };

  const handlePrint = async () => {
    try {
      const html = await productReportService.getProductSalesReportPrintHtml(filters);
      document.open();
      document.write(html);
      document.close();
    } catch (e) {
      console.error('Failed to open printable product report:', e);
      alert('Failed to open product report for printing: ' + (e.message || 'Unknown error'));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await productReportService.downloadProductSalesReportExcel(filters);
    } catch (e) {
      console.error('Failed to download product report Excel:', e);
      alert('Failed to download product report Excel: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#3F75B0] mb-2">Product Sales Report</h2>
            {reportRule ? <p className="text-gray-500 text-sm">{reportRule}</p> : null}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-[#048dcc] text-[#048dcc] rounded-lg shadow-sm hover:bg-[#E1F2F5] focus:outline-none transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4a2 2 0 012-2h8a2 2 0 012 2v5M6 18H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2h-1M10 18h4" />
              </svg>
              Print Report
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-white border border-[#29996B] text-[#29996B] rounded-lg shadow-sm hover:bg-[#E1F2F5] focus:outline-none transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#3F75B0] rounded-xl shadow-sm p-6 mb-6">
          <ProductReportFilters
            filters={filters}
            agencies={agencies}
            onChange={setFilters}
            onApply={onApply}
            onReset={onReset}
          />
        </div>

        <div className="shadow-sm rounded-xl">
          <ProductReportTable rows={rows} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ProductReport;
