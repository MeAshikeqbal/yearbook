"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Scale, FileText, ShieldAlert, CheckCircle, ArrowLeft, Terminal, Mail } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground py-12 md:py-24 px-4 relative overflow-hidden font-mono">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="container mx-auto max-w-3xl relative z-10">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 hover:border-border/80 bg-card/50 px-3 py-1.5 rounded-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>./go_back_home</span>
            </Link>
          </div>

          <div className="space-y-8">
            {/* Header section */}
            <div className="space-y-3 border-b border-border/80 pb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Scale className="h-5 w-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">./terms_of_service.md</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: July 5, 2026 | CSE Class of 2026 digital yearbook rules
              </p>
            </div>

            {/* Content section */}
            <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <div className="bg-card/45 border border-border/50 rounded-lg p-5 backdrop-blur-xs space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" /> 1. Acceptance of Terms
                </h2>
                <p>
                  By creating an account, submitting your student profile, or uploading content to the Class of 2026 Yearbook platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, do not register or use this platform.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-primary" /> 2. Eligibility & Account Verification
                </h2>
                <p>
                  This service is designed specifically for students in the Computer Science & Engineering graduating class of 2026. 
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Accurate Representation:</strong> You must sign up using your real name and valid student details.
                  </li>
                  <li>
                    <strong className="text-foreground">Verification Photo:</strong> You are required to upload a legible photo of your Student ID card. Providing spoofed, altered, or another student&apos;s ID card is strictly forbidden and will result in a permanent ban.
                  </li>
                  <li>
                    <strong className="text-foreground">Single Account:</strong> Each student is limited to exactly one profile slug (`/profile/[username]`).
                  </li>
                </ul>
              </div>

              <div className="space-y-4 bg-muted/20 border border-border/30 rounded-lg p-5">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Terminal className="h-4 w-4 text-primary" /> 3. Code of Conduct & Custom CSS Styling
                </h2>
                <p>
                  Our platform supports customization, including custom bios and the injection of custom styling rules (CSS). You are solely responsible for the content and code you write.
                </p>
                <p className="text-xs text-amber-500 font-bold border border-amber-500/20 bg-amber-500/5 p-3 rounded-md">
                  [CODE EXECUTION BOUNDS]: Custom CSS styling must be purely visual. You must not include malicious styling rules that attempt to hijack page components, obfuscated content designed to mislead users, styles that facilitate phishing/clickjacking, or tracker pixel elements. Any profile containing CSS rules that disrupt the website layout, impersonate administration styles, or compromise system performance will be suspended instantly.
                </p>
                <p>
                  Furthermore, you agree not to submit any content (text, images, links) that is abusive, harassing, defamatory, vulgar, obscene, or violates any laws.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <ShieldAlert className="h-4 w-4 text-primary" /> 4. Profile Moderation & Content Removal
                </h2>
                <p>
                  As an unofficial student platform, administrators and moderators reserve the complete right, at their sole discretion, to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Reject any registration request that fails Student ID verification.</li>
                  <li>Temporarily suspend or permanently delete profiles violating these Terms of Service.</li>
                  <li>Remove offensive images, memory cards, or reset custom CSS styling without prior notice.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  ⚖️ 5. Intellectual Property & License Grants
                </h2>
                <p>
                  You retain ownership of any text, links, or photos you submit to the platform. However, by uploading content, you grant the Class of 2026 Yearbook a non-exclusive, worldwide, royalty-free license to host, cache, store, and display your profile information to the public via our web domain.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  ⚠️ 6. Disclaimers & Limitation of Liability
                </h2>
                <p>
                  This yearbook is an unofficial, student-run hobby project. It is not managed, sponsored, or affiliated with the university administration.
                </p>
                <p>
                  The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. The development team makes no warranties regarding uptime, service availability, or database integrity. Under no circumstances shall the developers or administrators be liable for any direct or indirect damages resulting from the use or inability to use the platform.
                </p>
              </div>

              <div className="space-y-4 border-t border-border/40 pt-6">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-primary" /> 7. Inquiries & Report Abuse
                </h2>
                <p>
                  If you notice any profile content or custom CSS code that violates these Terms of Service, or if you have questions regarding your account status, please contact us.
                </p>
                <p className="font-semibold text-foreground">
                  Email: cse2026.yearbook@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
