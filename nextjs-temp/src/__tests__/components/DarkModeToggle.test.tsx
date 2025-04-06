import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DarkModeToggle from '@/components/DarkModeToggle';

// Mock localStorage
let localStorageMock = {};

beforeEach(() => {
  // Clear mock storage before each test
  localStorageMock = {};
  
  // Mock implementation for localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(key => localStorageMock[key] || null),
      setItem: jest.fn((key, value) => {
        localStorageMock[key] = value;
      }),
    },
    writable: true
  });

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

  // Mock document.documentElement manipulation
  document.documentElement.classList.toggle = jest.fn();
});

describe('DarkModeToggle Component', () => {
  it('renders without crashing', () => {
    render(<DarkModeToggle />);
    // Component should mount and render
    expect(document.querySelector('button')).toBeInTheDocument();
  });

  it('initially shows light mode icon when localStorage is empty', () => {
    render(<DarkModeToggle />);
    
    // Trigger useEffect to complete
    act(() => {
      jest.runAllTimers();
    });
    
    // It should start with light mode by default with our mocks
    expect(screen.getByLabelText(/Current theme: light/i)).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    render(<DarkModeToggle />);
    
    // Get the toggle button
    const toggleButton = screen.getByRole('button');
    
    // Click to toggle from light to dark
    fireEvent.click(toggleButton);
    
    // Check that localStorage was updated correctly
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('loads theme from localStorage on mount', () => {
    // Set initial theme in localStorage mock
    localStorageMock = { theme: 'dark' };
    
    render(<DarkModeToggle />);
    
    // Wait for useEffect to complete
    act(() => {
      jest.runAllTimers();
    });
    
    // It should have applied the dark theme from localStorage
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
  });

  it('shows tooltip on hover', async () => {
    render(<DarkModeToggle />);
    
    const button = screen.getByRole('button');
    
    // Simulate hover
    fireEvent.mouseEnter(button);
    
    // Wait for the tooltip to appear
    const tooltip = await screen.findByText(/Light mode/i);
    expect(tooltip).toBeInTheDocument();
    
    // Simulate mouse leave
    fireEvent.mouseLeave(button);
  });
});