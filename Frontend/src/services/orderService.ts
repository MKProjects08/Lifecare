// src/services/orderService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

// Order interface matching your database schema
export interface Order {
  Order_ID?: number;
  id?: number;
  FormattedOrderID?: string;
  Customer_ID: number;
  Agency_ID: number;
  User_ID: number;
  paid_date: string | null;
  paymentstatus: string;
  print_count: number;
  gross_total: number;
  net_total: number;
  discount_amount: number;
  created_at?: string;
  CustomerName?: string;
  AgencyName?: string;
  UserName?: string;
}

export interface OrderWithDetails extends Order {
  FormattedOrderID: string;
  CustomerName: string;
  AgencyName: string;
  UserName: string;
}

export const orderService = {
  // ✅ Get all orders (user-friendly with details)
  getAllOrders: async (): Promise<OrderWithDetails[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await handleResponse(response);
      
      if (Array.isArray(data)) {
        return data;
      } else {
        console.warn('Unexpected API response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error in orderService.getAllOrders:', error);
      throw error;
    }
  },

  // ✅ Get order by ID
  getOrderById: async (id: string | number): Promise<Order> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderService.getOrderById:', error);
      throw error;
    }
  },

  // ✅ Create new order
  createOrder: async (orderData: {
    Customer_ID: number;
    Agency_ID: number;
    User_ID: number;
    paid_date: string | null;
    paymentstatus: string;
    print_count: number;
    gross_total: number;
    net_total: number;
    discount_amount: number;
  }): Promise<{ message: string; orderId: number }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderService.createOrder:', error);
      throw error;
    }
  },

  // ✅ Update order
  updateOrder: async (id: string | number, orderData: {
    Customer_ID: number;
    Agency_ID: number;
    User_ID: number;
    paid_date: string | null;
    paymentstatus: string;
    print_count: number;
    gross_total: number;
    net_total: number;
    discount_amount: number;
  }): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderService.updateOrder:', error);
      throw error;
    }
  },

  // ✅ Delete order
  deleteOrder: async (id: string | number): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderService.deleteOrder:', error);
      throw error;
    }
  },

  // Utility method to get orders by customer
  getOrdersByCustomer: async (customerId: string | number): Promise<OrderWithDetails[]> => {
    try {
      const allOrders = await orderService.getAllOrders();
      return allOrders.filter(order => order.Customer_ID === Number(customerId));
    } catch (error) {
      console.error('Error in orderService.getOrdersByCustomer:', error);
      throw error;
    }
  },

  // Utility method to get orders by agency
  getOrdersByAgency: async (agencyId: string | number): Promise<OrderWithDetails[]> => {
    try {
      const allOrders = await orderService.getAllOrders();
      return allOrders.filter(order => order.Agency_ID === Number(agencyId));
    } catch (error) {
      console.error('Error in orderService.getOrdersByAgency:', error);
      throw error;
    }
  },

  // Utility method to get orders by payment status
  getOrdersByPaymentStatus: async (paymentStatus: string): Promise<OrderWithDetails[]> => {
    try {
      const allOrders = await orderService.getAllOrders();
      return allOrders.filter(order => 
        order.paymentstatus.toLowerCase() === paymentStatus.toLowerCase()
      );
    } catch (error) {
      console.error('Error in orderService.getOrdersByPaymentStatus:', error);
      throw error;
    }
  },

  // Utility method to get orders by date range
  getOrdersByDateRange: async (startDate: string, endDate: string): Promise<OrderWithDetails[]> => {
    try {
      const allOrders = await orderService.getAllOrders();
      return allOrders.filter(order => {
        const orderDate = order.paid_date || order.created_at;
        if (!orderDate) return false;
        
        const date = new Date(orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return date >= start && date <= end;
      });
    } catch (error) {
      console.error('Error in orderService.getOrdersByDateRange:', error);
      throw error;
    }
  },

  // Utility method to update order payment status
  updateOrderPaymentStatus: async (id: string | number, paymentStatus: string): Promise<{ message: string }> => {
    try {
      const order = await orderService.getOrderById(id);
      
      return await orderService.updateOrder(id, {
        Customer_ID: order.Customer_ID,
        Agency_ID: order.Agency_ID,
        User_ID: order.User_ID,
        paid_date: order.paid_date,
        paymentstatus: paymentStatus,
        print_count: order.print_count,
        gross_total: order.gross_total,
        net_total: order.net_total,
        discount_amount: order.discount_amount
      });
    } catch (error) {
      console.error('Error in orderService.updateOrderPaymentStatus:', error);
      throw error;
    }
  },

  // Utility method to increment print count
  incrementPrintCount: async (id: string | number): Promise<{ message: string }> => {
    try {
      const order = await orderService.getOrderById(id);
      
      return await orderService.updateOrder(id, {
        Customer_ID: order.Customer_ID,
        Agency_ID: order.Agency_ID,
        User_ID: order.User_ID,
        paid_date: order.paid_date,
        paymentstatus: order.paymentstatus,
        print_count: (order.print_count || 0) + 1,
        gross_total: order.gross_total,
        net_total: order.net_total,
        discount_amount: order.discount_amount
      });
    } catch (error) {
      console.error('Error in orderService.incrementPrintCount:', error);
      throw error;
    }
  },

  // Utility method to get recent orders
  getRecentOrders: async (limit: number = 10): Promise<OrderWithDetails[]> => {
    try {
      const allOrders = await orderService.getAllOrders();
      return allOrders
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error in orderService.getRecentOrders:', error);
      throw error;
    }
  }
};

// Export the Order types for use in components
//export type { Order, OrderWithDetails };