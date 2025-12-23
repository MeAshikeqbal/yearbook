import Link from "next/link"
import { BookOpen } from "lucide-react"

/**
 * Render the site's responsive footer with branding, navigation links, and an affiliation disclaimer.
 *
 * @returns The footer JSX element containing the brand section, Quick Links, Resources, Connect columns, and a copyright/disclaimer area.
 */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <BookOpen className="h-5 w-5" />
              <span>Class of 2026</span>
            </Link>
            <p className="text-sm text-muted-foreground">A student-run digital yearbook project</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/join" className="text-muted-foreground hover:text-foreground transition-colors">
                  Join
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Profiles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            This is an unofficial, student-run project for the Class of 2026 and is not affiliated with the college
            administration.
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            © 2025 Class of 2026 Yearbook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}