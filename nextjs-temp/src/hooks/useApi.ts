import { useState } from 'react';
import { ApiError } from '@/types/api';

// Define generic types instead of 'any'
type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
};

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const fetchData = async (url: string, options?: RequestInit): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json() as T;
      setState({ data, error: null, isLoading: false });
    } catch (error) {
      setState({ 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        }, 
        isLoading: false 
      });
    }
  };

  return { ...state, fetchData };
}