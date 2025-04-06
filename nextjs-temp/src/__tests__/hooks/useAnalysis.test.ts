import { renderHook, act } from '@testing-library/react';
import { useAnalysis } from '@/hooks/useAnalysis';

// Mock fetch globally
global.fetch = jest.fn();

describe('useAnalysis Hook', () => {
    // Setup mock file
    const createTestFile = (name: string, size: number, type: string): File => {
        const file = new File(['test content'], name, { type });
        Object.defineProperty(file, 'size', { get: () => size });
        return file;
    };

    const mockFile1 = createTestFile('test1.pdf', 1024, 'application/pdf');
    const mockFile2 = createTestFile('test2.pdf', 2048, 'application/pdf');

    // Mock analysis response data
    const mockAnalysisResponse = {
        summary: 'This is a test summary',
        keyPoints: ['Point 1', 'Point 2'],
        detailedAnalysis: 'Detailed test analysis',
        recommendations: 'Test recommendations',
        fileInfo: [
            { filename: 'test1.pdf', character_count: 100 },
            { filename: 'test2.pdf', character_count: 200 }
        ]
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.resetAllMocks();
    });

    it('initializes with empty state', () => {
        const { result } = renderHook(() => useAnalysis());

        expect(result.current.files).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
        expect(result.current.analysis).toBe(null);
        expect(result.current.progress).toBe(0);
    });

    it('adds files correctly', () => {
        const { result } = renderHook(() => useAnalysis());

        act(() => {
            result.current.addFiles([mockFile1]);
        });

        expect(result.current.files).toEqual([mockFile1]);

        act(() => {
            result.current.addFiles([mockFile2]);
        });

        expect(result.current.files).toEqual([mockFile1, mockFile2]);
    });

    it('removes files correctly', () => {
        const { result } = renderHook(() => useAnalysis());

        act(() => {
            result.current.addFiles([mockFile1, mockFile2]);
        });

        expect(result.current.files.length).toBe(2);

        act(() => {
            result.current.removeFile(0);
        });

        expect(result.current.files).toEqual([mockFile2]);
    });

    it('clears all files', () => {
        const { result } = renderHook(() => useAnalysis());

        act(() => {
            result.current.addFiles([mockFile1, mockFile2]);
        });

        expect(result.current.files.length).toBe(2);

        act(() => {
            result.current.clearFiles();
        });

        expect(result.current.files).toEqual([]);
    });

    it('shows error when analyzing without files', async () => {
        const { result } = renderHook(() => useAnalysis());

        await act(async () => {
            await result.current.analyze();
        });

        expect(result.current.error).toBe('Please select at least one PDF file');
        expect(result.current.loading).toBe(false);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('successfully analyzes files', async () => {
        // Mock successful fetch response
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            headers: {
                get: () => 'application/json'
            },
            json: () => Promise.resolve(mockAnalysisResponse)
        });

        const { result } = renderHook(() => useAnalysis());

        // Add files first
        act(() => {
            result.current.addFiles([mockFile1, mockFile2]);
        });

        // Trigger analysis
        await act(async () => {
            await result.current.analyze();
        });

        // Verify state after successful analysis
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('');
        expect(result.current.analysis).toEqual(mockAnalysisResponse);
        expect(result.current.progress).toBe(100);

        // Verify fetch was called with correct params
        expect(fetch).toHaveBeenCalledWith('/api/analyze', {
            method: 'POST',
            body: expect.any(FormData)
        });
    });

    it('handles API error response', async () => {
        // Mock error response
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            headers: {
                get: () => 'application/json'
            },
            json: () => Promise.resolve({ error: 'API error message' })
        });

        const { result } = renderHook(() => useAnalysis());

        // Add files
        act(() => {
            result.current.addFiles([mockFile1]);
        });

        // Trigger analysis
        await act(async () => {
            await result.current.analyze();
        });

        // Verify error state
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('API error message');
        expect(result.current.analysis).toBe(null);
    });

    it('handles non-JSON API response', async () => {
        // Mock non-JSON response
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            headers: {
                get: () => 'text/html'
            },
            text: () => Promise.resolve('<html>Error page</html>')
        });

        const { result } = renderHook(() => useAnalysis());

        // Add files
        act(() => {
            result.current.addFiles([mockFile1]);
        });

        // Trigger analysis
        await act(async () => {
            await result.current.analyze();
        });

        // Verify error state
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Server returned an invalid response format');
        expect(result.current.analysis).toBe(null);
    });

    it('handles network errors', async () => {
        // Mock network error
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));

        const { result } = renderHook(() => useAnalysis());

        // Add files
        act(() => {
            result.current.addFiles([mockFile1]);
        });

        // Trigger analysis
        await act(async () => {
            await result.current.analyze();
        });

        // Verify error state
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe('Network failed');
        expect(result.current.analysis).toBe(null);
    });
});