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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#3F75B0]">Product Report</h2>
        {reportRule ? <p className="text-gray-600 mt-2">{reportRule}</p> : null}
      </div>

      <ProductReportFilters
        filters={filters}
        agencies={agencies}
        onChange={setFilters}
        onApply={onApply}
        onReset={onReset}
      />

      <ProductReportTable rows={rows} loading={loading} />
    </div>
  );
};

export default ProductReport;
