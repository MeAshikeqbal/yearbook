import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })

  it('should merge Tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2')
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
    expect(result).toContain('baz')
  })

  it('should handle objects with boolean values', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })

  it('should deduplicate conflicting Tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500')
    expect(result).toBe('bg-blue-500')
  })

  it('should preserve important modifiers', () => {
    const result = cn('text-base', 'text-lg')
    expect(result).toBe('text-lg')
  })
})