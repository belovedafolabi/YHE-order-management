"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Loader2 } from "lucide-react"
import { z } from "zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { useToast } from "@/hooks/use-toast"

// Zod schema for order ID validation
const orderIdSchema = z.string().regex(/^\d+$/, {
  message: "Order ID must contain only numbers",
})

export default function ClientPage() {
  const [orderId, setOrderId] = useState("")
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const formattedOrderId = orderId.padStart(5, "0") // Format order ID to 5 digits

    try {
      // Validate the order ID
      orderIdSchema.parse(formattedOrderId)

      // Show searching state
      setIsSearching(true)

      try {
        // Navigate to the order page directly
        // We'll handle the "not found" case on the order page
        router.push(`/order/${formattedOrderId}`)
      } catch (err) {
        console.error("Error navigating:", err)
        setError("An error occurred. Please try again.")
        toast({
          title: "Error",
          description: "An error occurred while searching for your order",
        })
      } finally {
        setIsSearching(false)
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
        toast({
          title: "Invalid Order ID",
          description: err.errors[0].message,
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 animate-fade-in">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track/Manage Your Order
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Enter your order ID to view details, upload design and track your order.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="orderId"
                      placeholder="Enter Order ID"
                      className={`w-full pl-8 bg-background border-amber-500/20 focus-visible:ring-amber-500 ${
                        error ? "border-red-500" : ""
                      }`}
                      value={orderId}
                      onChange={(e) => {
                        setOrderId(e.target.value)
                        setError("")
                      }}
                      required
                      disabled={isSearching}
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-300 button-hover"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      "Track Order"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/40 bg-background py-6">
        <div className="container flex flex-col items-center justify-center gap-4 text-center px-4 md:flex-row md:gap-8 md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} YHE OrderTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
