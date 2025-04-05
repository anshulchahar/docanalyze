export const ANALYSIS_PROMPTS = {
    SINGLE_DOCUMENT: `Analyze the following document and provide your analysis in the exact format below with these exact section headings:

## Summary
Write a concise executive summary (2-3 paragraphs)

## Key Points
- Key point 1
- Key point 2
- Add more bullet points as needed

## Detailed Analysis
Provide a detailed analysis of the main themes and arguments

## Recommendations
List specific, actionable recommendations based on the content

Document:
{text}`,

    MULTIPLE_DOCUMENTS: `Analyze the following documents and provide your analysis in the exact format below with these exact section headings:

## Summary
Write a concise executive summary (2-3 paragraphs)

## Key Points
- Key point 1
- Key point 2
- Add more bullet points as needed

## Detailed Analysis
Provide a detailed analysis of the main themes and arguments

## Recommendations
List specific, actionable recommendations based on the content

## Document Comparison
Compare the documents, highlighting similarities and differences

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
} as const;

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