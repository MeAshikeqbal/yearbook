import React from 'react'
import { render, screen } from '@testing-library/react'
import { PrivacySection } from '@/components/home/privacy-section'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Lock: () => <span data-testid="lock-icon">Lock</span>,
  Shield: () => <span data-testid="shield-icon">Shield</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
}))

describe('PrivacySection', () => {
  describe('Rendering', () => {
    it('should render the section heading', () => {
      render(<PrivacySection />)
      expect(screen.getByRole('heading', { name: /your privacy matters/i })).toBeInTheDocument()
    })

    it('should render the section description', () => {
      render(<PrivacySection />)
      expect(screen.getByText(/built with transparency and your security in mind/i)).toBeInTheDocument()
    })

    it('should render all three privacy cards', () => {
      const { container } = render(<PrivacySection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Privacy Points Content', () => {
    it('should render Your Control point', () => {
      render(<PrivacySection />)
      expect(screen.getByText('Your Control')).toBeInTheDocument()
      expect(screen.getByText(/only information you choose to share is visible/i)).toBeInTheDocument()
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('should render No ERP Access point', () => {
      render(<PrivacySection />)
      expect(screen.getByText('No ERP Access')).toBeInTheDocument()
      expect(screen.getByText(/we don't access any institutional systems/i)).toBeInTheDocument()
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
    })

    it('should render No Facial Recognition point', () => {
      render(<PrivacySection />)
      expect(screen.getByText('No Facial Recognition')).toBeInTheDocument()
      expect(screen.getByText(/your photos stay private and unscanned/i)).toBeInTheDocument()
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should render icon for each privacy point', () => {
      render(<PrivacySection />)
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    })

    it('should have icon containers with proper styling', () => {
      const { container } = render(<PrivacySection />)
      const iconContainers = container.querySelectorAll('.rounded-xl.bg-primary\\/10')
      expect(iconContainers.length).toBe(3)
    })
  })

  describe('Card Styling', () => {
    it('should have border styling on cards', () => {
      const { container } = render(<PrivacySection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      cards.forEach(card => {
        expect(card).toHaveClass('border-2')
      })
    })

    it('should have proper padding on card content', () => {
      const { container } = render(<PrivacySection />)
      const cardContents = container.querySelectorAll('[data-slot="card-content"]')
      cardContents.forEach(content => {
        expect(content).toHaveClass('pt-8')
        expect(content).toHaveClass('pb-8')
      })
    })
  })

  describe('Layout and Grid', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<PrivacySection />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-3')
    })

    it('should have proper spacing', () => {
      const { container } = render(<PrivacySection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-20')
    })

    it('should have max width container', () => {
      const { container } = render(<PrivacySection />)
      const container2 = container.querySelector('.max-w-5xl')
      expect(container2).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive heading sizes', () => {
      render(<PrivacySection />)
      const heading = screen.getByRole('heading', { name: /your privacy matters/i })
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('md:text-5xl')
    })

    it('should have responsive padding', () => {
      const { container } = render(<PrivacySection />)
      const mainContainer = container.querySelector('.px-4')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should have proper font weights for titles', () => {
      render(<PrivacySection />)
      const titles = ['Your Control', 'No ERP Access', 'No Facial Recognition']
      titles.forEach(title => {
        const element = screen.getByText(title)
        expect(element).toHaveClass('font-bold')
      })
    })

    it('should have muted text for descriptions', () => {
      const { container } = render(<PrivacySection />)
      const descriptions = container.querySelectorAll('.text-muted-foreground')
      expect(descriptions.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = render(<PrivacySection />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<PrivacySection />)
      const mainHeading = screen.getByRole('heading', { name: /your privacy matters/i, level: 2 })
      expect(mainHeading).toBeInTheDocument()
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings.length).toBe(3)
    })
  })

  describe('Content Structure', () => {
    it('should render privacy points in correct order', () => {
      const { container } = render(<PrivacySection />)
      const headings = screen.getAllByRole('heading', { level: 3 })
      
      expect(headings[0]).toHaveTextContent('Your Control')
      expect(headings[1]).toHaveTextContent('No ERP Access')
      expect(headings[2]).toHaveTextContent('No Facial Recognition')
    })

    it('should have consistent card structure', () => {
      const { container } = render(<PrivacySection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      
      cards.forEach(card => {
        const content = card.querySelector('[data-slot="card-content"]')
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('Message Clarity', () => {
    it('should communicate control clearly', () => {
      render(<PrivacySection />)
      expect(screen.getByText(/only information you choose to share/i)).toBeInTheDocument()
    })

    it('should communicate ERP policy clearly', () => {
      render(<PrivacySection />)
      expect(screen.getByText(/don't access any institutional systems/i)).toBeInTheDocument()
    })

    it('should communicate facial recognition policy clearly', () => {
      render(<PrivacySection />)
      expect(screen.getByText(/photos stay private and unscanned/i)).toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('should render heading before description', () => {
      const { container } = render(<PrivacySection />)
      const heading = screen.getByRole('heading', { name: /your privacy matters/i })
      const description = screen.getByText(/built with transparency/i)
      
      expect(heading.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })
})