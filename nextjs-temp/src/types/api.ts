export interface FileInfo {
    filename: string;
    character_count: number;
}

export interface AnalysisResult {
    summary: string;
    keyPoints: string[];
    detailedAnalysis: string;
    recommendations: string;
    documentComparison?: string;
    fileInfo: FileInfo[];
}

export interface AnalysisHistory {
    id: string;
    filename: string;
    summary: string;
    createdAt: string;
}

export interface ApiError {
    error: string;
}

export type ApiResponse<T> = T | ApiError;

// API endpoint response types
export type AnalyzeResponse = ApiResponse<AnalysisResult>;
export type HistoryResponse = ApiResponse<AnalysisHistory[]>;
export type AnalysisDetailsResponse = ApiResponse<AnalysisResult>;