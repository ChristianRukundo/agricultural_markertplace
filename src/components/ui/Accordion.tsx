"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

function AccordionItem({ title, children, isOpen = false, onToggle }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const { contextSafe } = useGSAP({ scope: contentRef })

  const toggleContent = contextSafe(() => {
    const content = contentRef.current
    const icon = iconRef.current
    if (!content || !icon) return

    if (isOpen) {
      gsap.to(content, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      })
      gsap.to(icon, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.inOut",
      })
    } else {
      gsap.set(content, { height: "auto" })
      const height = content.offsetHeight
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: height,
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut",
        },
      )
      gsap.to(icon, {
        rotation: 180,
        duration: 0.3,
        ease: "power2.inOut",
      })
    }
    onToggle?.()
  })

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={toggleContent}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
      >
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        <span ref={iconRef} className="text-gray-500 dark:text-gray-400 transition-transform duration-300">
          ↓
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  )
}

interface AccordionProps {
  items: Array<{
    title: string
    content: React.ReactNode
  }>
  allowMultiple?: boolean
  className?: string
}

export function Accordion({ items, allowMultiple = false, className = "" }: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
