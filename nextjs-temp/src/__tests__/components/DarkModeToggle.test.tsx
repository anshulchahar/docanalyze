import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DarkModeToggle from '@/components/DarkModeToggle';
import userEvent from '@testing-library/user-event';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to light mode
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the useLocalTheme hook
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} data-testid="motion-button" {...props}>
        {children}
      </button>
    ),
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    svg: ({ children, ...props }: any) => (
      <svg data-testid="motion-svg" {...props}>
        {children}
      </svg>
    ),
  },
}));

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  test('renders in light mode by default', () => {
    render(<DarkModeToggle />);
    
    // Initial mount - it should have aria-label containing current theme
    expect(screen.getByLabelText(/current theme: light/i)).toBeInTheDocument();
  });

  test('loads theme from localStorage if available', () => {
    // Set dark theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    render(<DarkModeToggle />);
    
    // Button should reflect dark theme
    expect(screen.getByLabelText(/current theme: dark/i)).toBeInTheDocument();
  });

  test('toggles theme when clicked', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle />);
    
    // Initial light theme
    const button = screen.getByLabelText(/current theme: light/i);

    // Click to toggle
    await user.click(button);
    
    // Should update localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Re-render to see updated state
    // In a real component, the state would update automatically
    // But for the test we need to simulate the re-render
    localStorageMock.getItem.mockReturnValueOnce('dark');
  });

  test('applies custom class name', () => {
    const customClass = 'my-custom-class';
    render(<DarkModeToggle className={customClass} />);
    
    // The custom class should be applied to the container
    const container = screen.getByLabelText(/current theme/i).closest('div');
    expect(container).toHaveClass(customClass);
  });
});