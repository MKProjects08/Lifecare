import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

export interface Agency {
  id?: number;
  Agency_ID?: number;
  agencyname: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  sales: number;
  target: number;
  is_active?: boolean;
}

export interface CreateAgencyData {
  agencyname: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  sales: number;
  target: number;
}

export interface UpdateAgencyData {
  agencyname: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  sales: number;
  target: number;
}

export const agencyService = {
  // ✅ Get all agencies
  getAllAgencies: async (): Promise<Agency[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies`, {
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
      console.error('Error in agencyService.getAllAgencies:', error);
      throw error;
    }
  },

  // ✅ Get agency by ID
  getAgencyById: async (id: string | number): Promise<Agency> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in agencyService.getAgencyById:', error);
      throw error;
    }
  },

  // ✅ Create new agency
  createAgency: async (agencyData: CreateAgencyData): Promise<{ message: string; id: number }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(agencyData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in agencyService.createAgency:', error);
      throw error;
    }
  },

  // ✅ Update agency
  updateAgency: async (id: string | number, agencyData: UpdateAgencyData): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(agencyData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in agencyService.updateAgency:', error);
      throw error;
    }
  },

  // ✅ Delete agency (soft delete)
  deleteAgency: async (id: string | number): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in agencyService.deleteAgency:', error);
      throw error;
    }
  },

  // Utility method to get active agencies only
  getActiveAgencies: async (): Promise<Agency[]> => {
    try {
      const allAgencies = await agencyService.getAllAgencies();
      return allAgencies.filter(agency => agency.is_active !== false);
    } catch (error) {
      console.error('Error in agencyService.getActiveAgencies:', error);
      throw error;
    }
  },

  // Utility method to search agencies by name, contact person, or email
  searchAgencies: async (searchTerm: string): Promise<Agency[]> => {
    try {
      const allAgencies = await agencyService.getAllAgencies();
      return allAgencies.filter(agency => 
        agency.agencyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.phone.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error in agencyService.searchAgencies:', error);
      throw error;
    }
  }
};