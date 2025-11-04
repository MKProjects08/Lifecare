import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

export interface ExpiryAlert {
  Product_ID: number;
  BatchNumber: string;
  productname: string;
  generic_name: string;
  expiry_date: string;
  daysUntilExpiry: number;
  quantity: number;
  AgencyName?: string;
}

export interface StockAlert {
  Product_ID: number;
  BatchNumber: string;
  productname: string;
  generic_name: string;
  quantity: number;
  selling_price: number;
  AgencyName?: string;
}

export interface AlertSummary {
  expiryAlertsCount: number;
  stockAlertsCount: number;
  totalAlerts: number;
}

export const alertService = {
  // ✅ Get expiry alerts (products expiring within 60 days)
  getExpiryAlerts: async (): Promise<ExpiryAlert[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const products = await handleResponse(response);
      
      if (!Array.isArray(products)) {
        return [];
      }

      const today = new Date();
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(today.getDate() + 60);

      const expiryAlerts: ExpiryAlert[] = [];

      products.forEach(product => {
        if (!product.expiry_date) return;

        const expiryDate = new Date(product.expiry_date);
        
        // Check if expiry date is within next 60 days and not expired
        if (expiryDate >= today && expiryDate <= sixtyDaysFromNow) {
          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

          expiryAlerts.push({
            Product_ID: product.Product_ID || product.id,
            BatchNumber: product.BatchNumber,
            productname: product.productname,
            generic_name: product.generic_name,
            expiry_date: product.expiry_date,
            daysUntilExpiry,
            quantity: product.quantity || 0,
            AgencyName: product.AgencyName
          });
        }
      });

      // Sort by days until expiry (closest first)
      return expiryAlerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    } catch (error) {
      console.error('Error in alertService.getExpiryAlerts:', error);
      throw error;
    }
  },

  // ✅ Get stock alerts (products with quantity less than 100)
  getStockAlerts: async (): Promise<StockAlert[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const products = await handleResponse(response);
      
      if (!Array.isArray(products)) {
        return [];
      }

      const stockAlerts: StockAlert[] = products
        .filter(product => {
          const quantity = product.quantity || 0;
          return quantity < 100;
        })
        .map(product => ({
          Product_ID: product.Product_ID || product.id,
          BatchNumber: product.BatchNumber,
          productname: product.productname,
          generic_name: product.generic_name,
          quantity: product.quantity || 0,
          selling_price: product.selling_price || 0,
          AgencyName: product.AgencyName
        }))
        .sort((a, b) => a.quantity - b.quantity); // Sort by lowest quantity first

      return stockAlerts;
    } catch (error) {
      console.error('Error in alertService.getStockAlerts:', error);
      throw error;
    }
  },

  // ✅ Get all alerts summary
  getAllAlerts: async (): Promise<{
    expiryAlerts: ExpiryAlert[];
    stockAlerts: StockAlert[];
    summary: AlertSummary;
  }> => {
    try {
      const [expiryAlerts, stockAlerts] = await Promise.all([
        alertService.getExpiryAlerts(),
        alertService.getStockAlerts()
      ]);

      const summary: AlertSummary = {
        expiryAlertsCount: expiryAlerts.length,
        stockAlertsCount: stockAlerts.length,
        totalAlerts: expiryAlerts.length + stockAlerts.length
      };

      return {
        expiryAlerts,
        stockAlerts,
        summary
      };
    } catch (error) {
      console.error('Error in alertService.getAllAlerts:', error);
      throw error;
    }
  },

  // ✅ Get critical alerts (expiring in 30 days or stock less than 50)
  getCriticalAlerts: async (): Promise<{
    criticalExpiry: ExpiryAlert[];
    criticalStock: StockAlert[];
  }> => {
    try {
      const [expiryAlerts, stockAlerts] = await Promise.all([
        alertService.getExpiryAlerts(),
        alertService.getStockAlerts()
      ]);

      const criticalExpiry = expiryAlerts.filter(alert => alert.daysUntilExpiry <= 30);
      const criticalStock = stockAlerts.filter(alert => alert.quantity < 50);

      return {
        criticalExpiry,
        criticalStock
      };
    } catch (error) {
      console.error('Error in alertService.getCriticalAlerts:', error);
      throw error;
    }
  }
};