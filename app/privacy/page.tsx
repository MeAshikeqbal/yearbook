"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShieldCheck, Eye, Lock, FileText, ArrowLeft, Database, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground py-12 md:py-24 px-4 relative overflow-hidden font-mono">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        
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
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">./privacy_policy.md</h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: July 5, 2026 | Unofficial Student-Run digital yearbook
              </p>
            </div>

            {/* Content section */}
            <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
              <div className="bg-card/45 border border-border/50 rounded-lg p-5 backdrop-blur-xs space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" /> 1. Overview & Scope
                </h2>
                <p>
                  Welcome to the digital yearbook page for the Computer Science & Engineering graduating class of 2026. This platform is an unofficial, student-run initiative designed to celebrate our achievements and stay connected.
                </p>
                <p>
                  We are committed to maintaining the privacy and security of your data. This policy explains what information we collect, how it is stored, and who can access it. By registering, you consent to the terms described below.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Database className="h-4 w-4 text-primary" /> 2. Information We Collect
                </h2>
                <p>To construct your yearbook profile, we collect the following datasets:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Authentication Details:</strong> Email address, hashed password, and/or GitHub authentication tokens.
                  </li>
                  <li>
                    <strong className="text-foreground">Profile Parameters:</strong> Full name, role/title, profile biography, social links (GitHub, LinkedIn), and dynamic avatar preferences.
                  </li>
                  <li>
                    <strong className="text-foreground">Verification Materials:</strong> A photographic upload of your Student ID card.
                  </li>
                  <li>
                    <strong className="text-foreground">Custom Styles (optional):</strong> Custom CSS definitions provided by you to personalize your profile layout.
                  </li>
                </ul>
              </div>

              <div className="space-y-4 bg-muted/20 border border-border/30 rounded-lg p-5">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-primary" /> 3. Student ID Photo Verification & Safety
                </h2>
                <p>
                  To protect our cohort from unauthorized registrations, a valid Student ID card upload is strictly required. 
                </p>
                <p className="text-xs text-amber-500 font-bold border border-amber-500/20 bg-amber-500/5 p-3 rounded-md">
                  [SECURITY PROTOCOL]: Student ID photos are uploaded directly to a secure, private bucket directory. These files are visible exclusively to authorized administrators and moderators for identity checks. Under no circumstances are Student ID cards displayed publicly on the site or accessible to third-party web crawlers. Once verification is complete or a profile registration is rejected, these files can be archived or purged.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4 text-primary" /> 4. Data Visibility & Public Display
                </h2>
                <p>
                  Once approved by moderators, your yearbook profile data (excluding your password, email, and Student ID photo) becomes publicly accessible to anyone visiting the yearbook platform.
                </p>
                <p>
                  Because this site is public, any links, bio details, or custom styles you write will be visible on the web. Please do not publish sensitive personal data (e.g. personal phone numbers or physical addresses) in your public bio fields.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  🔒 5. Data Deletion & Modification
                </h2>
                <p>
                  You retain full control over your profile records. You can update your bio, social handles, custom styles, and avatar at any time by logging into your profile.
                </p>
                <p>
                  If you wish to delete your account entirely and purge all associated records (including your student profile and uploaded verification files) from our database, please contact an administrator or submit a request to the email listed below.
                </p>
              </div>

              <div className="space-y-4 border-t border-border/40 pt-6">
                <h2 className="text-foreground font-bold flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4 text-primary" /> 6. Contact Information
                </h2>
                <p>
                  For any privacy inquiries, data deletion requests, or concerns regarding moderation, please reach out to the student development team.
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
