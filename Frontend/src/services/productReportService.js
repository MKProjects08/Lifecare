import { API_BASE_URL, getHeaders, handleResponse } from "./productService";

export const productReportService = {
  getProductSalesReport: async ({ startDate = "", endDate = "", agencyId = "" } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (agencyId) params.append("agencyId", agencyId);

    const query = params.toString();
    const url = `${API_BASE_URL}/product-report${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    return handleResponse(response);
  },

  getProductSalesReportPrintHtml: async ({ startDate = "", endDate = "", agencyId = "" } = {}) => {
    try {
      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (agencyId) params.append("agencyId", agencyId);

      const query = params.toString();
      const url = `${API_BASE_URL}/product-report/print-html${query ? `?${query}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report HTML");
      }

      return await response.text();
    } catch (error) {
      console.error("Error in productReportService.getProductSalesReportPrintHtml:", error);
      throw error;
    }
  },

  downloadProductSalesReportExcel: async ({ startDate = "", endDate = "", agencyId = "" } = {}) => {
    try {
      const params = new URLSearchParams();

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (agencyId) params.append("agencyId", agencyId);

      const query = params.toString();
      const url = `${API_BASE_URL}/product-report/excel${query ? `?${query}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report Excel");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "product-sales-report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error in productReportService.downloadProductSalesReportExcel:", error);
      throw error;
    }
  },
};
