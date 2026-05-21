"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { ArrowRight, DollarSign, Globe } from "lucide-react"
import { FormField } from "./form-field"
import type { DiagnosticFormContent } from "@/sanity/lib/types"

const FALLBACK: DiagnosticFormContent = {
  brandNameLabel: "Brand name *",
  brandNameHelp: "We use this to personalize your results. Your score means more when it's named.",
  brandNamePlaceholder: "e.g Glowup Skincare",
  industryLabel: "Industry *",
  industryHelp: "Creative benchmarks differ by vertical. A skincare brand and a fitness brand have very different hook standards.",
  industryOptions: ["Beauty & Skincare","Fashion & Apparel","Health & Wellness","Food & Beverage","Home & Living","Tech & Gadgets","Fitness & Sports","Pet Products","Other D2C"],
  spendLabel: "Monthly ad spend",
  spendHelp: 'Helps us calibrate expectations. What counts as "low volume" at $5K looks very different at $500K.',
  spendOptions: ["Under $5K","$5K - $25K","$25K - $100K","$100K - $500K","$500K+"],
  startButtonText: "Start Creative Health Check",
}

type Props = {
  brandName: string
  industry: string
  monthlyAdSpend: string
  showError: boolean
  formContent: DiagnosticFormContent | null
  onBrandNameChange: (value: string) => void
  onIndustryChange: (value: string) => void
  onMonthlyAdSpendChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function DiagnosticIntro({
  brandName, industry, monthlyAdSpend, showError, formContent,
  onBrandNameChange, onIndustryChange, onMonthlyAdSpendChange, onSubmit,
}: Props) {
  const f = formContent ?? FALLBACK
  const industryOptions = f.industryOptions?.length > 0 ? f.industryOptions : FALLBACK.industryOptions
  const spendOptions = f.spendOptions?.length > 0 ? f.spendOptions : FALLBACK.spendOptions

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col gap-4 sm:gap-5">
      <FormField label={f.brandNameLabel} help={f.brandNameHelp}>
        <div className="flex h-10 w-full sm:w-80 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 shadow-xs">
          <Globe className="size-4 shrink-0 text-neutral-500" />
          <Input value={brandName} onChange={(e) => onBrandNameChange(e.target.value)}
            className="h-auto flex-1 rounded-none border-none bg-transparent px-0 py-0 text-sm text-neutral-900 shadow-none placeholder:text-neutral-400 focus-visible:border-none focus-visible:ring-0"
            placeholder={f.brandNamePlaceholder} />
        </div>
      </FormField>

      <FormField label={f.industryLabel} help={f.industryHelp}>
        <Select value={industry || undefined} onValueChange={onIndustryChange}>
          <SelectTrigger className="h-10 w-full sm:w-80 rounded-md border-neutral-300 bg-white text-neutral-900 shadow-xs data-placeholder:text-neutral-400 [&_svg]:text-neutral-500!">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {industryOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label={f.spendLabel} help={f.spendHelp}>
        <Select value={monthlyAdSpend || undefined} onValueChange={onMonthlyAdSpendChange}>
          <SelectTrigger className="h-10 w-full sm:w-80 rounded-md border-neutral-300 bg-white text-neutral-900 shadow-xs data-placeholder:text-neutral-400 [&_svg]:text-neutral-500!">
            <DollarSign className="size-4 shrink-0" />
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {spendOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>

      <div className="mt-4 flex w-full sm:w-80 flex-col gap-3">
        <Button type="submit" variant="default" size="lg" className="rounded-md px-6">
          {f.startButtonText}
          <ArrowRight className="size-4" />
        </Button>
        {showError && (
          <p className="font-mono text-xs leading-3.5 text-destructive">
            Please enter your brand name and industry to continue.
          </p>
        )}
      </div>
    </form>
  )
}
