"use client"
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

/**
 * Wraps its children with NextThemesProvider to provide theme context and management.
 *
 * @param children - React nodes to be rendered inside the theme provider
 * @param props - All other ThemeProviderProps forwarded to `NextThemesProvider`
 * @returns A JSX element that supplies theme context to its children
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme } from "next-themes"