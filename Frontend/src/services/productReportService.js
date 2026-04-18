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
};
