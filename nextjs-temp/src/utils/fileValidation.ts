import { FILE_CONSTRAINTS, ERROR_MESSAGES } from '@/constants/api';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateFile(file: File): ValidationResult {
    // Check file size
    if (file.size > FILE_CONSTRAINTS.MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.FILE_TOO_LARGE,
        };
    }

    // Check file type
    if (!file.type.match(/application\/pdf/)) {
        return {
            isValid: false,
            error: ERROR_MESSAGES.INVALID_FILE_TYPE,
        };
    }

    return { isValid: true };
}

export function validateFiles(files: File[]): ValidationResult {
    for (const file of files) {
        const result = validateFile(file);
        if (!result.isValid) {
            return result;
        }
    }

    return { isValid: true };
}