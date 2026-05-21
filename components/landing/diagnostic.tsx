"use client"

import { useState } from "react"
import type { DiagnosticAIResult, DiagnosticStage } from "./diagnostic-types"
import type { DiagnosticContent, DiagnosticQuestion } from "@/sanity/lib/types"
import { DiagnosticIntro } from "./diagnostic-intro"
import { DiagnosticQuestions } from "./diagnostic-questions"
import { DiagnosticResult } from "./diagnostic-result"

const FALLBACK_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "q1",
    area: "Hook Quality",
    weight: 1.8,
    text: "When you look at your last 10 ads, how many had a genuinely different opening hook?",
    subtext:
      "Not just different copy on the same template. Different visual pattern, different emotional trigger, different scroll-stop mechanism.",
    options: [
      {
        label:
          "8-10 had distinctly different hooks with different scroll-stop mechanics",
        value: 5,
      },
      {
        label:
          "4-7 had different hooks, the rest were variations of the same pattern",
        value: 3,
      },
      {
        label:
          "2-3 were genuinely different, the rest followed the same formula",
        value: 2,
      },
      {
        label: "Most used the same opening style with different text overlays",
        value: 1,
      },
    ],
  },
  {
    id: "q2",
    area: "Creative Volume",
    weight: 1.7,
    text: "How many net-new creative concepts are you launching per week?",
    subtext:
      "Not resizes. Not copy swaps. Genuinely new concepts with different angles, formats, or visual approaches.",
    options: [
      {
        label: "10+ new concepts per week, across multiple formats",
        value: 5,
      },
      {
        label: "5-9 new concepts per week, mostly in 1-2 formats",
        value: 3.5,
      },
      {
        label: "2-4 new concepts per week, when the team has bandwidth",
        value: 2,
      },
      {
        label: "Less than 2 per week, or we batch monthly",
        value: 1,
      },
    ],
  },
  {
    id: "q3",
    area: "Format Diversity",
    weight: 1.5,
    text: "How many different ad formats are you actively testing right now?",
    subtext:
      "Static, carousel, video (talking head), video (product demo), UGC-style, motion graphics, before/after, listicle.",
    options: [
      {
        label: "5+ formats actively in rotation, adapted per platform",
        value: 5,
      },
      {
        label: "3-4 formats, leaning heavily on 1-2",
        value: 3,
      },
      {
        label: "2 formats max",
        value: 2,
      },
      {
        label: "Primarily one format across all campaigns",
        value: 1,
      },
    ],
  },
  {
    id: "q4",
    area: "Testing Velocity",
    weight: 1.8,
    text: "When a creative starts winning, how quickly do you produce variations before performance decays?",
    subtext:
      "Creative fatigue is real. Winning ads have a shelf life. Can your pipeline spin variations fast enough?",
    options: [
      {
        label: "Within 24-48 hours we have 3-5 variations live",
        value: 5,
      },
      {
        label: "Within a week, we get 2-3 variations out",
        value: 3.5,
      },
      {
        label: "Takes 2-3 weeks, performance usually drops first",
        value: 2,
      },
      {
        label: "We rarely iterate on winners",
        value: 1,
      },
    ],
  },
  {
    id: "q5",
    area: "Creative Strategy",
    weight: 1.6,
    text: "Before producing a new ad, is there a documented brief with a specific angle and hypothesis?",
    subtext:
      'Not a vague "make it look good." A specific angle, hook type, CTA strategy, and measurable hypothesis.',
    options: [
      {
        label:
          "Every creative ships with angle, hook, hypothesis, and success metric",
        value: 5,
      },
      {
        label: "Most have a brief, but more directional than specific",
        value: 3,
      },
      {
        label: "Briefs exist sometimes, production often starts without one",
        value: 2,
      },
      {
        label: "We rarely brief. Designers create based on intuition",
        value: 1,
      },
    ],
  },
  {
    id: "q6",
    area: "Performance Analysis",
    weight: 1.6,
    text: "When an ad underperforms, can you identify exactly which creative element failed?",
    subtext:
      "Hook? Pacing? CTA? Visual style? If you can only say it didn't work, your feedback loop is broken.",
    options: [
      {
        label: "We break down by hook, body, CTA, and visual separately",
        value: 5,
      },
      {
        label: "Can usually identify the weak point informally",
        value: 3.5,
      },
      {
        label: "Look at CTR/CPA but rarely diagnose specific elements",
        value: 2,
      },
      {
        label: "Just pause underperformers and move on",
        value: 1,
      },
    ],
  },
  {
    id: "q8",
    area: "Production Capacity",
    weight: 1.7,
    text: '"We need 20 new creatives by Friday." Could your pipeline deliver?',
    subtext:
      "The stress test. If production can't handle surge demand, creative is your ceiling.",
    options: [
      {
        label: "Yes, comfortably",
        value: 5,
      },
      {
        label: "Could do it but quality would suffer",
        value: 3,
      },
      {
        label: "Could deliver 5-10 at best",
        value: 2,
      },
      {
        label: "No chance. 2-3 weeks minimum",
        value: 1,
      },
    ],
  },
]

export function Diagnostic({ content }: { content: DiagnosticContent | null }) {
  const questions: DiagnosticQuestion[] =
    content?.questions && content.questions.length > 0
      ? content.questions
      : FALLBACK_QUESTIONS

  const [stage, setStage] = useState<DiagnosticStage>("intro")
  const [brandName, setBrandName] = useState("")
  const [industry, setIndustry] = useState("")
  const [monthlyAdSpend, setMonthlyAdSpend] = useState("")
  const [showIntroError, setShowIntroError] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [aiResult, setAiResult] = useState<DiagnosticAIResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress =
    stage === "questions"
      ? Math.max(8, (currentQuestionIndex / questions.length) * 100)
      : 0
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined

  const headingLines =
    stage === "intro"
      ? ["Before", "We", "Begin"]
      : stage === "questions"
        ? [
            "Question",
            String(currentQuestionIndex + 1),
            `of ${questions.length}`,
          ]
        : ["Your", "Creative", "Score"]

  const headingSubcopy =
    stage === "intro"
      ? (content?.introSubcopy ??
        "Tell us about your brand so we can calibrate the diagnostic.")
      : stage === "questions"
        ? currentQuestion.area
        : aiResult
          ? `${brandName || "Your brand"} is currently in the ${aiResult.verdict.toLowerCase()} zone.`
          : "Analyzing your creative pipeline..."

  const footerCopy =
    stage === "result"
      ? "This is a directional check. A full Hookana audit delivers asset-level recommendations."
      : "Built from patterns across 10,000+ ad creatives. Identifies structural gaps that cause creative fatigue, low CTR, and wasted ad spend."

  const handleStart = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!brandName.trim() || !industry) {
      setShowIntroError(true)
      return
    }
    setShowIntroError(false)
    setStage("questions")
    setCurrentQuestionIndex(0)
  }

  const handleSelectAnswer = (value: number) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleQuestionSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (currentAnswer === undefined) return

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1)
      return
    }

    const finalAnswers = { ...answers, [currentQuestion.id]: currentAnswer }
    setStage("result")
    setIsLoading(true)
    setLoadError(false)
    setAiResult(null)

    try {
      const payload = {
        brandName,
        industry,
        monthlyAdSpend,
        answers: questions.map((q) => ({
          area: q.area,
          question: q.text,
          selectedOption:
            q.options.find((o) => o.value === finalAnswers[q.id])?.label ?? "",
          score: finalAnswers[q.id] ?? 1,
        })),
      }
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("API error")
      const result: DiagnosticAIResult = await response.json()
      setAiResult(result)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setStage("intro")
    setBrandName("")
    setIndustry("")
    setMonthlyAdSpend("")
    setShowIntroError(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setAiResult(null)
    setLoadError(false)
  }

  return (
    <div className="flex w-full justify-center">
      <section className="relative w-full max-w-180 bg-card px-6 py-10 md:-mt-10 md:px-19 md:py-12 2xl:-mt-20">
        <div className="absolute top-0 -right-px h-12 w-12 overflow-hidden bg-blue-950 sm:h-16 sm:w-16 2xl:bg-pink-300">
          <div
            className="absolute inset-0 bg-muted-foreground"
            style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
          />
        </div>

        <div className="mx-auto flex h-full flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-8">
            <h2 className="font-sans text-2xl leading-tight font-semibold tracking-tight text-card-foreground uppercase sm:text-5xl sm:leading-none sm:tracking-[-1.5px] 2xl:text-[64px] 2xl:leading-12">
              <span className="block">{headingLines[0]}</span>
              <span className="block">{headingLines[1]}</span>
              <span className="block">{headingLines[2]}</span>
            </h2>
            <p className="type-heading-4 sm:type-heading-3 text-foreground sm:max-w-[200px] md:max-w-[250px]">
              {headingSubcopy}
            </p>
          </div>

          <div className="mt-6 border-t border-dotted border-neutral-950 sm:mt-10" />

          <div className="mt-6 flex min-h-80 flex-col sm:mt-8 sm:min-h-100">
            {stage === "intro" && (
              <DiagnosticIntro
                brandName={brandName}
                industry={industry}
                monthlyAdSpend={monthlyAdSpend}
                showError={showIntroError}
                formContent={content?.form ?? null}
                onBrandNameChange={setBrandName}
                onIndustryChange={setIndustry}
                onMonthlyAdSpendChange={setMonthlyAdSpend}
                onSubmit={handleStart}
              />
            )}
            {stage === "questions" && currentQuestion && (
              <DiagnosticQuestions
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                currentAnswer={currentAnswer}
                progress={progress}
                isLastQuestion={isLastQuestion}
                totalQuestions={questions.length}
                onSelectAnswer={handleSelectAnswer}
                onSubmit={handleQuestionSubmit}
                onPrevious={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
              />
            )}
            {stage === "result" && (
              <>
                {isLoading && (
                  <div className="flex h-full flex-col justify-center gap-3">
                    <p className="type-monospaced text-foreground uppercase">
                      Analyzing your creative pipeline...
                    </p>
                    <p className="font-mono text-xs text-foreground/60">
                      This takes a few seconds.
                    </p>
                  </div>
                )}
                {loadError && (
                  <div className="flex h-full flex-col justify-center gap-6">
                    <p className="type-monospaced text-destructive uppercase">
                      Something went wrong.
                    </p>
                    <p className="font-mono text-xs text-foreground/60">
                      We couldn&apos;t analyze your results. Please try again.
                    </p>
                    <button
                      onClick={handleRestart}
                      className="font-mono text-xs text-primary underline"
                    >
                      Start over
                    </button>
                  </div>
                )}
                {!isLoading && !loadError && aiResult && (
                  <DiagnosticResult
                    result={aiResult}
                    industry={industry}
                    monthlyAdSpend={monthlyAdSpend}
                    onReview={() => {
                      setStage("questions")
                      setCurrentQuestionIndex(0)
                    }}
                    onRestart={handleRestart}
                  />
                )}
              </>
            )}
          </div>

          <div className="mt-6 border-t border-dotted border-neutral-950 sm:mt-10" />
          <p className="mt-3 font-mono text-xs leading-3.5 text-blue-500 sm:mt-5">
            {footerCopy}
          </p>
        </div>

        <div className="absolute right-0 -bottom-6.75 left-0 h-7">
          <svg
            width="100%"
            height="28"
            viewBox="0 0 696 28"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L25,28 L50,0 L75,28 L100,0 L125,28 L150,0 L175,28 L200,0 L225,28 L250,0 L275,28 L300,0 L325,28 L350,0 L375,28 L400,0 L425,28 L450,0 L475,28 L500,0 L525,28 L550,0 L575,28 L600,0 L625,28 L650,0 L675,28 L696,0 Z"
              fill="#fff"
            />
          </svg>
        </div>
      </section>
    </div>
  )
}
