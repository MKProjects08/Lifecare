// src/services/userService.ts
import { getAuthToken, API_BASE_URL, getHeaders, handleResponse } from './productService';

// User interface matching your database schema
export interface User {
  UserID?: number;
  User_ID?: number;
  username: string;
  password?: string; // Optional because we don't always want to expose this
  role: string;
  email: string;
  phone: string;
  is_active?: boolean;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: string;
  email: string;
  phone: string;
}

export interface UpdateUserData {
  username: string;
  password?: string;
  role: string;
  email: string;
  phone: string;
}

export const userService = {
  // ✅ Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
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
      console.error('Error in userService.getAllUsers:', error);
      throw error;
    }
  },

  // ✅ Get user by ID
  getUserById: async (id: string | number): Promise<User> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in userService.getUserById:', error);
      throw error;
    }
  },

  // ✅ Create new user
  createUser: async (userData: CreateUserData): Promise<{ message: string; userId: number }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in userService.createUser:', error);
      throw error;
    }
  },

  // ✅ Update user
  updateUser: async (id: string | number, userData: UpdateUserData): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in userService.updateUser:', error);
      throw error;
    }
  },

  // ✅ Soft delete user
  deleteUser: async (id: string | number): Promise<{ message: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error in userService.deleteUser:', error);
      throw error;
    }
  },

  // Utility method to get active users only
  getActiveUsers: async (): Promise<User[]> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.filter(user => user.is_active !== false);
    } catch (error) {
      console.error('Error in userService.getActiveUsers:', error);
      throw error;
    }
  },

  // Utility method to get users by role
  getUsersByRole: async (role: string): Promise<User[]> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.filter(user => user.role.toLowerCase() === role.toLowerCase());
    } catch (error) {
      console.error('Error in userService.getUsersByRole:', error);
      throw error;
    }
  },

  // Utility method to search users by username, email, or phone
  searchUsers: async (searchTerm: string): Promise<User[]> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error in userService.searchUsers:', error);
      throw error;
    }
  },

  // Utility method to update user password only
  updateUserPassword: async (id: string | number, newPassword: string): Promise<{ message: string }> => {
    try {
      const user = await userService.getUserById(id);
      
      return await userService.updateUser(id, {
        username: user.username,
        password: newPassword,
        role: user.role,
        email: user.email,
        phone: user.phone
      });
    } catch (error) {
      console.error('Error in userService.updateUserPassword:', error);
      throw error;
    }
  },

  // Utility method to update user role only
  updateUserRole: async (id: string | number, newRole: string): Promise<{ message: string }> => {
    try {
      const user = await userService.getUserById(id);
      
      return await userService.updateUser(id, {
        username: user.username,
        role: newRole,
        email: user.email,
        phone: user.phone
      });
    } catch (error) {
      console.error('Error in userService.updateUserRole:', error);
      throw error;
    }
  },

  // Utility method to check if username already exists
  checkUsernameExists: async (username: string): Promise<boolean> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.some(user => 
        user.username.toLowerCase() === username.toLowerCase()
      );
    } catch (error) {
      console.error('Error in userService.checkUsernameExists:', error);
      throw error;
    }
  },

  // Utility method to check if email already exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.some(user => 
        user.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error('Error in userService.checkEmailExists:', error);
      throw error;
    }
  },

  // Utility method to get user by username (for login purposes)
  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      const allUsers = await userService.getAllUsers();
      return allUsers.find(user => 
        user.username.toLowerCase() === username.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error in userService.getUserByUsername:', error);
      throw error;
    }
  },

  // Utility method to validate user credentials (for login)
  validateUserCredentials: async (username: string, password: string): Promise<{ isValid: boolean; user?: User }> => {
    try {
      // Note: This would typically be handled by the backend authentication endpoint
      // This is a client-side utility that might need backend support
      const user = await userService.getUserByUsername(username);
      
      if (!user) {
        return { isValid: false };
      }

      // In a real application, password validation should happen on the backend
      // This is just a placeholder - you should have a separate authentication endpoint
      return { 
        isValid: true, 
        user: { ...user, password: undefined } // Don't return password
      };
    } catch (error) {
      console.error('Error in userService.validateUserCredentials:', error);
      throw error;
    }
  }
};

// Export the User types for use in components
//export type { User, CreateUserData, UpdateUserData };