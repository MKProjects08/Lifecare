// src/services/api.ts

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error instanceof Error) {
    throw new ApiError(error.message);
  }
  
  throw new ApiError('An unexpected error occurred');
};