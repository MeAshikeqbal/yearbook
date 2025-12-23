# Test Documentation

This document provides an overview of the comprehensive test suite for the yearbook application.

## Test Framework Setup

- **Test Framework**: Jest 29.7.0
- **Testing Library**: React Testing Library 14.1.2
- **Environment**: jsdom (for DOM simulation)
- **User Interactions**: @testing-library/user-event 14.5.1

## Test Coverage

### Utility Functions

#### `lib/utils.ts`
- **File**: `__tests__/lib/utils.test.ts`
- **Test Cases**: 10
- **Coverage Areas**:
  - Class name merging
  - Conditional classes
  - Tailwind CSS class deduplication
  - Empty/null/undefined handling
  - Array and object inputs
  - Conflicting class resolution

### UI Components

#### `components/ui/button.tsx`
- **File**: `__tests__/components/ui/button.test.tsx`
- **Test Cases**: 35+
- **Coverage Areas**:
  - All button variants (default, destructive, outline, secondary, ghost, link)
  - All button sizes (default, sm, lg, icon, icon-sm, icon-lg)
  - Click interactions and keyboard accessibility
  - Disabled state behavior
  - asChild prop with Radix UI Slot
  - Custom className and props
  - Edge cases (empty children, long text, special characters)

#### `components/ui/card.tsx`
- **File**: `__tests__/components/ui/card.test.tsx`
- **Test Cases**: 25+
- **Coverage Areas**:
  - All card components (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction)
  - Data attributes and slots
  - Custom className application
  - Composed card structures
  - Edge cases (empty children, nested content)

### Theme Components

#### `components/theme-provider.tsx`
- **File**: `__tests__/components/theme-provider.test.tsx`
- **Test Cases**: 6+
- **Coverage Areas**:
  - Children rendering
  - Props forwarding to next-themes
  - useTheme hook export
  - Multiple children support

#### `components/theme-toggle.tsx`
- **File**: `__tests__/components/theme-toggle.test.tsx`
- **Test Cases**: 15+
- **Coverage Areas**:
  - Mounting and hydration behavior
  - Theme toggling (light/dark)
  - Icon display based on theme
  - Keyboard accessibility
  - Screen reader support
  - Button variants and sizes

### Layout Components

#### `components/header.tsx`
- **File**: `__tests__/components/header.test.tsx`
- **Test Cases**: 20+
- **Coverage Areas**:
  - Logo and branding
  - Desktop navigation links
  - Mobile menu toggle
  - Theme toggle integration
  - Responsive behavior
  - Accessibility (semantic HTML, keyboard navigation)
  - Edge cases (rapid menu toggles)

#### `components/footer.tsx`
- **File**: `__tests__/components/footer.test.tsx`
- **Test Cases**: 20+
- **Coverage Areas**:
  - All footer sections (Quick Links, Resources, Connect)
  - External and internal links
  - Disclaimer and copyright text
  - Grid layout
  - Responsive design
  - Accessibility

### Home Page Sections

#### `components/home/hero-section.tsx`
- **File**: `__tests__/components/home/hero-section.test.tsx`
- **Test Cases**: 20+
- **Coverage Areas**:
  - Heading and badge rendering
  - CTA buttons
  - Responsive typography
  - Decorative elements
  - Accessibility
  - Content hierarchy

#### `components/home/features-section.tsx`
- **File**: `__tests__/components/home/features-section.test.tsx`
- **Test Cases**: 20+
- **Coverage Areas**:
  - All three feature cards
  - Icons and visual elements
  - Card hover effects
  - Responsive grid layout
  - Typography
  - Accessibility

#### `components/home/privacy-section.tsx`
- **File**: `__tests__/components/home/privacy-section.test.tsx`
- **Test Cases**: 20+
- **Coverage Areas**:
  - All three privacy points
  - Icons and styling
  - Message clarity
  - Responsive grid
  - Typography
  - Accessibility

#### `components/home/who-its-for.tsx`
- **File**: `__tests__/components/home/who-its-for.test.tsx`
- **Test Cases**: 15+
- **Coverage Areas**:
  - Target audience messaging
  - Opt-in disclaimer
  - Accent styling
  - Typography emphasis
  - Responsive design
  - Content structure

#### `components/flipbook-cta.tsx`
- **File**: `__tests__/components/flipbook-cta.test.tsx`
- **Test Cases**: 25+
- **Coverage Areas**:
  - New Feature badge
  - CTA button and link
  - Gradient card styling
  - Decorative blur elements
  - Responsive design
  - Z-index layering
  - Typography and spacing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Best Practices

1. **Descriptive Test Names**: Each test clearly describes what it's testing
2. **Arrange-Act-Assert**: Tests follow the AAA pattern
3. **Isolation**: Each test is independent and can run in any order
4. **Mock Management**: External dependencies are properly mocked
5. **Accessibility Testing**: All components are tested for accessibility
6. **Edge Cases**: Tests include boundary conditions and error scenarios
7. **User Interactions**: Tests simulate real user behavior with userEvent

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests should be run automatically on:
- Every pull request
- Before merging to main
- Before deploying to production

## Future Enhancements

1. Visual regression testing with Playwright
2. Performance testing for component render times
3. Integration tests for full page flows
4. E2E tests for critical user journeys
5. Accessibility audits with axe-core

## Maintenance

- Update tests when components change
- Add tests for new features before implementation (TDD)
- Review and update mocks when dependencies update
- Monitor and maintain code coverage levels