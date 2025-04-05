import { useState } from 'react';
import { ApiError, ApiResponse } from '@/types/api';

interface UseApiResponse<T> {
    data: T | null;
    error: string | null;
    loading: boolean;
    execute: (...args: any[]) => Promise<void>;
}

export function useApi<T>(
    apiFunction: (...args: any[]) => Promise<Response>,
): UseApiResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const isApiError = (response: ApiResponse<T>): response is ApiError => {
        return 'error' in response;
    };

    const execute = async (...args: any[]) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFunction(...args);
            const result = await response.json() as ApiResponse<T>;

            if (!response.ok || isApiError(result)) {
                throw new Error(isApiError(result) ? result.error : 'An error occurred');
            }

            setData(result as T);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        error,
        loading,
        execute,
    };
}