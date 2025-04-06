import { GeminiService } from '@/services/gemini';
import { ANALYSIS_PROMPTS, ANALYSIS_OPTIONS } from '@/config/prompts';

// Mock GoogleGenerativeAI and GenerativeModel
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: mockGenerateContent
      }))
    })),
    mockGenerateContent
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to avoid cluttering test output
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

describe('GeminiService', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Set up test environment
    process.env = { 
      ...originalEnv,
      GEMINI_API_KEY: 'test-api-key'
    };
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fetch response
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: 'Mocked API response content' }
              ]
            }
          }
        ]
      }),
      text: jest.fn().mockResolvedValue('{"error": "Mocked error response"}')
    });
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  it('throws an error if API key is missing', () => {
    delete process.env.GEMINI_API_KEY;
    
    expect(() => new GeminiService()).toThrow('Missing Gemini API key');
  });
  
  it('initializes with correct API key', () => {
    const service = new GeminiService();
    expect(service).toBeInstanceOf(GeminiService);
  });
  
  describe('analyzeDocuments', () => {
    it('analyzes single document with correct prompt', async () => {
      // Mock successful SDK response
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Mocked analysis result')
        }
      };
      
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockResolvedValue(mockResponse);
      
      const service = new GeminiService();
      const result = await service.analyzeDocuments(['Test document content']);
      
      expect(result).toBe('Mocked analysis result');
      
      // Verify the prompt used contains the document
      expect(mockGenerateContent).toHaveBeenCalledWith({
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: expect.stringContaining('Test document content')
          }] 
        }],
        generationConfig: expect.any(Object)
      });
      
      // Verify single document prompt was used
      const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
      expect(prompt).toContain('Analyze the following document');
      expect(prompt).not.toContain('Analyze the following documents');
    });
    
    it('analyzes multiple documents with correct prompt', async () => {
      // Mock successful SDK response
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Mocked multi-doc analysis result')
        }
      };
      
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockResolvedValue(mockResponse);
      
      const service = new GeminiService();
      const result = await service.analyzeDocuments([
        'Document 1 content',
        'Document 2 content'
      ]);
      
      expect(result).toBe('Mocked multi-doc analysis result');
      
      // Verify multiple documents prompt was used
      const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
      expect(prompt).toContain('Analyze the following documents');
      expect(prompt).toContain('DOCUMENT 1:');
      expect(prompt).toContain('DOCUMENT 2:');
    });
    
    it('includes custom prompt when provided', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Mocked analysis with custom prompt')
        }
      };
      
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockResolvedValue(mockResponse);
      
      const service = new GeminiService();
      await service.analyzeDocuments(
        ['Test document content'],
        'Custom analysis instruction'
      );
      
      // Verify custom prompt is included
      const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
      expect(prompt).toContain('User-Specified Instructions: Custom analysis instruction');
    });
    
    it('falls back to direct API call if SDK fails', async () => {
      // Mock SDK failure
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValue(new Error('SDK error'));
      
      const service = new GeminiService();
      const result = await service.analyzeDocuments(['Test document content']);
      
      // Verify result comes from fetch fallback
      expect(result).toBe('Mocked API response content');
      
      // Verify fetch was called with correct parameters
      expect(fetch).toHaveBeenCalled();
      expect((fetch as jest.Mock).mock.calls[0][0]).toContain('generativelanguage.googleapis.com');
    });
    
    it('throws error if both SDK and direct API fail', async () => {
      // Mock SDK failure
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValue(new Error('SDK error'));
      
      // Mock fetch failure
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        text: jest.fn().mockResolvedValue('API error')
      });
      
      const service = new GeminiService();
      
      await expect(service.analyzeDocuments(['Test document content']))
        .rejects.toThrow('Gemini API error');
    });
  });
  
  describe('extractMetadata', () => {
    it('extracts metadata with correct prompt', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue('Metadata extraction result')
        }
      };
      
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockResolvedValue(mockResponse);
      
      const service = new GeminiService();
      const result = await service.extractMetadata('Test document for metadata');
      
      expect(result).toBe('Metadata extraction result');
      
      // Verify correct prompt was used
      const prompt = mockGenerateContent.mock.calls[0][0].contents[0].parts[0].text;
      expect(prompt).toContain('Extract and analyze the following metadata');
      expect(prompt).toContain('Test document for metadata');
    });
    
    it('throws error if text is empty', async () => {
      const service = new GeminiService();
      
      await expect(service.extractMetadata(''))
        .rejects.toThrow('No text provided for metadata extraction');
    });
  });
  
  describe('parseAnalysisResponse', () => {
    it('parses well-formed response correctly', () => {
      const response = `
        # Document Analysis
        
        ## Summary
        This is a test summary paragraph.
        
        ## Key Points
        - Point 1
        - Point 2
        - Point 3
        
        ## Detailed Analysis
        This is a detailed analysis section.
        With multiple paragraphs.
        
        ## Recommendations
        These are test recommendations.
      `;
      
      const result = GeminiService.parseAnalysisResponse(response);
      
      // Verify key structure elements, not exact formatting
      expect(result.summary).toContain('This is a test summary paragraph');
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(1);
      expect(result.keyPoints.some(point => point.includes('Point 1'))).toBe(true);
      expect(result.keyPoints.some(point => point.includes('Point 2'))).toBe(true);
      expect(result.keyPoints.some(point => point.includes('Point 3'))).toBe(true);
      expect(result.detailedAnalysis).toContain('This is a detailed analysis section');
      expect(result.recommendations).toContain('These are test recommendations');
      expect(result).toHaveProperty('documentComparison');
      expect(result).toHaveProperty('fileInfo');
    });
    
    it('parses response with document comparison', () => {
      const response = `
        ## Summary
        Test summary.
        
        ## Key Points
        - Point 1
        
        ## Detailed Analysis
        Test analysis.
        
        ## Recommendations
        Test recommendations.
        
        ## Document Comparison
        Comparison of documents.
      `;
      
      const result = GeminiService.parseAnalysisResponse(response);
      
      expect(result.documentComparison).toContain('Comparison of documents');
    });
    
    it('handles response with unstructured key points', () => {
      const response = `
        ## Summary
        Test summary.
        
        ## Key Points
        These points are not in bullet format.
        Another point without bullets.
        
        ## Detailed Analysis
        Test analysis.
      `;
      
      const result = GeminiService.parseAnalysisResponse(response);
      
      // Check that points were extracted (we don't care about exact format)
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(1);
      expect(result.keyPoints.join(' ')).toContain('These points are not in bullet format');
      expect(result.keyPoints.join(' ')).toContain('Another point without bullets');
    });
    
    it('applies fallback parsing for unstructured responses', () => {
      const response = `
        This is a paragraph that doesn't follow the structure.
        
        This is another paragraph without proper headings.
        
        This is a third paragraph.
      `;
      
      const result = GeminiService.parseAnalysisResponse(response);
      
      // Check that parsing happened, even if not in the exact format expected
      expect(result.summary).toContain('This is a paragraph');
      expect(result.keyPoints.length).toBeGreaterThanOrEqual(0);
      expect(result.detailedAnalysis || result.summary).toContain('third paragraph');
    });
    
    it('handles completely empty response', () => {
      const result = GeminiService.parseAnalysisResponse('');
      
      expect(result).toEqual({
        summary: '',
        keyPoints: [],
        detailedAnalysis: '',
        recommendations: '',
        documentComparison: '',
        fileInfo: []
      });
    });
  });
});