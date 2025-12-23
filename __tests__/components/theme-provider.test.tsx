import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'

// Mock next-themes for this test file
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  ),
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark'],
  })),
}))

describe('ThemeProvider', () => {
  it('should render children within ThemeProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div>Test Child</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('should pass props to NextThemesProvider', () => {
    render(
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem 
        storageKey="test-theme"
      >
        <div>Content</div>
      </ThemeProvider>
    )
    const provider = screen.getByTestId('theme-provider')
    expect(provider).toHaveAttribute('attribute', 'class')
    expect(provider).toHaveAttribute('defaultTheme', 'dark')
    expect(provider).toHaveAttribute('storageKey', 'test-theme')
  })

  it('should render multiple children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })
})

describe('useTheme export', () => {
  it('should export useTheme hook', () => {
    expect(useTheme).toBeDefined()
    expect(typeof useTheme).toBe('function')
  })

  it('should return theme utilities', () => {
    const TestComponent = () => {
      const { theme, setTheme, themes } = useTheme()
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <span data-testid="themes">{themes?.join(',')}</span>
          <button onClick={() => setTheme('dark')}>Set Dark</button>
        </div>
      )
    }

    render(<TestComponent />)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('themes')).toHaveTextContent('light,dark')
  })
})