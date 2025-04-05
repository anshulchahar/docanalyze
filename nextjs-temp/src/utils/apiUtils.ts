import { NextResponse } from 'next/server';
import { ApiError } from '@/types/api';

export function errorResponse(message: string, status: number = 400): NextResponse<ApiError> {
    return NextResponse.json(
        { error: message },
        { status }
    );
}

export function isApiError<T>(response: T | ApiError): response is ApiError {
    return typeof response === 'object' && response !== null && 'error' in response && typeof (response as ApiError).error === 'string';
}

export async function handleServerError(error: unknown) {
    console.error('Server error:', error);

    if (error instanceof Error) {
        return errorResponse(error.message, 500);
    }

    return errorResponse('An unexpected error occurred', 500);
}

export function validateApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
    });

    return validateApiResponse<T>(response);
}