import { Footer } from "@/components/footer"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function OrderLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-amber-500">YHE OrderTrack</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-4" />
            <h2 className="text-xl font-medium">Loading Order Details...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch your order information</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
