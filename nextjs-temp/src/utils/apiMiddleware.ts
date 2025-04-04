import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { errorResponse, handleServerError } from './apiUtils';
import { ERROR_MESSAGES } from '@/constants/api';

type ApiHandler = (
    req: NextRequest,
    session: Awaited<ReturnType<typeof getServerSession>>,
) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler) {
    return async function (req: NextRequest) {
        try {
            const session = await getServerSession(authOptions);

            if (!session?.user) {
                return errorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401);
            }

            return await handler(req, session);
        } catch (error) {
            return handleServerError(error);
        }
    };
}

export function withErrorHandler(handler: ApiHandler) {
    return async function (req: NextRequest) {
        try {
            const session = await getServerSession(authOptions);
            return await handler(req, session);
        } catch (error) {
            return handleServerError(error);
        }
    };
}