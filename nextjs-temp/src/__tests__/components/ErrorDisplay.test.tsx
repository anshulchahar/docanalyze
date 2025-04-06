import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorDisplay from '@/components/ErrorDisplay';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...rest }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

describe('ErrorDisplay Component', () => {
  it('renders error message correctly', () => {
    render(<ErrorDisplay message="An error occurred" />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('renders error details when provided', () => {
    render(
      <ErrorDisplay 
        message="An error occurred" 
        details="Please try again later" 
      />
    );
    expect(screen.getByText('Please try again later')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(
      <ErrorDisplay 
        message="An error occurred" 
        onDismiss={onDismiss} 
      />
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    render(<ErrorDisplay message="An error occurred" />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('applies fullScreen class when fullScreen prop is true', () => {
    const { container } = render(
      <ErrorDisplay 
        message="An error occurred" 
        fullScreen={true} 
      />
    );
    
    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass('fixed');
    expect(errorContainer).toHaveClass('inset-0');
  });

  it('renders action link when action with href is provided', () => {
    render(
      <ErrorDisplay 
        message="An error occurred" 
        action={{ 
          label: 'Retry', 
          href: '/retry' 
        }} 
      />
    );
    
    const actionLink = screen.getByText('Retry');
    expect(actionLink.tagName.toLowerCase()).toBe('a');
    expect(actionLink).toHaveAttribute('href', '/retry');
  });

  it('renders action button when action with onClick is provided', () => {
    const onClick = jest.fn();
    render(
      <ErrorDisplay 
        message="An error occurred" 
        action={{ 
          label: 'Retry', 
          href: '#',
          onClick: onClick
        }} 
      />
    );
    
    const actionButton = screen.getByText('Retry');
    expect(actionButton.tagName.toLowerCase()).toBe('button');
    
    fireEvent.click(actionButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ErrorDisplay 
        message="An error occurred" 
        className="custom-class"
      />
    );
    
    const errorContainer = container.firstChild;
    expect(errorContainer).toHaveClass('custom-class');
  });
});