// src/services/orderItemService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

// Order Item interface matching your database schema
export interface OrderItem {
  id?: number;
  Order_ID: number;
  Product_ID: number;
  BatchNumber: string;
  quantity: number;
  free_issue_quantity: number;
}

export interface OrderItemWithDetails extends OrderItem {
  productname?: string;
  generic_name?: string;
  selling_price?: number;
  purchase_price?: number;
}

export const orderItemService = {
  // ✅ Get all order items
  getAllOrderItems: async (): Promise<OrderItem[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items`, {
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
      console.error('Error in orderItemService.getAllOrderItems:', error);
      throw error;
    }
  },

  // ✅ Get order item by ID
  getOrderItemById: async (id: string | number): Promise<OrderItem> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderItemService.getOrderItemById:', error);
      throw error;
    }
  },

  // ✅ Get all items for a specific order
  getItemsByOrderId: async (orderId: string | number): Promise<OrderItem[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items/order/${orderId}`, {
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
      console.error('Error in orderItemService.getItemsByOrderId:', error);
      throw error;
    }
  },

  // ✅ Create new order item
  createOrderItem: async (orderItemData: {
    Order_ID: number;
    Product_ID: number;
    BatchNumber: string;
    quantity: number;
    free_issue_quantity: number;
  }): Promise<{ message: string; orderItemId: number }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderItemData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderItemService.createOrderItem:', error);
      throw error;
    }
  },

  // ✅ Update order item
  updateOrderItem: async (id: string | number, orderItemData: {
    Order_ID: number;
    Product_ID: number;
    BatchNumber: string;
    quantity: number;
    free_issue_quantity: number;
  }): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(orderItemData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderItemService.updateOrderItem:', error);
      throw error;
    }
  },

  // ✅ Delete order item
  deleteOrderItem: async (id: string | number): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/order-items/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in orderItemService.deleteOrderItem:', error);
      throw error;
    }
  },

  // Utility method to create multiple order items at once
  createMultipleOrderItems: async (orderItems: {
    Order_ID: number;
    Product_ID: number;
    BatchNumber: string;
    quantity: number;
    free_issue_quantity: number;
  }[]): Promise<{ message: string; createdCount: number }> => {
    try {
      const promises = orderItems.map(item => orderItemService.createOrderItem(item));
      const results = await Promise.all(promises);
      
      return {
        message: `${results.length} order items created successfully`,
        createdCount: results.length
      };
    } catch (error) {
      console.error('Error in orderItemService.createMultipleOrderItems:', error);
      throw error;
    }
  },

  // Utility method to update order item quantity
  updateOrderItemQuantity: async (id: string | number, quantity: number, free_issue_quantity: number = 0): Promise<{ message: string }> => {
    try {
      const orderItem = await orderItemService.getOrderItemById(id);
      
      return await orderItemService.updateOrderItem(id, {
        Order_ID: orderItem.Order_ID,
        Product_ID: orderItem.Product_ID,
        BatchNumber: orderItem.BatchNumber,
        quantity: quantity,
        free_issue_quantity: free_issue_quantity
      });
    } catch (error) {
      console.error('Error in orderItemService.updateOrderItemQuantity:', error);
      throw error;
    }
  },

  // Utility method to get order items with product details
  getOrderItemsWithDetails: async (orderId: string | number): Promise<OrderItemWithDetails[]> => {
    try {
      // This would require a more complex backend endpoint that joins with products table
      // For now, we'll return basic order items and you can enhance this later
      const orderItems = await orderItemService.getItemsByOrderId(orderId);
      return orderItems as OrderItemWithDetails[];
    } catch (error) {
      console.error('Error in orderItemService.getOrderItemsWithDetails:', error);
      throw error;
    }
  },

  // Utility method to calculate total quantity for an order
  getTotalQuantityByOrder: async (orderId: string | number): Promise<{ totalQuantity: number; totalFreeQuantity: number }> => {
    try {
      const orderItems = await orderItemService.getItemsByOrderId(orderId);
      
      const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalFreeQuantity = orderItems.reduce((sum, item) => sum + item.free_issue_quantity, 0);
      
      return {
        totalQuantity,
        totalFreeQuantity
      };
    } catch (error) {
      console.error('Error in orderItemService.getTotalQuantityByOrder:', error);
      throw error;
    }
  },

  // Utility method to delete all items for an order
  deleteAllItemsByOrder: async (orderId: string | number): Promise<{ message: string; deletedCount: number }> => {
    try {
      const orderItems = await orderItemService.getItemsByOrderId(orderId);
      const deletePromises = orderItems.map(item => orderItemService.deleteOrderItem(item.id!));
      const results = await Promise.all(deletePromises);
      
      return {
        message: `${results.length} order items deleted successfully`,
        deletedCount: results.length
      };
    } catch (error) {
      console.error('Error in orderItemService.deleteAllItemsByOrder:', error);
      throw error;
    }
  },

  // Utility method to check if product batch exists in order items
  isProductBatchInOrder: async (productId: number, batchNumber: string): Promise<boolean> => {
    try {
      const allOrderItems = await orderItemService.getAllOrderItems();
      return allOrderItems.some(item => 
        item.Product_ID === productId && item.BatchNumber === batchNumber
      );
    } catch (error) {
      console.error('Error in orderItemService.isProductBatchInOrder:', error);
      throw error;
    }
  }
};

// Export the OrderItem types for use in components
//export type { OrderItem, OrderItemWithDetails };