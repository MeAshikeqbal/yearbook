"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

/**
 * Render a button that toggles the application's theme between light and dark.
 *
 * Before the component mounts (to avoid hydration mismatch) it renders a static, icon-only ghost button.
 * After mounting it renders a ghost icon button that switches the theme on click and updates its icon:
 * a Sun icon when the current theme is `dark`, otherwise a Moon icon.
 *
 * @returns A JSX element containing the theme toggle button; includes a visually hidden "Toggle theme" label for accessibility.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "dark" ? <Sun className="h-5 w-5 transition-all" /> : <Moon className="h-5 w-5 transition-all" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}