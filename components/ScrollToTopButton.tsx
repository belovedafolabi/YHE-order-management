"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById("hero")
      if (!heroEl) return

      const heroHeight = heroEl.offsetHeight
      const scrollY = window.scrollY

      if (scrollY > heroHeight * 0.7) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg animate-fade-in"
      size="icon"
    >
      <ArrowUp className="w-5 h-5" />
      <span className="sr-only">Scroll to top</span>
    </Button>
  )
}
