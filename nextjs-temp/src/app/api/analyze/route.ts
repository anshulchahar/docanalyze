import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/utils/apiMiddleware';
import { PDFService } from '@/services/pdf';
import { GeminiService } from '@/services/gemini';
import { errorResponse } from '@/utils/apiUtils';
import { AnalysisResult } from '@/types/api';

const prisma = new PrismaClient();

export const POST = withAuth(async (req, session) => {
    try {
        const formData = await req.formData();
        const files = formData.getAll('pdfFiles') as File[];

        if (!files || files.length === 0) {
            return errorResponse('No PDF files provided', 400);
        }

        // Process PDFs
        const processedFiles = await PDFService.validateAndProcessFiles(files);

        if (processedFiles.length === 0) {
            return errorResponse('Failed to process any of the provided files', 400);
        }

        // Extract texts and file info
        const texts = processedFiles.map(file => file.text);
        const fileInfo = processedFiles.map(file => file.info);

        // Analyze with Gemini
        const geminiService = new GeminiService();
        const analysisText = await geminiService.analyzeDocuments(texts);
        const analysisResult = GeminiService.parseAnalysisResponse(analysisText);

        // Create response
        const result: AnalysisResult = {
            ...analysisResult,
            fileInfo,
        };

        // Save to database if user is authenticated
        if (session.user.id) {
            await prisma.analysis.create({
                data: {
                    userId: session.user.id,
                    filename: files.map(f => f.name).join(', '),
                    summary: result.summary,
                    keyPoints: JSON.stringify(result.keyPoints),
                    analysis: JSON.stringify(result),
                },
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in analyze route:', error);
        return errorResponse(
            error instanceof Error ? error.message : 'An error occurred during analysis',
            500
        );
    }
});