import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface AnalysisData {
    summary: string;
    keyPoints: string[];
    detailedAnalysis: string;
    recommendations: string;
    documentComparison?: string;
    fileInfo: Array<{
        filename: string;
        character_count: number;
        pages?: number;
        fileSize?: string;
    }>;
}

export async function exportToPDF(analysis: AnalysisData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();
    const margin = 50;
    let y = height - margin;
    const lineHeight = 15;

    // Helper function to add text and manage pagination
    const addText = async (text: string, isBold = false, indent = 0) => {
        // Use manual text wrapping instead of font.split
        const maxCharsPerLine = Math.floor((width - (margin * 2) - indent) / 7); // Rough estimate
        const words = text.split(' ');
        let currentLine = '';

        for (const word of words) {
            if ((currentLine + word).length > maxCharsPerLine) {
                if (y < margin + lineHeight) {
                    y = height - margin;
                    currentPage = pdfDoc.addPage();
                }

                currentPage.drawText(currentLine, {
                    x: margin + indent,
                    y,
                    font: isBold ? boldFont : font,
                    size: 12,
                    color: rgb(0, 0, 0),
                });

                y -= lineHeight;
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        }

        if (currentLine.trim().length > 0) {
            if (y < margin + lineHeight) {
                y = height - margin;
                currentPage = pdfDoc.addPage();
            }

            currentPage.drawText(currentLine.trim(), {
                x: margin + indent,
                y,
                font: isBold ? boldFont : font,
                size: 12,
                color: rgb(0, 0, 0),
            });

            y -= lineHeight;
        }

        y -= lineHeight; // Add space after paragraph
    };

    // Title
    await addText('Document Analysis Report', true);
    y -= lineHeight;

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

export function exportToMarkdown(analysis: AnalysisData): string {
    return `# Document Analysis Report

## Files Analyzed
${analysis.fileInfo.map(file => `- ${file.filename} (${file.character_count.toLocaleString()} characters)`).join('\n')}

## Executive Summary
${analysis.summary}

## Key Points
${analysis.keyPoints.map(point => `- ${point}`).join('\n')}

${analysis.documentComparison ? `## Document Comparison
${analysis.documentComparison}

` : ''}## Detailed Analysis
${analysis.detailedAnalysis}

## Recommendations
${analysis.recommendations}`;
}

export function downloadFile(content: string | Uint8Array, filename: string, type: string) {
    const blob = content instanceof Uint8Array
        ? new Blob([content], { type })
        : new Blob([content], { type });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}