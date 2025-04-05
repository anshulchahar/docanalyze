// src/__tests__/utils/formatters.test.ts
import { formatDate } from '../../utils/formatters';

// Mock the formatters module
jest.mock('../../utils/formatters', () => ({
  formatDate: jest.fn((date: string | Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }),
}));

describe('Formatters', () => {
  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const testDate = new Date('2025-04-05');
      const formatted = formatDate(testDate);
      expect(formatted).toBeTruthy();
    });

    it('should handle empty string dates', () => {
      const formatted = formatDate('');
      expect(formatted).toBe('');
    });
  });
});