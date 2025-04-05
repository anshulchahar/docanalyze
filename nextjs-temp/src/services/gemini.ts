// Remove unused imports
// import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ANALYSIS_PROMPTS, ANALYSIS_OPTIONS } from '@/config/prompts';
import { PROMPTS } from '@/config/prompts';
import { AnalysisResult } from '@/types/api';

// Define a type for text content instead of using 'any'
type TextContent = {
    text: string;
};

export class GeminiService {
    private apiKey: string;
    private model = 'gemini-pro';

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;

        // Log API key presence (not the actual key)
        console.log('Gemini API key check:', {
            isDefined: !!apiKey,
            length: apiKey ? apiKey.length : 0,
            firstChar: apiKey ? apiKey[0] : null,
            lastChars: apiKey ? `...${apiKey.slice(-3)}` : null
        });

        if (!apiKey) {
            throw new Error('Missing Gemini API key. Please check your environment variables.');
        }

        this.apiKey = apiKey;
    }

    // Process text documents and generate analysis
    async analyzeDocuments(documents: string[]): Promise<string> {
        try {
            const url = `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`;

            // Format the documents for the prompt
            const formattedDocs = documents.map((doc, i) =>
                `DOCUMENT ${i + 1}:\n${doc.slice(0, 15000)}`
            ).join('\n\n');

            // Create the prompt with docs
            const prompt = PROMPTS.ANALYSIS_PROMPT.replace('{{DOCUMENTS}}', formattedDocs);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 8192,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // Extract text content
            if (!data.candidates || !data.candidates[0]?.content?.parts) {
                throw new Error('Unexpected API response structure');
            }

            const textContent = data.candidates[0].content.parts.find(
                (part: TextContent) => part.text
            );

            if (!textContent || !textContent.text) {
                throw new Error('No text content found in the API response');
            }

            return textContent.text;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    async extractMetadata(text: string): Promise<string> {
        try {
            if (!text) {
                throw new Error('No text provided for metadata extraction');
            }

            const prompt = ANALYSIS_PROMPTS.EXTRACT_METADATA;
            const promptText = prompt.replace('{text}', text);

            // Updated API format for content
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                    topP: ANALYSIS_OPTIONS.TOP_P,
                    maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                }
            });

            return result.response.text();
        } catch (error) {
            console.error('Error extracting metadata with Gemini:', error);
            throw new Error(error instanceof Error
                ? `Failed to extract metadata: ${error.message}`
                : 'Failed to extract metadata: Unknown error');
        }
    }

    // Parse the analysis response
    static parseAnalysisResponse(text: string): AnalysisResult {
        const result: AnalysisResult = {
            summary: '',
            keyPoints: [],
            detailedAnalysis: '',
            recommendations: '',
            documentComparison: '',
            fileInfo: []
        };

        try {
            // Extract summary
            const summaryMatch = text.match(/## Summary\s*\n([\s\S]*?)(?=\n## Key Points|\n## Detailed Analysis|$)/i);
            if (summaryMatch && summaryMatch[1]) {
                result.summary = summaryMatch[1].trim();
            }

            // Extract key points
            const keyPointsMatch = text.match(/## Key Points\s*\n([\s\S]*?)(?=\n## Detailed Analysis|$)/i);
            if (keyPointsMatch && keyPointsMatch[1]) {
                result.keyPoints = keyPointsMatch[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                    .map(point => point.replace(/^[-*]\s*/, '').trim())
                    .filter(point => point.length > 0);
            }

            // Extract detailed analysis
            const detailedAnalysisMatch = text.match(/## Detailed Analysis\s*\n([\s\S]*?)(?=\n## Recommendations|$)/i);
            if (detailedAnalysisMatch && detailedAnalysisMatch[1]) {
                result.detailedAnalysis = detailedAnalysisMatch[1].trim();
            }

            // Extract recommendations
            const recommendationsMatch = text.match(/## Recommendations\s*\n([\s\S]*?)(?=\n## Document Comparison|$)/i);
            if (recommendationsMatch && recommendationsMatch[1]) {
                result.recommendations = recommendationsMatch[1].trim();
            }

            // Extract document comparison if multiple documents
            const comparisonMatch = text.match(/## Document Comparison\s*\n([\s\S]*?)$/i);
            if (comparisonMatch && comparisonMatch[1]) {
                result.documentComparison = comparisonMatch[1].trim();
            }

        } catch (error) {
            console.error('Error parsing analysis response:', error);
        }

        return result;
    }
}