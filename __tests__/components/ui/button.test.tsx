import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, buttonVariants } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should render with children components', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'default')
    })

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'destructive')
    })

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'outline')
    })

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'secondary')
    })

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })

    it('should apply link variant classes', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'link')
    })
  })

  describe('Sizes', () => {
    it('should apply default size classes', () => {
      render(<Button>Default Size</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'default')
    })

    it('should apply sm size classes', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'sm')
    })

    it('should apply lg size classes', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('should apply icon size classes', () => {
      render(<Button size="icon">I</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'icon')
    })

    it('should apply icon-sm size classes', () => {
      render(<Button size="icon-sm">I</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'icon-sm')
    })

    it('should apply icon-lg size classes', () => {
      render(<Button size="icon-lg">I</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'icon-lg')
    })
  })

  describe('Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      render(<Button onClick={handleClick} disabled>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should be keyboard accessible', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()
      render(<Button onClick={handleClick}>Press me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('Props and Attributes', () => {
    it('should pass through custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should apply disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should support aria attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label')
    })

    it('should support data attributes', () => {
      render(<Button data-testid="test-button">Button</Button>)
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
    })
  })

  describe('buttonVariants function', () => {
    it('should generate correct classes for default variant and size', () => {
      const classes = buttonVariants()
      expect(classes).toContain('inline-flex')
      expect(classes).toContain('items-center')
      expect(classes).toContain('justify-center')
    })

    it('should generate correct classes for custom variant', () => {
      const classes = buttonVariants({ variant: 'destructive' })
      expect(classes).toContain('bg-destructive')
    })

    it('should generate correct classes for custom size', () => {
      const classes = buttonVariants({ size: 'lg' })
      expect(classes).toContain('h-10')
    })

    it('should merge custom className', () => {
      const classes = buttonVariants({ className: 'my-custom-class' })
      expect(classes).toContain('my-custom-class')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      render(<Button></Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000)
      render(<Button>{longText}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent(longText)
    })

    it('should handle special characters in text', () => {
      render(<Button>{"< > & ' \""}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle SVG icons', () => {
      render(
        <Button>
          <svg data-testid="icon" />
          Text
        </Button>
      )
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })
  })
})