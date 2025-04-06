export interface AnalysisData {
    title?: string;
    summary?: string;
    keyPoints?: string[];
    detailedAnalysis?: string;
    recommendations?: string[];
    documentComparison?: string;
    fileInfo?: Array<{
        filename: string;
        character_count: number;
        pages?: number;
        fileSize?: string;
    }>;
    [key: string]: any; // For any additional properties
} 