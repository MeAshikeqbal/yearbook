import React from 'react'
import { render, screen } from '@testing-library/react'
import { FlipbookCTA } from '@/components/flipbook-cta'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Sparkles: () => <span data-testid="sparkles-icon">Sparkles</span>,
}))

describe('FlipbookCTA', () => {
  describe('Rendering', () => {
    it('should render the section', () => {
      const { container } = render(<FlipbookCTA />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should render New Feature badge', () => {
      render(<FlipbookCTA />)
      expect(screen.getByText('New Feature')).toBeInTheDocument()
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    })

    it('should render main heading', () => {
      render(<FlipbookCTA />)
      expect(screen.getByRole('heading', { name: /experience it like a real yearbook/i })).toBeInTheDocument()
    })

    it('should render description text', () => {
      render(<FlipbookCTA />)
      expect(screen.getByText(/turn pages, relive memories, and explore profiles/i)).toBeInTheDocument()
    })

    it('should render CTA button', () => {
      render(<FlipbookCTA />)
      const button = screen.getByRole('link', { name: /view flipbook preview/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('href', '/flipbook')
    })
  })

  describe('Badge Styling', () => {
    it('should have accent background for badge', () => {
      const { container } = render(<FlipbookCTA />)
      const badge = screen.getByText('New Feature').parentElement
      expect(badge).toHaveClass('bg-accent')
      expect(badge).toHaveClass('text-accent-foreground')
    })

    it('should have rounded pill shape for badge', () => {
      const { container } = render(<FlipbookCTA />)
      const badge = screen.getByText('New Feature').parentElement
      expect(badge).toHaveClass('rounded-full')
    })

    it('should have sparkles icon in badge', () => {
      render(<FlipbookCTA />)
      const badge = screen.getByText('New Feature').parentElement
      expect(badge).toContainElement(screen.getByTestId('sparkles-icon'))
    })
  })

  describe('Card Styling', () => {
    it('should have gradient background', () => {
      const { container } = render(<FlipbookCTA />)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('bg-linear-to-br')
      expect(card).toHaveClass('from-secondary')
    })

    it('should have no border', () => {
      const { container } = render(<FlipbookCTA />)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('border-0')
    })

    it('should have overflow hidden', () => {
      const { container } = render(<FlipbookCTA />)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('overflow-hidden')
    })

    it('should be positioned relative', () => {
      const { container } = render(<FlipbookCTA />)
      const card = container.querySelector('[data-slot="card"]')
      expect(card).toHaveClass('relative')
    })
  })

  describe('Decorative Elements', () => {
    it('should render decorative background blurs', () => {
      const { container } = render(<FlipbookCTA />)
      const blurElements = container.querySelectorAll('.blur-3xl')
      expect(blurElements.length).toBe(2)
    })

    it('should have top-right decorative element', () => {
      const { container } = render(<FlipbookCTA />)
      const topRight = container.querySelector('.top-0.right-0')
      expect(topRight).toBeInTheDocument()
    })

    it('should have bottom-left decorative element', () => {
      const { container } = render(<FlipbookCTA />)
      const bottomLeft = container.querySelector('.bottom-0.left-0')
      expect(bottomLeft).toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('should have ghost variant', () => {
      render(<FlipbookCTA />)
      const button = screen.getByRole('link', { name: /view flipbook preview/i })
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })

    it('should have large size', () => {
      render(<FlipbookCTA />)
      const button = screen.getByRole('link', { name: /view flipbook preview/i })
      expect(button).toHaveAttribute('data-size', 'lg')
    })

    it('should have custom height and padding', () => {
      render(<FlipbookCTA />)
      const button = screen.getByRole('link', { name: /view flipbook preview/i })
      expect(button).toHaveClass('h-14')
      expect(button).toHaveClass('px-8')
    })
  })

  describe('Layout and Spacing', () => {
    it('should center content', () => {
      const { container } = render(<FlipbookCTA />)
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
    })

    it('should have proper vertical spacing', () => {
      const { container } = render(<FlipbookCTA />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-20')
    })

    it('should have max width for card', () => {
      const { container } = render(<FlipbookCTA />)
      const maxWidth = container.querySelector('.max-w-4xl')
      expect(maxWidth).toBeInTheDocument()
    })

    it('should have proper spacing between elements', () => {
      const { container } = render(<FlipbookCTA />)
      const spacedContent = container.querySelector('.space-y-6')
      expect(spacedContent).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive heading sizes', () => {
      render(<FlipbookCTA />)
      const heading = screen.getByRole('heading', { name: /experience it like a real yearbook/i })
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('md:text-4xl')
    })

    it('should have responsive padding', () => {
      const { container } = render(<FlipbookCTA />)
      const cardContent = container.querySelector('[data-slot="card-content"]')
      expect(cardContent).toHaveClass('pt-12')
      expect(cardContent).toHaveClass('pb-12')
    })

    it('should have responsive container padding', () => {
      const { container } = render(<FlipbookCTA />)
      const mainContainer = container.querySelector('.px-4')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should have bold heading', () => {
      render(<FlipbookCTA />)
      const heading = screen.getByRole('heading', { name: /experience it like a real yearbook/i })
      expect(heading).toHaveClass('font-bold')
    })

    it('should have secondary foreground color for heading', () => {
      render(<FlipbookCTA />)
      const heading = screen.getByRole('heading', { name: /experience it like a real yearbook/i })
      expect(heading).toHaveClass('text-secondary-foreground')
    })

    it('should have large text for description', () => {
      render(<FlipbookCTA />)
      const description = screen.getByText(/turn pages, relive memories/i)
      expect(description).toHaveClass('text-lg')
    })

    it('should have muted description color', () => {
      render(<FlipbookCTA />)
      const description = screen.getByText(/turn pages, relive memories/i)
      expect(description).toHaveClass('text-secondary-foreground/80')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = render(<FlipbookCTA />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have accessible link with clear text', () => {
      render(<FlipbookCTA />)
      const link = screen.getByRole('link', { name: /view flipbook preview/i })
      expect(link).toHaveAccessibleName()
    })

    it('should have proper heading hierarchy', () => {
      render(<FlipbookCTA />)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Content Hierarchy', () => {
    it('should render badge before heading', () => {
      const { container } = render(<FlipbookCTA />)
      const badge = screen.getByText('New Feature')
      const heading = screen.getByRole('heading', { name: /experience it like a real yearbook/i })
      
      expect(badge.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('should render heading before description', () => {
      const { container } = render(<FlipbookCTA />)
      const heading = screen.getByRole('heading', { name: /experience it like a real yearbook/i })
      const description = screen.getByText(/turn pages, relive memories/i)
      
      expect(heading.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('Z-index Layering', () => {
    it('should have content above decorative elements', () => {
      const { container } = render(<FlipbookCTA />)
      const content = container.querySelector('.relative.z-10')
      expect(content).toBeInTheDocument()
    })
  })
})