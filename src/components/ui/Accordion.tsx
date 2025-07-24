"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  className?: string
}

export function Accordion({ items, allowMultiple = false, className = "" }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const accordionRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: accordionRef })

  const toggleItem = contextSafe((itemId: string) => {
    const newOpenItems = new Set(openItems)

    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId)
    } else {
      if (!allowMultiple) {
        newOpenItems.clear()
      }
      newOpenItems.add(itemId)
    }

    setOpenItems(newOpenItems)

    // Animate the content
    const content = accordionRef.current?.querySelector(`[data-content="${itemId}"]`)
    const icon = accordionRef.current?.querySelector(`[data-icon="${itemId}"]`)

    if (content && icon) {
      if (newOpenItems.has(itemId)) {
        gsap.set(content, { height: "auto" })
        gsap.from(content, { height: 0, duration: 0.3, ease: "power2.out" })
        gsap.to(icon, { rotation: 180, duration: 0.3, ease: "power2.out" })
      } else {
        gsap.to(content, { height: 0, duration: 0.3, ease: "power2.out" })
        gsap.to(icon, { rotation: 0, duration: 0.3, ease: "power2.out" })
      }
    }
  })

  return (
    <div ref={accordionRef} className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-200"
          >
            <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
            <svg
              data-icon={item.id}
              className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div data-content={item.id} className={`overflow-hidden ${openItems.has(item.id) ? "" : "h-0"}`}>
            <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
