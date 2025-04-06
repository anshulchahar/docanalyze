import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';
import { useSession, signOut, signIn } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the DarkModeToggle component
jest.mock('@/components/DarkModeToggle', () => {
  return {
    __esModule: true,
    default: () => <button data-testid="dark-mode-toggle">Toggle Theme</button>,
  };
});

// Mock usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navbar with logo and brand name', () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Check for logo and brand name
    expect(screen.getByText('DocAnalyze')).toBeInTheDocument();
    
    // Check for dark mode toggle
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders sign in button when user is not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Check for sign in button
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  test('renders user info and sign out button when user is authenticated', () => {
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

    render(<Navbar />);
    
    // Check for user name
    expect(screen.getByText('Test User')).toBeInTheDocument();
    
    // Check for sign out button
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  test('calls signOut when sign out button is clicked', async () => {
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

    render(<Navbar />);
    
    // Click sign out button
    const signOutButton = screen.getByText('Sign out');
    await userEvent.click(signOutButton);
    
    // signOut should have been called
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  test('calls signIn when sign in button is clicked', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Click sign in button
    const signInButton = screen.getByText('Sign in');
    await userEvent.click(signInButton);
    
    // signIn should have been called with Google provider
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });

  test('toggles mobile menu when menu button is clicked', async () => {
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Mobile menu should initially be closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    
    // Find and click the mobile menu button
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    await userEvent.click(menuButton);
    
    // After clicking, the mobile navigation links should be visible
    const mobileLinks = screen.getAllByText('Home');
    expect(mobileLinks.length).toBe(2); // One for desktop, one for mobile
  });

  test('highlights active navigation link based on current path', () => {
    // Mock the usePathname hook to return a specific path
    const mockedUsePathname = jest.requireMock('next/navigation').usePathname;
    mockedUsePathname.mockReturnValue('/history');
    
    // Mock unauthenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Navbar />);
    
    // Find all nav links
    const navLinks = screen.getAllByText(/Home|History|About/);
    
    // History link should be marked as active
    const historyLink = screen.getByText('History').closest('a');
    expect(historyLink).toHaveClass('border-gold-500');
    
    // Other links should not be marked as active
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).not.toHaveClass('border-gold-500');
  });
});