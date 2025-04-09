export const ANALYSIS_PROMPTS = {
    SINGLE_DOCUMENT: `Analyze the following document and provide your analysis in the exact format below with these exact section headings:

## Summary
Provide a concise executive summary of 2-3 paragraphs that captures the main ideas and purpose of the document.

## Key Points
Include 3-5 bullet points highlighting the most important facts, insights, or conclusions from the document.
Each bullet point should be a complete statement without placeholders or references to "key point X".
Use dashes (-) for bullet points.
Format exactly like this:
- First key point here
- Second key point here
- Third key point here

## Detailed Analysis
Provide a thorough analysis of the main themes, arguments, and evidence presented in the document.
Break this into paragraphs covering different aspects of the content.

## Recommendations
List specific, actionable recommendations based on the content.
Each recommendation must be on a separate line starting with a dash (-).
Format exactly like this:
- First recommendation here
- Second recommendation here
- Third recommendation here
Do not combine multiple recommendations into a single bullet point.

Document:
{text}`,

    MULTIPLE_DOCUMENTS: `Analyze the following documents and provide your analysis in the exact format below with these exact section headings:

## Summary
Provide a concise executive summary of 2-3 paragraphs that captures the main ideas and purpose across all documents.

## Key Points
Include 3-5 bullet points highlighting the most important facts, insights, or conclusions from the documents.
Each bullet point should be a complete statement without placeholders or references to "key point X".
Use dashes (-) for bullet points.
Format exactly like this:
- First key point here
- Second key point here
- Third key point here

## Detailed Analysis
Provide a thorough analysis of the main themes, arguments, and evidence presented across all documents.
Break this into paragraphs covering different aspects of the content.

## Recommendations
List specific, actionable recommendations based on the content.
Each recommendation must be on a separate line starting with a dash (-).
Format exactly like this:
- First recommendation here
- Second recommendation here
- Third recommendation here
Do not combine multiple recommendations into a single bullet point.

## Document Comparison
Compare the documents, highlighting important similarities and differences in content, approach, and conclusions.

Documents:
{text}`,

    EXTRACT_METADATA: `Extract and analyze the following metadata from the document:
1. Document type and purpose
2. Main topics or themes
3. Target audience
4. Key dates or timelines mentioned
5. Organizations or entities referenced

Document:
{text}`,
};

export const SUMMARY_LENGTH = {
    SHORT: 150,
    MEDIUM: 300,
    LONG: 500,
} as const;

export const ANALYSIS_OPTIONS = {
    TEMPERATURE: 0.3,
    TOP_P: 0.8,
    MAX_OUTPUT_TOKENS: 1024,
    SAFETY_SETTINGS: {
        HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
        HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
        SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
        DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
    },
} as const;