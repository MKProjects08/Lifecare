// src/services/analyticsService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

export interface DaySales { date: string; total: number; }
export interface Kpis {
  todaySales: number;
  monthSales: number;
  totalCredits: number;
  pendingPayments: number;
  ordersToday: number;
  activeProducts: number;
}

export interface RecentOrder {
  Order_ID: number;
  FormattedOrderID: string;
  CustomerName: string;
  gross_total: number;
  paymentstatus: string;
  created_at: string;
}

export interface TopCreditRow {
  Customer_ID: number;
  pharmacyname: string;
  credits: number;
}

const ensureAuth = () => {
  const token = getAuthToken();
  if (!token) throw new Error('No authentication token found. Please log in.');
};

export const analyticsService = {
  getSalesLast10Days: async (): Promise<DaySales[]> => {
    ensureAuth();
    const res = await fetch(`${API_BASE_URL}/analytics/sales-last-10-days`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getKpis: async (): Promise<Kpis> => {
    ensureAuth();
    const res = await fetch(`${API_BASE_URL}/analytics/kpis`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getRecentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    ensureAuth();
    const res = await fetch(`${API_BASE_URL}/analytics/recent-orders?limit=${limit}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getTopCredits: async (limit = 5): Promise<TopCreditRow[]> => {
    ensureAuth();
    const res = await fetch(`${API_BASE_URL}/analytics/top-credits?limit=${limit}`, { headers: getHeaders() });
    return handleResponse(res);
  }
};
