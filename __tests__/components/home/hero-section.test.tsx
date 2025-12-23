import React from 'react'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/home/hero-section'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

describe('HeroSection', () => {
  describe('Rendering', () => {
    it('should render the hero section', () => {
      render(<HeroSection />)
      const section = screen.getByRole('region')
      expect(section).toBeInTheDocument()
    })

    it('should render the class badge', () => {
      render(<HeroSection />)
      expect(screen.getByText(/🎓 class of 2026/i)).toBeInTheDocument()
    })

    it('should render the main heading', () => {
      render(<HeroSection />)
      expect(screen.getByRole('heading', { name: /our yearbook/i })).toBeInTheDocument()
      expect(screen.getByText(/our story/i)).toBeInTheDocument()
    })

    it('should render the description', () => {
      render(<HeroSection />)
      expect(screen.getByText(/student-run digital yearbook/i)).toBeInTheDocument()
      expect(screen.getByText(/capture memories, people, and the moments that matter/i)).toBeInTheDocument()
    })
  })

  describe('Call-to-Action Buttons', () => {
    it('should render Join the Yearbook button', () => {
      render(<HeroSection />)
      const joinButton = screen.getByRole('link', { name: /join the yearbook/i })
      expect(joinButton).toBeInTheDocument()
      expect(joinButton).toHaveAttribute('href', '/join')
    })

    it('should render Browse Profiles button', () => {
      render(<HeroSection />)
      const browseButton = screen.getByRole('link', { name: /browse profiles/i })
      expect(browseButton).toBeInTheDocument()
      expect(browseButton).toHaveAttribute('href', '/browse')
    })

    it('should have proper button styling for Join button', () => {
      render(<HeroSection />)
      const joinButton = screen.getByRole('link', { name: /join the yearbook/i })
      expect(joinButton).toHaveAttribute('data-variant', 'default')
      expect(joinButton).toHaveAttribute('data-size', 'lg')
    })

    it('should have proper button styling for Browse button', () => {
      render(<HeroSection />)
      const browseButton = screen.getByRole('link', { name: /browse profiles/i })
      expect(browseButton).toHaveAttribute('data-variant', 'outline')
      expect(browseButton).toHaveAttribute('data-size', 'lg')
    })
  })

  describe('Layout and Styling', () => {
    it('should have gradient background classes', () => {
      const { container } = render(<HeroSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('bg-linear-to-br')
    })

    it('should have minimum viewport height', () => {
      const { container } = render(<HeroSection />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('min-h-svh')
    })

    it('should have container with max width', () => {
      const { container } = render(<HeroSection />)
      const innerContainer = container.querySelector('.container')
      expect(innerContainer).toHaveClass('max-w-7xl')
    })

    it('should center content', () => {
      const { container } = render(<HeroSection />)
      const textContainer = container.querySelector('.text-center')
      expect(textContainer).toBeInTheDocument()
    })
  })

  describe('Decorative Elements', () => {
    it('should render decorative blur elements', () => {
      const { container } = render(<HeroSection />)
      const blurElements = container.querySelectorAll('.blur-2xl, .blur-3xl')
      expect(blurElements.length).toBeGreaterThan(0)
    })

    it('should hide decorative elements on mobile', () => {
      const { container } = render(<HeroSection />)
      const hiddenElements = container.querySelectorAll('.hidden.md\\:block')
      expect(hiddenElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      const { container } = render(<HeroSection />)
      const heading = screen.getByRole('heading', { name: /our yearbook/i })
      expect(heading).toHaveClass('text-4xl')
      expect(heading).toHaveClass('md:text-6xl')
      expect(heading).toHaveClass('lg:text-7xl')
      expect(heading).toHaveClass('xl:text-8xl')
    })

    it('should have responsive spacing', () => {
      const { container } = render(<HeroSection />)
      const mainContainer = container.querySelector('.py-16')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have responsive button layout', () => {
      const { container } = render(<HeroSection />)
      const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(buttonContainer).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should have proper font weights', () => {
      render(<HeroSection />)
      const heading = screen.getByRole('heading', { name: /our yearbook/i })
      expect(heading).toHaveClass('font-bold')
    })

    it('should have proper text balance', () => {
      render(<HeroSection />)
      const heading = screen.getByRole('heading', { name: /our yearbook/i })
      expect(heading).toHaveClass('text-balance')
    })

    it('should have muted text for description', () => {
      const { container } = render(<HeroSection />)
      const description = screen.getByText(/student-run digital yearbook/i)
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic HTML', () => {
      const { container } = render(<HeroSection />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have accessible heading hierarchy', () => {
      render(<HeroSection />)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible links', () => {
      render(<HeroSection />)
      const links = screen.getAllByRole('link')
      expect(links.length).toBe(2)
      links.forEach(link => {
        expect(link).toHaveAccessibleName()
      })
    })
  })

  describe('Content Hierarchy', () => {
    it('should render badge before heading', () => {
      const { container } = render(<HeroSection />)
      const badge = screen.getByText(/🎓 class of 2026/i)
      const heading = screen.getByRole('heading', { name: /our yearbook/i })
      
      expect(badge.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it('should render heading before description', () => {
      const { container } = render(<HeroSection />)
      const heading = screen.getByRole('heading', { name: /our yearbook/i })
      const description = screen.getByText(/student-run digital yearbook/i)
      
      expect(heading.compareDocumentPosition(description)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })
})