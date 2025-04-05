import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ANALYSIS_PROMPTS, ANALYSIS_OPTIONS } from '@/config/prompts';

export class GeminiService {
    private model: any;

    constructor() {
        try {
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

            const genAI = new GoogleGenerativeAI(apiKey);
            // Update to the newer model name supported in the v1 API
            this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            console.log('Successfully initialized Gemini API client with model: gemini-pro');
        } catch (error) {
            console.error('Error initializing Gemini service:', error);
            throw new Error(error instanceof Error
                ? `Failed to initialize Gemini API: ${error.message}`
                : 'Failed to initialize Gemini API');
        }
    }

    async analyzeDocuments(texts: string[]): Promise<string> {
        try {
            if (!texts || texts.length === 0) {
                throw new Error('No text provided for analysis');
            }

            console.log(`Analyzing ${texts.length} documents (total characters: ${texts.reduce((acc, txt) => acc + txt.length, 0)})`);

            const prompt = texts.length > 1
                ? ANALYSIS_PROMPTS.MULTIPLE_DOCUMENTS
                : ANALYSIS_PROMPTS.SINGLE_DOCUMENT;

            const combinedText = texts.map((text, index) =>
                `Document ${index + 1}:\n${text}`
            ).join('\n\n');

            const promptText = prompt.replace('{text}', combinedText);
            console.log('Sending request to Gemini API...');

            // Updated API format for content and safety settings
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: promptText }] }],
                generationConfig: {
                    temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                    topP: ANALYSIS_OPTIONS.TOP_P,
                    maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
                    }
                ]
            });

            const responseText = result.response.text();
            console.log(`Received response from Gemini API (${responseText.length} characters)`);
            return responseText;
        } catch (error) {
            console.error('Error analyzing documents with Gemini:', error);
            throw new Error(error instanceof Error
                ? `Failed to analyze with Gemini API: ${error.message}`
                : 'Failed to analyze with Gemini API: Unknown error');
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

    static parseAnalysisResponse(response: string) {
        try {
            if (!response || typeof response !== 'string') {
                throw new Error('Invalid analysis response from Gemini API');
            }

            const sections = {
                summary: '',
                keyPoints: [] as string[],
                detailedAnalysis: '',
                recommendations: '',
                documentComparison: '',
            };

            const parts = response.split('\n\n');
            let currentSection = '';

            for (const part of parts) {
                const lowerPart = part.toLowerCase();

                if (lowerPart.includes('summary')) {
                    currentSection = 'summary';
                    sections.summary = part.split('\n').slice(1).join('\n');
                } else if (lowerPart.includes('key points')) {
                    currentSection = 'keyPoints';
                    sections.keyPoints = part
                        .split('\n')
                        .slice(1)
                        .filter(line => line.trim())
                        .map(point => point.replace(/^[•-]\s*/, ''));
                } else if (lowerPart.includes('detailed analysis')) {
                    currentSection = 'detailedAnalysis';
                    sections.detailedAnalysis = part.split('\n').slice(1).join('\n');
                } else if (lowerPart.includes('recommendations')) {
                    currentSection = 'recommendations';
                    sections.recommendations = part.split('\n').slice(1).join('\n');
                } else if (lowerPart.includes('comparison')) {
                    currentSection = 'documentComparison';
                    sections.documentComparison = part.split('\n').slice(1).join('\n');
                } else if (part.trim()) {
                    // Append to current section if it's a continuation
                    switch (currentSection) {
                        case 'summary':
                            sections.summary += '\n\n' + part;
                            break;
                        case 'detailedAnalysis':
                            sections.detailedAnalysis += '\n\n' + part;
                            break;
                        case 'recommendations':
                            sections.recommendations += '\n\n' + part;
                            break;
                        case 'documentComparison':
                            sections.documentComparison += '\n\n' + part;
                            break;
                    }
                }
            }

            // Ensure we have at least the mandatory sections
            if (!sections.summary || sections.keyPoints.length === 0 || !sections.detailedAnalysis || !sections.recommendations) {
                console.warn('Analysis response is missing required sections:', JSON.stringify(sections));
            }

            return sections;
        } catch (error) {
            console.error('Error parsing analysis response:', error);
            throw new Error(error instanceof Error
                ? `Failed to parse analysis: ${error.message}`
                : 'Failed to parse analysis: Unknown error');
        }
    }
}