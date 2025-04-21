import type { ReactNode } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdminNav } from "@/components/admin-nav"
import { Footer } from "@/components/footer"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-amber-500">YHE OrderTrack</span>
            </Link>
            <span className="ml-4 text-sm font-medium text-muted-foreground">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <AdminNav />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6 md:py-8 px-4 animate-fade-in">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
