"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function GridBackground() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Delay the animation to ensure it happens after page load
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn("fixed inset-0 z-[-1] opacity-0 transition-opacity duration-1000", isVisible && "opacity-100")}
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
          linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        backgroundPosition: "0 0",
        maskImage: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 1) 100%)",
      }}
    />
  )
}
