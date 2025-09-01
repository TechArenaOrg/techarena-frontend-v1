import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="destructive">Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-destructive');
    
    rerender(<Button variant="outline">Button</Button>);
    expect(button).toHaveClass('border-input');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('h-9');
    
    rerender(<Button size="lg">Button</Button>);
    expect(button).toHaveClass('h-11');
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('forwards refs correctly', () => {
    const ref = jest.fn();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref).toHaveBeenCalled();
  });

  it('merges custom className with default classes', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('inline-flex'); // Default class
  });
});