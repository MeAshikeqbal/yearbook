import React from "react"
import Link from "next/link"
import { AlertTriangle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeatureDisabledProps {
  feature: string
}

export default function FeatureDisabled({ feature }: FeatureDisabledProps) {
  return (
    <div className="flex h-[75svh] flex-col items-center justify-center text-center px-4 bg-background text-foreground animate-in fade-in duration-300">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
        <div className="relative border border-amber-500/30 bg-amber-500/5 text-amber-500 p-5 rounded-full shadow-inner flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground flex items-center justify-center gap-1.5">
          [MODULE_SUSPENDED]
        </h2>
        <p className="text-xs md:text-sm font-mono text-muted-foreground leading-relaxed max-w-sm mx-auto">
          The <strong className="text-amber-500">{feature}</strong> interface has been temporarily offline or suspended by the network administrators.
        </p>
        <div className="border border-border bg-card/50 p-3 rounded-md font-mono text-3xs text-muted-foreground max-w-xs mx-auto">
          STATUS_CODE: 403_FEATURE_DISABLED
          <br />
          NODE: class_of_2026_cluster
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button asChild size="sm" variant="outline" className="font-mono text-xs bg-background border-border">
          <Link href="/">
            <Home className="h-3.5 w-3.5 mr-1" /> ./go_home
          </Link>
        </Button>
      </div>
    </div>
  )
}
