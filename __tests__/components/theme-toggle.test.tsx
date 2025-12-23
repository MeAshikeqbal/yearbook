import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/theme-toggle'

// Mock the theme provider
const mockSetTheme = jest.fn()
jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">Moon</span>,
  Sun: () => <span data-testid="sun-icon">Sun</span>,
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  describe('Mounting and Hydration', () => {
    it('should render with Sun icon before mounting', () => {
      render(<ThemeToggle />)
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
    })

    it('should show icon after component mounts', async () => {
      render(<ThemeToggle />)
      
      await waitFor(() => {
        // After mount, it should show the appropriate icon based on theme
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })

    it('should have accessibility label', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button', { name: /toggle theme/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Theme Toggling', () => {
    it('should toggle theme on click', async () => {
      const user = userEvent.setup()
      
      // Re-render with mounted state
      const { rerender } = render(<ThemeToggle />)
      
      // Wait for mount
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should toggle from dark to light', async () => {
      const user = userEvent.setup()
      
      // Mock dark theme
      jest.mocked(require('@/components/theme-provider').useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      })

      render(<ThemeToggle />)
      
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Icon Display', () => {
    it('should display Moon icon when theme is light', async () => {
      jest.mocked(require('@/components/theme-provider').useTheme).mockReturnValue({
        theme: 'light',
        setTheme: mockSetTheme,
      })

      render(<ThemeToggle />)
      
      await waitFor(() => {
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      })
    })

    it('should display Sun icon when theme is dark', async () => {
      jest.mocked(require('@/components/theme-provider').useTheme).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      })

      render(<ThemeToggle />)
      
      await waitFor(() => {
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      })
    })
  })

  describe('Button Properties', () => {
    it('should have ghost variant', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'ghost')
    })

    it('should have icon size', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-size', 'icon')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<ThemeToggle />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })
      
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockSetTheme).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have sr-only text for screen readers', () => {
      render(<ThemeToggle />)
      const srText = screen.getByText(/toggle theme/i)
      expect(srText).toBeInTheDocument()
      expect(srText).toHaveClass('sr-only')
    })
  })
})