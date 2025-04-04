import { PDFDocument } from 'pdf-lib';
import { validateFile } from '@/utils/fileValidation';
import { ERROR_MESSAGES } from '@/constants/api';

export class PDFService {
    static async extractText(file: ArrayBuffer): Promise<string> {
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

    static async validateAndProcessFiles(files: File[]): Promise<{ text: string; info: { filename: string; character_count: number; } }[]> {
        const results = [];

        for (const file of files) {
            const validation = validateFile(file);
            if (!validation.isValid) {
                throw new Error(`${file.name}: ${validation.error}`);
            }

            const buffer = await file.arrayBuffer();
            const text = await this.extractText(buffer);

            if (!text.trim()) {
                throw new Error(`${file.name}: No text content found in PDF`);
            }

            results.push({
                text,
                info: {
                    filename: file.name,
                    character_count: text.length,
                },
            });
        }

        return results;
    }

    static async getPageCount(buffer: ArrayBuffer): Promise<number> {
        try {
            const pdfDoc = await PDFDocument.load(buffer);
            return pdfDoc.getPageCount();
        } catch (error) {
            console.error('Error getting page count:', error);
            throw new Error('Failed to get PDF page count');
        }
    }

    static async createAnalysisReport(analysis: {
        summary: string;
        keyPoints: string[];
        detailedAnalysis: string;
        recommendations: string;
        documentComparison?: string;
        fileInfo: Array<{ filename: string; character_count: number }>;
    }): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.create();
        const helvetica = await pdfDoc.embedFont('Helvetica');
        const helveticaBold = await pdfDoc.embedFont('Helvetica-Bold');

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 50;
        let y = height - margin;
        const lineHeight = 15;

        const addText = async (text: string, isBold = false, indent = 0) => {
            const font = isBold ? helveticaBold : helvetica;
            const lines = text.split('\n');

            for (const line of lines) {
                if (y < margin + lineHeight) {
                    page = pdfDoc.addPage();
                    y = height - margin;
                }

                page.drawText(line, {
                    x: margin + indent,
                    y,
                    font,
                    size: 12,
                });

                y -= lineHeight;
            }

            y -= lineHeight; // Add space after paragraph
        };

        // Title
        await addText('Document Analysis Report', true);
        y -= lineHeight * 2;

        // Files Analyzed
        await addText('Files Analyzed:', true);
        for (const file of analysis.fileInfo) {
            await addText(`• ${file.filename} (${file.character_count.toLocaleString()} characters)`, false, 20);
        }
        y -= lineHeight;

        // Summary
        await addText('Executive Summary:', true);
        await addText(analysis.summary);
        y -= lineHeight;

        // Key Points
        await addText('Key Points:', true);
        for (const point of analysis.keyPoints) {
            await addText(`• ${point}`, false, 20);
        }
        y -= lineHeight;

        // Document Comparison (if available)
        if (analysis.documentComparison) {
            await addText('Document Comparison:', true);
            await addText(analysis.documentComparison);
            y -= lineHeight;
        }

        // Detailed Analysis
        await addText('Detailed Analysis:', true);
        await addText(analysis.detailedAnalysis);
        y -= lineHeight;

        // Recommendations
        await addText('Recommendations:', true);
        await addText(analysis.recommendations);

        return pdfDoc.save();
    }
}