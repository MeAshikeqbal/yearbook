import React from 'react'
import { render, screen } from '@testing-library/react'
import { WhoItsFor } from '@/components/home/who-its-for'

describe('WhoItsFor', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      const { container } = render(<WhoItsFor />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should render target audience text', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/SKF Class of 2026/i)).toBeInTheDocument()
      expect(screen.getByText(/students only/i)).toBeInTheDocument()
    })

    it('should render opt-in disclaimer', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/participation is voluntary and opt-in/i)).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have accent background styling', () => {
      const { container } = render(<WhoItsFor />)
      const styledBox = container.querySelector('.bg-accent\\/10')
      expect(styledBox).toBeInTheDocument()
    })

    it('should have accent border styling', () => {
      const { container } = render(<WhoItsFor />)
      const styledBox = container.querySelector('.border-accent\\/20')
      expect(styledBox).toBeInTheDocument()
    })

    it('should have rounded corners', () => {
      const { container } = render(<WhoItsFor />)
      const styledBox = container.querySelector('.rounded-2xl')
      expect(styledBox).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should center content', () => {
      const { container } = render(<WhoItsFor />)
      const textCenter = container.querySelector('.text-center')
      expect(textCenter).toBeInTheDocument()
    })

    it('should have proper spacing', () => {
      const { container } = render(<WhoItsFor />)
      const section = container.querySelector('section')
      expect(section).toHaveClass('py-16')
    })

    it('should have max width container', () => {
      const { container } = render(<WhoItsFor />)
      const maxWidth = container.querySelector('.max-w-3xl')
      expect(maxWidth).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should emphasize SKF Class of 2026', () => {
      render(<WhoItsFor />)
      const emphasized = screen.getByText('SKF Class of 2026')
      expect(emphasized).toHaveClass('font-bold')
      expect(emphasized).toHaveClass('text-accent')
    })

    it('should have muted text for disclaimer', () => {
      render(<WhoItsFor />)
      const disclaimer = screen.getByText(/participation is voluntary and opt-in/i)
      expect(disclaimer).toHaveClass('text-muted-foreground')
    })

    it('should have proper text size', () => {
      const { container } = render(<WhoItsFor />)
      const paragraph = container.querySelector('.text-lg')
      expect(paragraph).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive padding', () => {
      const { container } = render(<WhoItsFor />)
      const mainContainer = container.querySelector('.px-4')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have responsive container', () => {
      const { container } = render(<WhoItsFor />)
      const container2 = container.querySelector('.container')
      expect(container2).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      const { container } = render(<WhoItsFor />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
    })

    it('should have readable text content', () => {
      render(<WhoItsFor />)
      const text = screen.getByText(/for/i)
      expect(text).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('should contain "For" prefix', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/^for/i)).toBeInTheDocument()
    })

    it('should contain "students only" suffix', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/students only\.$/i)).toBeInTheDocument()
    })

    it('should have line break between main text and disclaimer', () => {
      const { container } = render(<WhoItsFor />)
      const paragraph = container.querySelector('p')
      expect(paragraph?.innerHTML).toContain('<br')
    })
  })

  describe('Message Clarity', () => {
    it('should clearly state target audience', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/SKF Class of 2026 students only/i)).toBeInTheDocument()
    })

    it('should clearly state voluntary nature', () => {
      render(<WhoItsFor />)
      expect(screen.getByText(/voluntary and opt-in/i)).toBeInTheDocument()
    })
  })

  describe('Visual Design', () => {
    it('should have proper padding inside box', () => {
      const { container } = render(<WhoItsFor />)
      const styledBox = container.querySelector('.px-8')
      expect(styledBox).toBeInTheDocument()
      const styledBox2 = container.querySelector('.py-6')
      expect(styledBox2).toBeInTheDocument()
    })

    it('should be inline-block for centering', () => {
      const { container } = render(<WhoItsFor />)
      const inlineBlock = container.querySelector('.inline-block')
      expect(inlineBlock).toBeInTheDocument()
    })
  })
})