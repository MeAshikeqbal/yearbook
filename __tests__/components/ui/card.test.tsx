import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<Card data-testid="test-card">Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('data-slot', 'card')
    })

    it('should apply custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content').parentElement
      expect(card).toHaveClass('custom-class')
    })

    it('should pass through other props', () => {
      render(<Card data-custom="value">Content</Card>)
      const card = screen.getByText('Content').parentElement
      expect(card).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('CardHeader', () => {
    it('should render card header with children', () => {
      render(<CardHeader>Header Content</CardHeader>)
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardHeader data-testid="test-header">Content</CardHeader>)
      const header = screen.getByTestId('test-header')
      expect(header).toHaveAttribute('data-slot', 'card-header')
    })

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Content</CardHeader>)
      const header = screen.getByText('Content')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('should render card title with children', () => {
      render(<CardTitle>Title Text</CardTitle>)
      expect(screen.getByText('Title Text')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardTitle data-testid="test-title">Title</CardTitle>)
      const title = screen.getByTestId('test-title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
    })

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('should render card description with children', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardDescription data-testid="test-desc">Description</CardDescription>)
      const desc = screen.getByTestId('test-desc')
      expect(desc).toHaveAttribute('data-slot', 'card-description')
    })

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>)
      const desc = screen.getByText('Description')
      expect(desc).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('should render card content with children', () => {
      render(<CardContent>Main content</CardContent>)
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardContent data-testid="test-content">Content</CardContent>)
      const content = screen.getByTestId('test-content')
      expect(content).toHaveAttribute('data-slot', 'card-content')
    })

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>)
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('should render card footer with children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardFooter data-testid="test-footer">Footer</CardFooter>)
      const footer = screen.getByTestId('test-footer')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
    })

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>)
      const footer = screen.getByText('Footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('CardAction', () => {
    it('should render card action with children', () => {
      render(<CardAction>Action content</CardAction>)
      expect(screen.getByText('Action content')).toBeInTheDocument()
    })

    it('should have correct data attribute', () => {
      render(<CardAction data-testid="test-action">Action</CardAction>)
      const action = screen.getByTestId('test-action')
      expect(action).toHaveAttribute('data-slot', 'card-action')
    })

    it('should apply custom className', () => {
      render(<CardAction className="custom-action">Action</CardAction>)
      const action = screen.getByText('Action')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('Composed Card', () => {
    it('should render a complete card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
            <CardAction>Action</CardAction>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })

    it('should work with partial composition', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
      )

      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.getByText('Content Only')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Card></Card>)
      expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
    })

    it('should handle complex nested content', () => {
      render(
        <Card>
          <CardContent>
            <div>
              <span>Nested</span>
              <div>Content</div>
            </div>
          </CardContent>
        </Card>
      )
      expect(screen.getByText('Nested')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      render(<CardTitle>{"< > & ' \""}</CardTitle>)
      expect(screen.getByText(/[<>&'"]/)).toBeInTheDocument()
    })
  })
})