import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/utils/apiMiddleware';
import { AnalysisHistory } from '@/types/api';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export const GET = withAuth(async (req, session) => {
    try {
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Get user's analysis history
        const analyses = await prisma.analysis.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                filename: true,
                summary: true,
                createdAt: true,
            },
        });

        // Format the response
        const history: AnalysisHistory[] = analyses.map(analysis => ({
            id: analysis.id,
            filename: analysis.filename,
            summary: analysis.summary,
            createdAt: analysis.createdAt.toISOString(),
        }));

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis history' },
            { status: 500 }
        );
    }
});