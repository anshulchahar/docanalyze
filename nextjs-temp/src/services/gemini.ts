import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ANALYSIS_PROMPTS, ANALYSIS_OPTIONS } from '@/config/prompts';
import { AnalysisResult } from '@/types/api';

// Define a type for text content instead of using 'any'
type TextContent = {
    text: string;
};

// API versions to try in order
const API_VERSIONS = ["v1", "v1beta", "v1beta2", "v1beta3"];

// Model name variations to try
const MODEL_VARIATIONS = [
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
];

export class GeminiService {
    private apiKey: string;
    private modelName = 'gemini-2.0-flash'; // Using the model that's available according to ListModels response
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

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
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.modelName });
    }

    // Attempt to call Gemini API with multiple versions and model names
    private async callGeminiApiWithFallbacks(prompt: string): Promise<string> {
        let lastError = null;

        // First try the SDK approach
        try {
            console.log(`Trying SDK with model ${this.modelName}`);
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                    topP: ANALYSIS_OPTIONS.TOP_P,
                    maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                }
            });

            console.log('SDK call successful');
            return result.response.text();
        } catch (sdkError) {
            console.error('SDK approach failed:', sdkError);
            lastError = sdkError;
        }

        // If SDK fails, try direct API calls with different API versions and models
        for (const version of API_VERSIONS) {
            for (const model of MODEL_VARIATIONS) {
                try {
                    console.log(`Trying direct API call with ${version} and model ${model}`);
                    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${this.apiKey}`;

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: {
                                temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                                maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                            }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();

                        if (!data.candidates || !data.candidates[0]?.content?.parts) {
                            console.log(`Got response from ${version}/${model} but unexpected structure`);
                            continue;
                        }

                        const textContent = data.candidates[0].content.parts.find(
                            (part: TextContent) => part.text
                        );

                        if (!textContent || !textContent.text) {
                            console.log(`Got response from ${version}/${model} but no text content`);
                            continue;
                        }

                        console.log(`Successfully used ${version}/models/${model}`);

                        // Update the model name for future calls
                        this.modelName = model;
                        this.model = this.genAI.getGenerativeModel({ model });

                        return textContent.text;
                    } else {
                        const errorText = await response.text();
                        console.log(`Failed with ${version}/${model}: ${errorText}`);
                    }
                } catch (error) {
                    console.error(`Error with ${version}/${model}:`, error);
                    lastError = error;
                }
            }
        }

        // If we get here, all attempts failed
        throw lastError || new Error('Failed to call Gemini API with all attempted configurations');
    }

    // Process text documents and generate analysis
    async analyzeDocuments(documents: string[]): Promise<string> {
        try {
            console.log(`Using Gemini ${this.modelName} with API version v1`);

            // Format the documents for the prompt
            const formattedDocs = documents.map((doc, i) =>
                `DOCUMENT ${i + 1}:\n${doc.slice(0, 15000)}`
            ).join('\n\n');

            // Create the prompt with docs
            const prompt = documents.length > 1
                ? ANALYSIS_PROMPTS.MULTIPLE_DOCUMENTS.replace('{text}', formattedDocs)
                : ANALYSIS_PROMPTS.SINGLE_DOCUMENT.replace('{text}', documents[0]);

            try {
                // First try using the SDK
                console.log('Attempting to use the Google Generative AI SDK...');
                const result = await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                        maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                    }
                });

                return result.response.text();
            } catch (sdkError) {
                // If SDK fails, fall back to direct API call
                console.error('SDK approach failed, falling back to direct API call:', sdkError);

                const url = `https://generativelanguage.googleapis.com/v1/models/${this.modelName}:generateContent?key=${this.apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                            maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
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
            }
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

            try {
                // Try using the SDK first
                console.log(`Using SDK with model ${this.modelName}`);
                const result = await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: promptText }] }],
                    generationConfig: {
                        temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                        topP: ANALYSIS_OPTIONS.TOP_P,
                        maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                    }
                });

                return result.response.text();
            } catch (sdkError) {
                console.error('SDK approach failed, trying direct API call:', sdkError);

                // Fall back to direct API call
                const url = `https://generativelanguage.googleapis.com/v1/models/${this.modelName}:generateContent?key=${this.apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptText }] }],
                        generationConfig: {
                            temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                            topP: ANALYSIS_OPTIONS.TOP_P,
                            maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
                }

                const data = await response.json();
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
            }
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

        // Add logging to see what text we're trying to parse
        console.log('Raw response from Gemini API (first 500 chars):', text.substring(0, 500));

        try {
            // Extract summary
            const summaryMatch = text.match(/## Summary\s*\n([\s\S]*?)(?=\n## Key Points|\n## Detailed Analysis|$)/i);
            if (summaryMatch && summaryMatch[1]) {
                result.summary = summaryMatch[1].trim();
                console.log('Found summary section, length:', result.summary.length);
            } else {
                console.warn('No summary section found in response');
            }

            // Extract key points
            const keyPointsMatch = text.match(/## Key Points\s*\n([\s\S]*?)(?=\n## Detailed Analysis|$)/i);
            if (keyPointsMatch && keyPointsMatch[1]) {
                const keyPointsText = keyPointsMatch[1].trim();
                console.log('Found key points section, raw text:', keyPointsText);

                result.keyPoints = keyPointsText
                    .split('\n')
                    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
                    .map(point => point.replace(/^[-*]\s*/, '').trim())
                    .filter(point => point.length > 0);

                console.log('Extracted key points count:', result.keyPoints.length);

                // If no bullet points found but there's content, try to parse it differently
                if (result.keyPoints.length === 0 && keyPointsText.length > 0) {
                    console.log('No bullet points found but content exists, trying alternate parsing');
                    // Split by newlines and filter out empty lines as a fallback
                    result.keyPoints = keyPointsText
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);
                }
            } else {
                console.warn('No key points section found in response');
            }

            // Extract detailed analysis
            const detailedAnalysisMatch = text.match(/## Detailed Analysis\s*\n([\s\S]*?)(?=\n## Recommendations|$)/i);
            if (detailedAnalysisMatch && detailedAnalysisMatch[1]) {
                result.detailedAnalysis = detailedAnalysisMatch[1].trim();
                console.log('Found detailed analysis section, length:', result.detailedAnalysis.length);
            } else {
                console.warn('No detailed analysis section found in response');
            }

            // Extract recommendations
            const recommendationsMatch = text.match(/## Recommendations\s*\n([\s\S]*?)(?=\n## Document Comparison|$)/i);
            if (recommendationsMatch && recommendationsMatch[1]) {
                result.recommendations = recommendationsMatch[1].trim();
                console.log('Found recommendations section, length:', result.recommendations.length);
            } else {
                console.warn('No recommendations section found in response');
            }

            // Extract document comparison if multiple documents
            const comparisonMatch = text.match(/## Document Comparison\s*\n([\s\S]*?)$/i);
            if (comparisonMatch && comparisonMatch[1]) {
                result.documentComparison = comparisonMatch[1].trim();
                console.log('Found document comparison section, length:', result.documentComparison.length);
            }

            // If everything is empty, fallback to simple text division
            if (!result.summary && !result.keyPoints.length && !result.detailedAnalysis && !result.recommendations) {
                console.warn('All sections are empty, applying fallback parsing');

                // Split the text into paragraphs
                const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

                if (paragraphs.length >= 3) {
                    result.summary = paragraphs[0];
                    result.keyPoints = [paragraphs[1]];
                    result.detailedAnalysis = paragraphs.slice(2).join('\n\n');
                } else if (paragraphs.length > 0) {
                    // Just put everything in summary if we don't have enough paragraphs
                    result.summary = paragraphs.join('\n\n');
                }
            }

        } catch (error) {
            console.error('Error parsing analysis response:', error);
        }

        return result;
    }
}