import React from 'react'
import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '@/components/home/features-section'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Camera: () => <span data-testid="camera-icon">Camera</span>,
  Edit3: () => <span data-testid="edit-icon">Edit</span>,
  BookOpen: () => <span data-testid="book-icon">Book</span>,
}))

describe('FeaturesSection', () => {
  describe('Rendering', () => {
    it('should render the section heading', () => {
      render(<FeaturesSection />)
      expect(screen.getByRole('heading', { name: /what you can do here/i })).toBeInTheDocument()
    })

    it('should render the section description', () => {
      render(<FeaturesSection />)
      expect(screen.getByText(/everything you need to create lasting memories/i)).toBeInTheDocument()
    })

    it('should render all three feature cards', () => {
      const { container } = render(<FeaturesSection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      expect(cards.length).toBe(3)
    })
  })

  describe('Feature Cards Content', () => {
    it('should render Share Memories feature', () => {
      render(<FeaturesSection />)
      expect(screen.getByText('Share Memories')).toBeInTheDocument()
      expect(screen.getByText(/upload photos and moments from your college journey/i)).toBeInTheDocument()
      expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
    })

    it('should render Sign Yearbooks feature', () => {
      render(<FeaturesSection />)
      expect(screen.getByText('Sign Yearbooks')).toBeInTheDocument()
      expect(screen.getByText(/leave heartfelt messages on your friends' profiles/i)).toBeInTheDocument()
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
    })

    it('should render Relive It All feature', () => {
      render(<FeaturesSection />)
      expect(screen.getByText('Relive It All')).toBeInTheDocument()
      expect(screen.getByText(/browse profiles or experience the full yearbook/i)).toBeInTheDocument()
      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })
  })

  describe('Icons and Visual Elements', () => {
    it('should render icon for each feature', () => {
      render(<FeaturesSection />)
      expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })

    it('should have icon containers with proper styling', () => {
      const { container } = render(<FeaturesSection />)
      const iconContainers = container.querySelectorAll('.rounded-2xl.bg-primary\\/10')
      expect(iconContainers.length).toBe(3)
    })
  })

  describe('Card Styling', () => {
    it('should have hover effects on cards', () => {
      const { container } = render(<FeaturesSection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      cards.forEach(card => {
        expect(card).toHaveClass('hover:border-primary/50')
        expect(card).toHaveClass('hover:shadow-lg')
        expect(card).toHaveClass('group')
      })
    })

    it('should have proper border styling', () => {
      const { container } = render(<FeaturesSection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      cards.forEach(card => {
        expect(card).toHaveClass('border-2')
      })
    })
  })

  describe('Layout and Grid', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<FeaturesSection />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('sm:grid-cols-2')
      expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('should have proper spacing', () => {
      const { container } = render(<FeaturesSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-16')
    })

    it('should center content', () => {
      const { container } = render(<FeaturesSection />)
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive heading sizes', () => {
      render(<FeaturesSection />)
      const heading = screen.getByRole('heading', { name: /what you can do here/i })
      expect(heading).toHaveClass('text-3xl')
      expect(heading).toHaveClass('md:text-4xl')
      expect(heading).toHaveClass('lg:text-5xl')
    })

    it('should have responsive padding', () => {
      const { container } = render(<FeaturesSection />)
      const cardContents = container.querySelectorAll('[data-slot="card-content"]')
      cardContents.forEach(content => {
        expect(content).toHaveClass('pt-6')
        expect(content).toHaveClass('md:pt-8')
      })
    })
  })

  describe('Typography', () => {
    it('should have proper font weights for titles', () => {
      render(<FeaturesSection />)
      const titles = ['Share Memories', 'Sign Yearbooks', 'Relive It All']
      titles.forEach(title => {
        const element = screen.getByText(title)
        expect(element).toHaveClass('font-bold')
      })
    })

    it('should have muted text for descriptions', () => {
      const { container } = render(<FeaturesSection />)
      const descriptions = container.querySelectorAll('.text-muted-foreground')
      expect(descriptions.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = render(<FeaturesSection />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<FeaturesSection />)
      const mainHeading = screen.getByRole('heading', { name: /what you can do here/i, level: 2 })
      expect(mainHeading).toBeInTheDocument()
      
      const subHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(subHeadings.length).toBe(3)
    })
  })

  describe('Content Structure', () => {
    it('should render features in correct order', () => {
      const { container } = render(<FeaturesSection />)
      const headings = screen.getAllByRole('heading', { level: 3 })
      
      expect(headings[0]).toHaveTextContent('Share Memories')
      expect(headings[1]).toHaveTextContent('Sign Yearbooks')
      expect(headings[2]).toHaveTextContent('Relive It All')
    })

    it('should have consistent card structure', () => {
      const { container } = render(<FeaturesSection />)
      const cards = container.querySelectorAll('[data-slot="card"]')
      
      cards.forEach(card => {
        const content = card.querySelector('[data-slot="card-content"]')
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('Interactive Elements', () => {
    it('should have group hover effects', () => {
      const { container } = render(<FeaturesSection />)
      const iconContainers = container.querySelectorAll('.group-hover\\:bg-primary\\/20')
      expect(iconContainers.length).toBe(3)
    })
  })
})