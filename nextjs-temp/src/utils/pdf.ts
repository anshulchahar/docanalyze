import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPdf(file: ArrayBuffer): Promise<string> {
    try {
        const pdfDoc = await PDFDocument.load(file);
        const pages = pdfDoc.getPages();
        let text = '';

        for (const page of pages) {
            const content = await page.getText();
            text += content + '\n';
        }

        return text;
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