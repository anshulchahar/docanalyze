import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';

// Create a test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-btn">Toggle Theme</button>
      <button onClick={() => setTheme('light')} data-testid="set-light-btn">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark-btn">Set Dark</button>
    </div>
  );
};

// Wrap test component in ThemeProvider
const TestWrapper = () => (
  <ThemeProvider>
    <TestComponent />
  </ThemeProvider>
);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Reset document classes
    document.documentElement.classList.remove('dark', 'light-theme', 'dark-theme', 'theme-transition');
  });

  test('provides default light theme when no localStorage value exists', () => {
    render(<TestWrapper />);
    
    // Theme should default to light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // localStorage should be checked 
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  test('loads theme from localStorage on mount', () => {
    // Set theme in localStorage
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    render(<TestWrapper />);
    
    // Theme should be loaded from localStorage
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
  });

  test('toggles the theme when toggle function is called', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    
    // Initial theme should be light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // Click toggle button
    await user.click(screen.getByTestId('toggle-btn'));
    
    // Theme should switch to dark
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Click toggle button again
    await user.click(screen.getByTestId('toggle-btn'));
    
    // Theme should switch back to light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // localStorage should be updated again
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('sets the theme directly when setTheme function is called', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    
    // Initial theme should be light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // Click set dark button
    await user.click(screen.getByTestId('set-dark-btn'));
    
    // Theme should be dark
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Click set light button
    await user.click(screen.getByTestId('set-light-btn'));
    
    // Theme should be light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // localStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('applies appropriate CSS classes to document when theme changes', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);
    
    // Initial theme should be light - check DOM classes
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    
    // Change to dark theme
    await user.click(screen.getByTestId('set-dark-btn'));
    
    // Check dark theme classes
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });

  test('handles errors gracefully when localStorage is not available', () => {
    // Mock console.error to avoid test output noise
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Make localStorage.getItem throw an error
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage is not available');
    });
    
    // Should not throw an error when rendering
    expect(() => render(<TestWrapper />)).not.toThrow();
    
    // Theme should default to light
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    
    // Should log the error
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });
});