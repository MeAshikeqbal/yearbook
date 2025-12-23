import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/header'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BookOpen: () => <span data-testid="book-icon">Book</span>,
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  X: () => <span data-testid="close-icon">X</span>,
}))

describe('Header', () => {
  describe('Rendering', () => {
    it('should render the header', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render logo link with icon', () => {
      render(<Header />)
      const logoLink = screen.getByRole('link', { name: /class of 2026/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute('href', '/')
      expect(screen.getByTestId('book-icon')).toBeInTheDocument()
    })

    it('should display full text on desktop', () => {
      render(<Header />)
      expect(screen.getByText('Class of 2026')).toBeInTheDocument()
    })

    it('should display abbreviated text on mobile', () => {
      render(<Header />)
      expect(screen.getByText('C/O 2026')).toBeInTheDocument()
    })
  })

  describe('Desktop Navigation', () => {
    it('should render About link', () => {
      render(<Header />)
      const aboutLink = screen.getByRole('link', { name: /about/i })
      expect(aboutLink).toBeInTheDocument()
      expect(aboutLink).toHaveAttribute('href', '/about')
    })

    it('should render Browse link', () => {
      render(<Header />)
      const browseLink = screen.getByRole('link', { name: /browse/i })
      expect(browseLink).toBeInTheDocument()
      expect(browseLink).toHaveAttribute('href', '/browse')
    })

    it('should render Join Now button', () => {
      render(<Header />)
      const joinButton = screen.getByRole('link', { name: /join now/i })
      expect(joinButton).toBeInTheDocument()
      expect(joinButton).toHaveAttribute('href', '/join')
    })

    it('should render ThemeToggle', () => {
      render(<Header />)
      // ThemeToggle renders a button with "Toggle theme" sr-only text
      const themeButtons = screen.getAllByRole('button', { name: /toggle theme/i })
      expect(themeButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Mobile Menu', () => {
    it('should initially have mobile menu closed', () => {
      render(<Header />)
      const menuIcon = screen.getByTestId('menu-icon')
      expect(menuIcon).toBeInTheDocument()
    })

    it('should open mobile menu when menu button is clicked', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i })
      await user.click(menuButton)

      // After opening, check for mobile navigation links
      const mobileAbout = screen.getAllByRole('link', { name: /about/i })
      expect(mobileAbout.length).toBeGreaterThan(1) // Desktop + Mobile
    })

    it('should close mobile menu when clicking a link', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Open menu
      const menuButton = screen.getByRole('button', { name: /toggle menu/i })
      await user.click(menuButton)

      // Click a mobile link
      const mobileLinks = screen.getAllByRole('link', { name: /about/i })
      await user.click(mobileLinks[mobileLinks.length - 1]) // Click mobile version

      // Menu should close (close icon should change to menu icon)
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })

    it('should toggle menu icon when opening/closing', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i })
      
      // Initially shows menu icon
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()

      // Click to open
      await user.click(menuButton)
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()

      // Click to close
      await user.click(menuButton)
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
    })
  })

  describe('Sticky Behavior', () => {
    it('should have sticky positioning classes', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('sticky')
      expect(header).toHaveClass('top-0')
      expect(header).toHaveClass('z-50')
    })

    it('should have backdrop blur for modern effect', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('backdrop-blur-md')
    })
  })

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      render(<Header />)
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have semantic nav element', () => {
      render(<Header />)
      const navElements = screen.getAllByRole('navigation')
      expect(navElements.length).toBeGreaterThan(0)
    })

    it('should have accessible menu toggle button', () => {
      render(<Header />)
      const toggleButton = screen.getByRole('button', { name: /toggle menu/i })
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle menu')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      // Tab through links
      await user.tab()
      const logoLink = screen.getByRole('link', { name: /class of 2026/i })
      expect(logoLink).toHaveFocus()
    })
  })

  describe('Responsive Design', () => {
    it('should have container with max width', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      const container = header.querySelector('.container')
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('max-w-7xl')
    })

    it('should hide desktop nav on mobile', () => {
      render(<Header />)
      const nav = screen.getAllByRole('navigation')[0]
      expect(nav).toHaveClass('hidden', 'md:flex')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid menu toggles', async () => {
      const user = userEvent.setup()
      render(<Header />)
      
      const menuButton = screen.getByRole('button', { name: /toggle menu/i })
      
      // Rapidly toggle multiple times
      await user.click(menuButton)
      await user.click(menuButton)
      await user.click(menuButton)
      
      // Should still work correctly
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    })
  })
})