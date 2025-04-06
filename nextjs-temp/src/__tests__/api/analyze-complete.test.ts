import { POST } from '@/app/api/analyze-complete/route';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GeminiService } from '@/services/gemini';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Mock global objects needed by Next.js
global.Request = class MockRequest { } as any;
global.Response = class MockResponse { } as any;

// Mock the auth config import first
jest.mock('@/config/auth', () => ({
    authOptions: {
        providers: [],
        adapter: {},
        session: { strategy: 'jwt' },
    }
}));

// Create variable to hold mock function references
const mockFns = {
    analyze: jest.fn(),
    parse: jest.fn(),
    dbCreate: jest.fn().mockResolvedValue({ id: 'mock-analysis-id' })
};

// Setup all mocks
jest.mock('next-auth', () => ({
    getServerSession: jest.fn()
}));

// Mock Prisma safely by using a constant variable
jest.mock('@prisma/client', () => {
    const mock = {
        PrismaClient: jest.fn().mockImplementation(() => ({
            analysis: {
                create: function () {
                    return mockFns.dbCreate.apply(this, arguments);
                }
            },
            $disconnect: jest.fn()
        }))
    };
    return mock;
});

jest.mock('@/services/gemini', () => {
    const mock = {
        GeminiService: jest.fn().mockImplementation(() => ({
            analyzeDocuments: function () {
                return mockFns.analyze.apply(this, arguments);
            }
        })),
        parseAnalysisResponse: function () {
            return mockFns.parse.apply(this, arguments);
        }
    };
    return mock;
});

// Mock pdf-parse
jest.mock('pdf-parse', () => ({
    __esModule: true,
    default: jest.fn()
}));

// Mock mammoth
jest.mock('mammoth', () => ({
    extractRawText: jest.fn()
}));

// Mock TextDecoder and TextEncoder
global.TextDecoder = jest.fn().mockImplementation(() => ({
    decode: jest.fn().mockReturnValue('Mock text content')
}));

global.TextEncoder = jest.fn().mockImplementation(() => ({
    encode: jest.fn().mockReturnValue({
        buffer: new ArrayBuffer(8)
    })
}));

// Mock FormData getAll and get
const mockFormData = {
    getAll: jest.fn(),
    get: jest.fn()
};

// Helper to create test files with proper arrayBuffer implementation
const createTestFile = (name: string, type: string, content = 'test content'): File => {
    const file = new File([content], name, { type });

    // Mock the arrayBuffer method that's used in the API route
    Object.defineProperty(file, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(new ArrayBuffer(8))
    });

    // Define size property
    Object.defineProperty(file, 'size', {
        get() {
            return content.length;
        }
    });

    return file;
};

describe('Analyze Complete API Route', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock return values
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'mock-user-id', name: 'Test User', email: 'test@example.com' }
        });

        mockFns.analyze.mockResolvedValue(`
      # Document Analysis
      
      ## Summary
      This is a test summary.
      
      ## Key Points
      - Point 1
      - Point 2
      
      ## Detailed Analysis
      Detailed analysis text goes here.
      
      ## Recommendations
      Test recommendations.
    `);

        mockFns.parse.mockReturnValue({
            summary: 'This is a test summary',
            keyPoints: ['Point 1', 'Point 2'],
            detailedAnalysis: 'Detailed analysis text goes here.',
            recommendations: 'Test recommendations.',
            documentComparison: '',
            fileInfo: []
        });

        // Add our mock implementation to the imported module
        GeminiService.parseAnalysisResponse = mockFns.parse;

        // Set up PDF parser mock
        (pdfParse.default as jest.Mock).mockResolvedValue({
            text: 'Mock PDF content',
            numpages: 3
        });

        // Set up mammoth mock
        (mammoth.extractRawText as jest.Mock).mockResolvedValue({
            value: 'Mock DOCX content',
            messages: []
        });
    });

    it('returns 400 if content-type is not multipart/form-data', async () => {
        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('application/json')
            }
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);

        const responseBody = await response.json();
        expect(responseBody.error).toBe('Expected multipart/form-data request');
    });

    it('returns 400 if no files are provided', async () => {
        // Mock formData.getAll to return empty array
        mockFormData.getAll.mockReturnValue([]);

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);

        const responseBody = await response.json();
        expect(responseBody.error).toBe('No files provided');
    });

    it('processes PDF files successfully', async () => {
        // Create mock PDF file
        const pdfFile = createTestFile('test.pdf', 'application/pdf');

        // Mock form data to return PDF file
        mockFormData.getAll.mockReturnValue([pdfFile]);
        mockFormData.get.mockReturnValue(null); // No custom prompt

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('summary', 'This is a test summary');
        expect(responseBody).toHaveProperty('keyPoints');
        expect(responseBody.keyPoints).toEqual(['Point 1', 'Point 2']);

        // Verify pdf-parse was called
        expect(pdfParse.default).toHaveBeenCalled();
    });

    it('processes DOCX files successfully', async () => {
        // Create mock DOCX file
        const docxFile = createTestFile(
            'test.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        // Mock form data to return DOCX file
        mockFormData.getAll.mockReturnValue([docxFile]);
        mockFormData.get.mockReturnValue(null); // No custom prompt

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        // Verify mammoth.extractRawText was called
        expect(mammoth.extractRawText).toHaveBeenCalled();
    });

    it('processes markdown files successfully', async () => {
        // Create mock Markdown file
        const mdFile = createTestFile('test.md', 'text/markdown');

        // Mock form data to return markdown file
        mockFormData.getAll.mockReturnValue([mdFile]);
        mockFormData.get.mockReturnValue(null); // No custom prompt

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        // Verify TextDecoder was used
        expect(global.TextDecoder).toHaveBeenCalled();
    });

    it('processes text files successfully', async () => {
        // Create mock text file
        const textFile = createTestFile('test.txt', 'text/plain');

        // Mock form data to return text file
        mockFormData.getAll.mockReturnValue([textFile]);
        mockFormData.get.mockReturnValue(null); // No custom prompt

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        // Verify TextDecoder was used
        expect(global.TextDecoder).toHaveBeenCalled();
    });

    // Update the multiple files test to use the mockAnalyzeDocuments directly
    it('processes multiple files together', async () => {
        // Create multiple mock files
        const pdfFile = createTestFile('test.pdf', 'application/pdf');
        const textFile = createTestFile('test.txt', 'text/plain');

        // Mock form data to return multiple files
        mockFormData.getAll.mockReturnValue([pdfFile, textFile]);
        mockFormData.get.mockReturnValue(null); // No custom prompt

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        // Verify that fileInfo contains entries for both files
        expect(responseBody.fileInfo).toHaveLength(2);

        // Verify the mock function was called
        expect(mockFns.analyze).toHaveBeenCalled();
    });

    it('handles custom prompt when provided', async () => {
        const pdfFile = createTestFile('test.pdf', 'application/pdf');

        // Mock form data to return a file and custom prompt
        mockFormData.getAll.mockReturnValue([pdfFile]);
        mockFormData.get.mockReturnValue('Custom analysis instruction');

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(responseBody.customPromptUsed).toBe(true);

        // Verify the mock function was called with the custom prompt
        expect(mockFns.analyze).toHaveBeenCalledWith(
            expect.any(Array),
            'Custom analysis instruction'
        );
    });

    it('saves analysis to database for authenticated users', async () => {
        const pdfFile = createTestFile('test.pdf', 'application/pdf');

        // Mock form data
        mockFormData.getAll.mockReturnValue([pdfFile]);
        mockFormData.get.mockReturnValue(null);

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        // Mock authenticated session
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'user-123', name: 'Test User', email: 'test@example.com' }
        });

        const response = await POST(mockRequest);
        expect(response.status).toBe(200);

        // Verify database create was called using our mockPrismaAnalysisCreate
        expect(mockFns.dbCreate).toHaveBeenCalled();

        // Check that the user ID was passed correctly
        const createCall = mockFns.dbCreate.mock.calls[0][0];
        expect(createCall.data.userId).toBe('user-123');
    });

    it('still returns analysis even if database save fails', async () => {
        const pdfFile = createTestFile('test.pdf', 'application/pdf');

        // Mock form data
        mockFormData.getAll.mockReturnValue([pdfFile]);
        mockFormData.get.mockReturnValue(null);

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        // Mock authenticated session
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { id: 'user-123' }
        });

        // Force database to throw error
        mockFns.dbCreate.mockRejectedValueOnce(new Error('Database error'));

        const response = await POST(mockRequest);

        // Should still return 200 with analysis, despite DB error
        expect(response.status).toBe(200);

        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('summary');
        expect(responseBody).toHaveProperty('keyPoints');
    });

    it('returns 500 if Gemini analysis fails', async () => {
        const pdfFile = createTestFile('test.pdf', 'application/pdf');

        // Mock form data
        mockFormData.getAll.mockReturnValue([pdfFile]);

        const mockRequest = {
            headers: {
                get: jest.fn().mockReturnValue('multipart/form-data')
            },
            formData: jest.fn().mockResolvedValue(mockFormData)
        } as unknown as NextRequest;

        // Force Gemini service to throw error
        mockFns.analyze.mockRejectedValue(
            new Error('Gemini API failure')
        );

        const response = await POST(mockRequest);
        expect(response.status).toBe(500);

        const responseBody = await response.json();
        expect(responseBody.error).toBe('Gemini API failure');
    });
});