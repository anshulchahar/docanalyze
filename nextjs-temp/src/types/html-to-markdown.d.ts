declare module 'html-to-markdown' {
    export default class HtmlToMarkdown {
        constructor(options?: any);
        convert(html: string): string;
    }
} 