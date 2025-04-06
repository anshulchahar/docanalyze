declare module 'html-to-markdown' {
    export interface HtmlToMarkdownOptions {
        headingStyle?: 'setext' | 'atx';
        bulletListMarker?: '-' | '+' | '*';
        codeBlockStyle?: 'indented' | 'fenced';
        fence?: '```' | '~~~';
        emDelimiter?: '_' | '*';
        strongDelimiter?: '__' | '**';
        linkStyle?: 'inlined' | 'referenced';
        linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
        [key: string]: string | undefined;
    }

    export default class HtmlToMarkdown {
        constructor(options?: HtmlToMarkdownOptions);
        convert(html: string): string;
    }
} 