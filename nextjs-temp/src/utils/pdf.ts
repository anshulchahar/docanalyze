import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(file: ArrayBuffer): Promise<string> {
    try {
        // Use pdf-parse for text extraction instead of pdf-lib
        const dataBuffer = Buffer.from(file);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function getPageCount(file: ArrayBuffer): Promise<number> {
    try {
        const pdfDoc = await PDFDocument.load(file);
        return pdfDoc.getPageCount();
    } catch (error) {
        console.error('Error getting page count:', error);
        throw new Error('Failed to get PDF page count');
    }
}

export async function validatePdf(file: ArrayBuffer): Promise<boolean> {
    try {
        await PDFDocument.load(file);
        return true;
    } catch {
        return false;
    }
}