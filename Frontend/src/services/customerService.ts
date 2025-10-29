// src/services/customerService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

// Customer interface matching your database schema
export interface Customer {
  CustomerID?: number;
  Customer_ID?: number;
  pharmacyname: string;
  owner_name: string;
  phone: string;
  address: string;
  email: string;
  credits: number;
  is_active?: boolean;
}

export const customerService = {
  // ✅ Get all customers
  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers`, {
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
      console.error('Error in customerService.getAllCustomers:', error);
      throw error;
    }
  },

  // ✅ Get customer by ID
  getCustomerById: async (id: string | number): Promise<Customer> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in customerService.getCustomerById:', error);
      throw error;
    }
  },

  // ✅ Create new customer
  createCustomer: async (customerData: {
    pharmacyname: string;
    owner_name: string;
    phone: string;
    address: string;
    email: string;
    credits: number;
  }): Promise<{ message: string; customerId: number }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(customerData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in customerService.createCustomer:', error);
      throw error;
    }
  },

  // ✅ Update customer
  updateCustomer: async (id: string | number, customerData: {
    pharmacyname: string;
    owner_name: string;
    phone: string;
    address: string;
    email: string;
    credits: number;
  }): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(customerData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in customerService.updateCustomer:', error);
      throw error;
    }
  },

  // ✅ Soft delete customer
  deleteCustomer: async (id: string | number): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in customerService.deleteCustomer:', error);
      throw error;
    }
  },

  // Utility method to get active customers only
  getActiveCustomers: async (): Promise<Customer[]> => {
    try {
      const allCustomers = await customerService.getAllCustomers();
      return allCustomers.filter(customer => customer.is_active !== false);
    } catch (error) {
      console.error('Error in customerService.getActiveCustomers:', error);
      throw error;
    }
  },

  // Utility method to search customers by name, owner, or email
  searchCustomers: async (searchTerm: string): Promise<Customer[]> => {
    try {
      const allCustomers = await customerService.getAllCustomers();
      return allCustomers.filter(customer => 
        customer.pharmacyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error in customerService.searchCustomers:', error);
      throw error;
    }
  },

  // Utility method to get customers by credit range
  getCustomersByCreditRange: async (minCredit: number, maxCredit: number): Promise<Customer[]> => {
    try {
      const allCustomers = await customerService.getAllCustomers();
      return allCustomers.filter(customer => 
        customer.credits >= minCredit && customer.credits <= maxCredit
      );
    } catch (error) {
      console.error('Error in customerService.getCustomersByCreditRange:', error);
      throw error;
    }
  },

  // Utility method to update customer credits
  updateCustomerCredits: async (id: string | number, newCredits: number): Promise<{ message: string }> => {
    try {
      const customer = await customerService.getCustomerById(id);
      
      return await customerService.updateCustomer(id, {
        pharmacyname: customer.pharmacyname,
        owner_name: customer.owner_name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        credits: newCredits
      });
    } catch (error) {
      console.error('Error in customerService.updateCustomerCredits:', error);
      throw error;
    }
  }
};

// Export the Customer type for use in components
//export type { Customer };