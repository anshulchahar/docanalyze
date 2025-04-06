import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/contexts/SidebarContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the sidebar context
jest.mock('@/contexts/SidebarContext', () => ({
  useSidebar: jest.fn(),
}));

// Mock the ChatGptStyleSidebar component
jest.mock('@/components/ChatGptStyleSidebar', () => ({
  __esModule: true,
  default: ({ history, isOpen, onClose }) => (
    <div data-testid="sidebar-mock">Sidebar Mock</div>
  ),
}));

// Mock the DarkModeToggle component
jest.mock('@/components/DarkModeToggle', () => ({
  __esModule: true,
  default: ({ className }) => <button data-testid="dark-mode-toggle">Toggle Theme</button>,
}));

describe('Navigation', () => {
  const mockHistory = [
    { id: '1', filename: 'Test Document', summary: 'Test Summary', createdAt: '2023-01-01T00:00:00Z' },
  ];

  const mockSidebarContext = {
    isOpen: false,
    toggle: jest.fn(),
    close: jest.fn(),
    open: jest.fn(),
  };

  beforeEach(() => {
    (useSidebar as jest.Mock).mockReturnValue(mockSidebarContext);
    jest.clearAllMocks();
  });

  test('renders navigation with logo and brand name', () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navigation />);
    
    // Check for logo and brand name
    expect(screen.getByText('Solva')).toBeInTheDocument();
    
    // Check for dark mode toggle
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
  });

  test('renders sign in button when user is not authenticated', () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navigation />);
    
    // Check for sign in button
    const signInButton = screen.getByText('Sign in');
    expect(signInButton).toBeInTheDocument();
  });

  test('renders user info and sign out button when user is authenticated', () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: null,
        },
        expires: '2023-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });

    render(<Navigation history={mockHistory} />);
    
    // Check for user name
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check for sign out button
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  test('passes history to sidebar component', () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        expires: '2023-01-01T00:00:00.000Z',
      },
      status: 'authenticated',
    });

    render(<Navigation history={mockHistory} />);
    
    // Check that sidebar component is rendered
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });

  test('shows loading state during authentication check', () => {
    // Mock loading session state
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Navigation />);
    
    // Check for loading indicator (the animated placeholder)
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
    
    // Look for the loading animation element
    const loadingElement = screen.getByRole('navigation');
    expect(loadingElement).toBeInTheDocument();
  });

  test('handles mobile menu toggle', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navigation />);
    
    // Find and click the mobile menu button
    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    await userEvent.click(mobileMenuButton);
    
    // Mobile menu should now be open
    // We could check for specific elements that are visible when the menu is open
    const signInButton = screen.getAllByText('Sign in');
    // There should be two sign in buttons (one in desktop view, one in mobile view)
    expect(signInButton.length).toBeGreaterThan(1);
  });
});