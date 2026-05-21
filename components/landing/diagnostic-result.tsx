"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { DiagnosticAIResult } from "./diagnostic-types"

const VERDICT_CLASS: Record<DiagnosticAIResult["verdict"], string> = {
  Strong: "text-lime-600",
  "Needs Work": "text-yellow-600",
  Critical: "text-destructive",
}

type Props = {
  result: DiagnosticAIResult
  industry: string
  monthlyAdSpend: string
  onReview: () => void
  onRestart: () => void
}

export function DiagnosticResult({
  result,
  industry,
  monthlyAdSpend,
  onReview,
  onRestart,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full flex-col gap-6">
        <p className="type-monospaced text-foreground uppercase">
          Creative health score
        </p>

        <div className="rounded-md border border-neutral-950 bg-popover px-6 py-5 shadow-xs">
          <p className="font-sans text-[72px] leading-14 font-black tracking-[-1.5px] text-white">
            {result.score}
          </p>
          <p
            className={cn(
              "type-monospaced mt-2 text-sm text-primary! uppercase",
              VERDICT_CLASS[result.verdict]
            )}
          >
            {result.verdict}
          </p>
        </div>

        <p className="type-heading-4 text-foreground">{result.verdictCopy}</p>
        <p className="font-mono text-xs leading-4 text-foreground">
          {result.analysis}
        </p>
        <p className="font-mono text-xs leading-3.5 text-foreground/60">
          Industry: {industry}
          {monthlyAdSpend ? ` | Spend: ${monthlyAdSpend}` : ""}
        </p>
      </div>

      <div className="mt-auto flex w-full items-center gap-3 pt-8 sm:w-80">
        <Button
          type="button"
          variant="outline"
          onClick={onReview}
          className="rounded-md border-neutral-950 px-5"
        >
          <ArrowLeft className="size-4" />
          Review
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onRestart}
          className="ml-auto rounded-md px-6"
        >
          Run Again
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
