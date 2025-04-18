"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export function LoadingAnimation() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    let interval: NodeJS.Timeout
    let timeout: NodeJS.Timeout

    const startLoading = () => {
      setIsLoading(true)
      setProgress(0)

      // Simulate progress with smooth animation
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          // Smaller increments for smoother animation
          return prev + 2
        })
      }, 50)
    }

    const completeLoading = () => {
      clearInterval(interval)
      setProgress(100)

      // Hide the loading bar after completion with a longer delay for smooth transition
      timeout = setTimeout(() => {
        setIsLoading(false)
      }, 800)
    }

    // Start loading
    startLoading()

    // Complete loading after a short delay
    timeout = setTimeout(completeLoading, 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress
        value={progress}
        className="h-1 rounded-none bg-background"
        indicatorClassName="bg-amber-500 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(242,174,73,0.5)]"
      />
    </div>
  )
}
