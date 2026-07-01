import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider"
import { AuthProvider } from "@/lib/auth-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSE Yearbook - Class of 2026",
  description: "A digital yearbook for Computer Science & Engineering students graduating class of 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark-commit"
            enableSystem={false}
            themes={["light-code", "dark-commit", "dracula", "matrix-hacker"]}
            storageKey="yearbook-theme"
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}