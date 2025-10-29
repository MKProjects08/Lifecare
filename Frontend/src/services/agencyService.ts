// src/services/agencyService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

export const agencyService = {
  // Get all agencies
  getAllAgencies: async (): Promise<any[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/agencies`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await handleResponse(response);
      
      // Handle the actual API response structure
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

  // You can add more agency-related methods here as your backend grows
  // getAgencyById, createAgency, updateAgency, deleteAgency, etc.
};