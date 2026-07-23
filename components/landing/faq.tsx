"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FaqContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import {
  useListControls,
  ListItemControls,
  AddItemButton,
} from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"

const FALLBACK: FaqContent = {
  heading1: "Got\nquestions?",
  heading2: "Good.",
  items: [
    {
      question: "How fast can you deliver?",
      answer: "Most projects ship within 48 hours. Rush delivery (same-day) is available on Growth and Enterprise plans.",
    },
    {
      question: "What types of creatives do you produce?",
      answer: "Static ads, video ads, carousel ads, UGC-style edits, motion graphics, creative concepts, and ad iterations. If it runs on Meta, TikTok, Snapchat, or YouTube, we make it.",
    },
    {
      question: "Do you offer revisions?",
      answer: "Unlimited revisions on all plans. First-draft approval rate sits above 85%.",
    },
    {
      question: 'What does "concept to variation" mean?',
      answer: "A concept is a fresh creative idea with its own angle, hook, and visual approach. A variation is a spin on a winning concept: different headline, different opening frame, different CTA, or different pacing. We build the original concept, test it, and when it performs, we rapidly produce 3-5 variations to extend its lifespan before fatigue sets in. That's concept to variation, and it's how the best performance teams keep ROAS stable week after week.",
    },
    {
      question: "How is Hookana different from a freelancer or agency?",
      answer: "Freelancers are unpredictable. Agencies are slow and expensive. Hookana gives you dedicated creative production at agency quality, at a fraction of the cost, and we actually hit deadlines.",
    },
    {
      question: "Do we need to send you briefs?",
      answer: "No — that's the point. We study your account and pitch concepts; you approve and we produce. Briefed work is welcome too, but never required.",
    },
  ],
}

export function Faq({ content }: { content: FaqContent | null }) {
  const { editing } = useEditor()
  const { heading1, heading2, items } = useEditable("faq", content, FALLBACK)
  const faqItems = items?.length > 0 ? items : FALLBACK.items
  const itemControls = useListControls("faq.items")

  return (
    <section className="mx-auto w-full px-5 py-14 sm:py-20 md:px-12 lg:px-20 2xl:py-52 2xl:px-36">
      <div className="flex flex-col gap-10 sm:gap-14 2xl:grid 2xl:grid-cols-[500px_800px] 2xl:justify-between 2xl:gap-0">
        <div className="flex flex-col gap-3 sm:gap-6 2xl:gap-15">
          <EditableText
            as="h2"
            path="faq.heading1"
            value={heading1}
            multiline
            className="font-editorial font-light text-4xl sm:text-5xl md:text-6xl 2xl:text-[96px] leading-[0.95] 2xl:leading-[0.95] tracking-[-0.02em] text-voltage-blue"
          />
          <EditableText
            as="p"
            path="faq.heading2"
            value={heading2}
            multiline
            className="font-editorial font-light text-4xl sm:text-5xl md:text-6xl 2xl:text-[96px] leading-[0.95] 2xl:leading-[0.95] tracking-[-0.02em] text-hot-pink"
          />
        </div>

        {editing ? (
          <div className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="relative rounded-lg border border-ink/15 p-4">
                <ListItemControls
                  index={index}
                  length={faqItems.length}
                  onMove={itemControls.move}
                  onRemove={itemControls.remove}
                  className="-top-3 right-3"
                />
                <EditableText
                  as="p"
                  path={`faq.items.${index}.question`}
                  value={item.question}
                  className="font-ease text-xl sm:text-2xl 2xl:text-[28px] font-normal tracking-[-0.03em] leading-tight text-ink"
                />
                <EditableText
                  as="p"
                  path={`faq.items.${index}.answer`}
                  value={item.answer}
                  multiline
                  className="mt-2 font-ease text-sm sm:text-base tracking-[-0.02em] leading-relaxed text-ink"
                />
              </div>
            ))}
            <AddItemButton
              label="Add question"
              onClick={() => itemControls.add({ question: "New question?", answer: "Answer." })}
            />
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-none border-0 bg-transparent"
          >
            {faqItems.map((item, index) => (
              <div key={index} className="w-full">
                <AccordionItem
                  value={String(index)}
                  className="border-0 not-last:border-b-0 data-open:bg-transparent"
                >
                  <AccordionTrigger className="font-ease text-xl sm:text-2xl 2xl:text-[28px] font-normal tracking-[-0.03em] text-left leading-tight px-0 py-2 2xl:py-4 text-ink hover:no-underline **:data-[slot=accordion-trigger-icon]:text-ink">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pt-1 pb-4 2xl:pb-0 text-ink">
                    <p className="font-ease text-sm sm:text-base tracking-[-0.02em] leading-relaxed">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>

                <div
                  className="mt-3 mb-3 2xl:mt-5 2xl:mb-5 h-px w-full text-ink"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to right, currentColor 0, currentColor 2px, transparent 2px, transparent 4px)",
                  }}
                />
              </div>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  )
}
