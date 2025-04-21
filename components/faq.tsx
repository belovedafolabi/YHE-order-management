'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQS } from "@/lib/constants/faqs" // adjust path as needed

export function FAQSection() {
  return (
    <section className="min-w-2xl items-center md:min-w-2xl py-10">
      <h2 className="text-3xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
