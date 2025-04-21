"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { smoothScrollTo } from "@/lib/smooth-scroll"

interface SiteHeaderProps {
  title?: string
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-amber-500">YHE OrderTrack</span>
          </Link>
          {title && <span className="ml-4 text-sm font-medium text-muted-foreground hidden md:inline">{title}</span>}
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-background shadow-lg animate-fade-in">
                  <nav className="flex flex-col p-2">
                  <Link
                    href="#design-models"
                    onClick={(e) => {
                      e.preventDefault()
                      smoothScrollTo("#design-models")
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted hover:text-amber-500"
                  >
                    Design Models
                  </Link>

                  <Link
                    href="#faqs"
                    onClick={(e) => {
                      e.preventDefault()
                      smoothScrollTo("#faqs")
                      setIsMenuOpen(false)
                    }}
                    className="px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted hover:text-amber-500"
                  >
                    FAQs
                  </Link>
                    {title && (
                      <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border/40 mt-1 pt-1">
                        {title}
                      </div>
                    )}
                  </nav>
                </div>
              )}
            </div>
          )}

          {!isMobile && (
            <>
              <Link
                href="#design-models"
                onClick={(e) => {
                  e.preventDefault()
                  smoothScrollTo("#design-models")
                  setIsMenuOpen(false)
                }}
                className="px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted hover:text-amber-500"
              >
                Design Models
              </Link>

              <Link
                href="#faqs"
                onClick={(e) => {
                  e.preventDefault()
                  smoothScrollTo("#faqs")
                  setIsMenuOpen(false)
                }}
                className="px-3 py-2 text-sm rounded-md transition-colors hover:bg-muted hover:text-amber-500"
              >
                FAQs
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
