"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

export function AdminNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: "Manage", href: "/youcantseethis" },
    // { name: "All Orders", href: "/youcantseethis/admin" },
    { name: "Predesigned Designs", href: "/youcantseethis/predesigned-designs" },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (isMobile) {
    return (
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {isMenuOpen && (
          <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-border bg-background shadow-lg animate-fade-in">
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-amber-500/10 text-amber-500 font-medium"
                      : "hover:bg-muted hover:text-amber-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 text-sm rounded-md transition-colors ${
            pathname === item.href
              ? "bg-amber-500/10 text-amber-500 font-medium"
              : "hover:bg-muted hover:text-amber-500"
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
