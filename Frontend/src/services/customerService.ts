import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

export interface Customer {
  CustomerID?: number;
  Customer_ID?: number;
  id?: number;
  pharmacyname: string;
  owner_name: string;
  phone: string;
  address: string;
  email: string;
  credits: number;
  is_active?: boolean;
}

export interface CreateCustomerData {
  pharmacyname: string;
  owner_name: string;
  phone: string;
  address: string;
  email: string;
  credits: number;
}

export interface UpdateCustomerData {
  pharmacyname: string;
  owner_name: string;
  phone: string;
  address: string;
  email: string;
  credits: number;
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
  createCustomer: async (customerData: CreateCustomerData): Promise<{ message: string; customerId: number }> => {
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
  updateCustomer: async (id: string | number, customerData: UpdateCustomerData): Promise<{ message: string }> => {
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

  // ✅ Delete customer (soft delete)
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

  // Utility method to search customers by pharmacy name, owner name, or email
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

  // Utility method to get customers with credits
  getCustomersWithCredits: async (): Promise<Customer[]> => {
    try {
      const allCustomers = await customerService.getAllCustomers();
      return allCustomers.filter(customer => (customer.credits || 0) > 0);
    } catch (error) {
      console.error('Error in customerService.getCustomersWithCredits:', error);
      throw error;
    }
  }
};