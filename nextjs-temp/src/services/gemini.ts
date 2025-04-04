import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYSIS_PROMPTS, ANALYSIS_OPTIONS } from '@/config/prompts';

export class GeminiService {
    private model: any;

    constructor() {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    }

    async analyzeDocuments(texts: string[]): Promise<string> {
        const prompt = texts.length > 1
            ? ANALYSIS_PROMPTS.MULTIPLE_DOCUMENTS
            : ANALYSIS_PROMPTS.SINGLE_DOCUMENT;

        const combinedText = texts.map((text, index) =>
            `Document ${index + 1}:\n${text}`
        ).join('\n\n');

        const result = await this.model.generateContent({
            contents: [{ text: prompt.replace('{text}', combinedText) }],
            generationConfig: {
                temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                topP: ANALYSIS_OPTIONS.TOP_P,
                maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
            },
            safetySettings: Object.entries(ANALYSIS_OPTIONS.SAFETY_SETTINGS).map(
                ([category, threshold]) => ({
                    category,
                    threshold,
                })
            ),
        });

        return result.response.text();
    }

    async extractMetadata(text: string): Promise<string> {
        const prompt = ANALYSIS_PROMPTS.EXTRACT_METADATA;

        const result = await this.model.generateContent({
            contents: [{ text: prompt.replace('{text}', text) }],
            generationConfig: {
                temperature: ANALYSIS_OPTIONS.TEMPERATURE,
                topP: ANALYSIS_OPTIONS.TOP_P,
                maxOutputTokens: ANALYSIS_OPTIONS.MAX_OUTPUT_TOKENS,
            },
        });

        return result.response.text();
    }

    static parseAnalysisResponse(response: string) {
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

        return sections;
    }
}