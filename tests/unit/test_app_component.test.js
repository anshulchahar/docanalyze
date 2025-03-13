import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import your component
// Note: You may need to adjust your app.js to properly export components for testing
import { App, Window, ModemAnimation, FileList } from '../../static/js/app';

describe('ModemAnimation Component', () => {
    test('renders with active class when active prop is true', () => {
        const { container } = render(<ModemAnimation active={true} />);
        const lights = container.querySelectorAll('.modem-light.active');
        expect(lights.length).toBe(4);
    });

    test('renders without active class when active prop is false', () => {
        const { container } = render(<ModemAnimation active={false} />);
        const lights = container.querySelectorAll('.modem-light.active');
        expect(lights.length).toBe(0);
    });
});

describe('Window Component', () => {
    test('renders with correct title', () => {
        render(<Window title="Test Window">Content</Window>);
        expect(screen.getByText('Test Window')).toBeInTheDocument();
    });

    test('renders children content', () => {
        render(<Window title="Test Window"><div>Test Content</div></Window>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
});

describe('FileList Component', () => {
    test('renders nothing when files array is empty', () => {
        const { container } = render(<FileList files={[]} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders list of files with names and sizes', () => {
        const files = [
            { name: 'document1.pdf', size: 1024 },
            { name: 'document2.pdf', size: 2048 }
        ];

        render(<FileList files={files} />);

        expect(screen.getByText('2 FILES SELECTED:')).toBeInTheDocument();
        expect(screen.getByText('document1.pdf')).toBeInTheDocument();
        expect(screen.getByText('document2.pdf')).toBeInTheDocument();
        expect(screen.getByText('(1 KB)')).toBeInTheDocument();
        expect(screen.getByText('(2 KB)')).toBeInTheDocument();
    });
});

describe('App Component', () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    summary: "Test summary",
                    keyPoints: "Test key points",
                    detailedAnalysis: "Test analysis",
                    recommendations: "Test recommendations"
                })
            })
        );

        // Mock Audio
        global.Audio = jest.fn(() => ({
            play: jest.fn().mockResolvedValue()
        }));
    });

    test('renders the app title', () => {
        render(<App />);
        expect(screen.getByText("<< 90's PDF ANALYZER >>")).toBeInTheDocument();
    });

    test('displays error when form is submitted without files', async () => {
        render(<App />);
        const button = screen.getByText('ANALYZE NOW!');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('ERROR:')).toBeInTheDocument();
            expect(screen.getByText('Please select a PDF file')).toBeInTheDocument();
        });
    });

    test('displays error when form is submitted without API key', async () => {
        // Create a mock file
        const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });

        render(<App />);

        // Set the file input
        const fileInput = screen.getByLabelText('SELECT YOUR PDF FILE:');
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });
        fireEvent.change(fileInput);

        // Submit the form
        const button = screen.getByText('ANALYZE NOW!');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('ERROR:')).toBeInTheDocument();
            expect(screen.getByText('Please enter your API key')).toBeInTheDocument();
        });
    });

    // More tests would be added for form submission with valid inputs,
    // API responses, loading states, and rendering results
});