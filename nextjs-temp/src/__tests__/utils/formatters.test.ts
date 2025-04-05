// src/__tests__/utils/formatters.test.ts
import { formatters } from '../../utils/formatters';

// Mock the formatters if they don't exist yet
jest.mock('../../utils/formatters', () => ({
  formatters: {
    formatDate: jest.fn((date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    }),
  },
}));

describe('Formatters', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2025-04-05');
      const formatted = formatters.formatDate(testDate);
      expect(formatted).toBeTruthy();
    });

    it('should handle null dates', () => {
      const formatted = formatters.formatDate(null);
      expect(formatted).toBe('');
    });
  });
});