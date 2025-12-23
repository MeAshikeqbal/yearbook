import React from 'react'
import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/footer'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock lucide-react
jest.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid="book-icon">Book</span>,
}))

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render the footer', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should render branding section with logo', () => {
      render(<Footer />)
      const logoLink = screen.getByRole('link', { name: /class of 2026/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })

    it('should render project description', () => {
      render(<Footer />)
      expect(screen.getByText(/student-run digital yearbook project/i)).toBeInTheDocument()
    })
  })

  describe('Quick Links Section', () => {
    it('should render Quick Links heading', () => {
      render(<Footer />)
      expect(screen.getByText('Quick Links')).toBeInTheDocument()
    })

    it('should render About link', () => {
      render(<Footer />)
      const aboutLink = screen.getByRole('link', { name: /^about$/i })
      expect(aboutLink).toBeInTheDocument()
      expect(aboutLink).toHaveAttribute('href', '/about')
    })

    it('should render Join link', () => {
      render(<Footer />)
      const joinLink = screen.getByRole('link', { name: /^join$/i })
      expect(joinLink).toBeInTheDocument()
      expect(joinLink).toHaveAttribute('href', '/join')
    })

    it('should render Browse Profiles link', () => {
      render(<Footer />)
      const browseLink = screen.getByRole('link', { name: /browse profiles/i })
      expect(browseLink).toBeInTheDocument()
      expect(browseLink).toHaveAttribute('href', '/browse')
    })
  })

  describe('Resources Section', () => {
    it('should render Resources heading', () => {
      render(<Footer />)
      expect(screen.getByText('Resources')).toBeInTheDocument()
    })

    it('should render FAQ link', () => {
      render(<Footer />)
      const faqLink = screen.getByRole('link', { name: /faq/i })
      expect(faqLink).toBeInTheDocument()
      expect(faqLink).toHaveAttribute('href', '/faq')
    })

    it('should render Privacy Policy link', () => {
      render(<Footer />)
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
      expect(privacyLink).toBeInTheDocument()
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })

    it('should render Contact link', () => {
      render(<Footer />)
      const contactLink = screen.getByRole('link', { name: /contact/i })
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute('href', '/contact')
    })
  })

  describe('Connect Section', () => {
    it('should render Connect heading', () => {
      render(<Footer />)
      expect(screen.getByText('Connect')).toBeInTheDocument()
    })

    it('should render Instagram link', () => {
      render(<Footer />)
      const instagramLink = screen.getByRole('link', { name: /instagram/i })
      expect(instagramLink).toBeInTheDocument()
      expect(instagramLink).toHaveAttribute('href', '#')
    })

    it('should render Discord link', () => {
      render(<Footer />)
      const discordLink = screen.getByRole('link', { name: /discord/i })
      expect(discordLink).toBeInTheDocument()
      expect(discordLink).toHaveAttribute('href', '#')
    })
  })

  describe('Disclaimer and Copyright', () => {
    it('should render disclaimer text', () => {
      render(<Footer />)
      expect(screen.getByText(/unofficial, student-run project/i)).toBeInTheDocument()
      expect(screen.getByText(/not affiliated with the college administration/i)).toBeInTheDocument()
    })

    it('should render copyright text', () => {
      render(<Footer />)
      expect(screen.getByText(/© 2025 Class of 2026 Yearbook/i)).toBeInTheDocument()
      expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
    })
  })

  describe('Layout and Structure', () => {
    it('should have grid layout for sections', () => {
      const { container } = render(<Footer />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should have proper spacing and borders', () => {
      render(<Footer />)
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('border-t')
    })

    it('should have container with max width', () => {
      const { container } = render(<Footer />)
      const footerContainer = container.querySelector('.container')
      expect(footerContainer).toBeInTheDocument()
      expect(footerContainer).toHaveClass('max-w-7xl')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic footer element', () => {
      render(<Footer />)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<Footer />)
      const headings = screen.getAllByRole('heading', { level: 3 })
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have accessible links with hover states', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toBeInTheDocument()
      })
    })
  })

  describe('Link Transitions', () => {
    it('should have transition classes on links', () => {
      render(<Footer />)
      const links = screen.getAllByRole('link')
      const textLinks = links.filter(link => 
        link.className.includes('transition-colors')
      )
      expect(textLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive grid columns', () => {
      const { container } = render(<Footer />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-4')
    })

    it('should have responsive padding', () => {
      const { container } = render(<Footer />)
      const mainContainer = container.querySelector('.py-12')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing href gracefully', () => {
      render(<Footer />)
      const placeholderLinks = screen.getAllByRole('link', { name: /instagram|discord/i })
      placeholderLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '#')
      })
    })
  })
})