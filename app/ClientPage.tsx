"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, Loader2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { useToast } from "@/hooks/use-toast"
import { Footer } from "@/components/footer"
import dynamic from 'next/dynamic'
import { ModelCarouselSkeleton } from '@/components/skeletons'
import { FAQSection } from "@/components/faq"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"
import Link from "next/link"
const ModelCarousel = dynamic(() => import('@/components/ModelCarousel').then((mod) => mod.ModelCarousel), { ssr: false });

// Zod schema for order ID validation
const orderIdSchema = z.string().regex(/^\d+$/, {
  message: "Order ID must contain only numbers",
})

export default function ClientPage() {
  const [orderId, setOrderId] = useState("")
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [carouselLoaded, setCarouselLoaded] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // On mount, show skeleton for 3s, then swap to real carousel
  useEffect(() => {
    const timer = setTimeout(() => setCarouselLoaded(true), 4000)
    return () => clearTimeout(timer)
  }, [])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const formattedOrderId = orderId.padStart(5, "0") // Format order ID to 5 digits      
    // Show searching state
    setIsSearching(true)

    try {
      // Validate the order ID
      orderIdSchema.parse(formattedOrderId)
      router.push(`/order/${formattedOrderId}`)
      setIsSearching(false)


      // try {
      //   // Navigate to the order page directly
      //   // We'll handle the "not found" case on the order page
      // } catch (err) {
      //   console.error("Error navigating:", err)
      //   setError("An error occurred. Please try again.")
      //   toast({
      //     title: "Error",
      //     description: "An error occurred while searching for your order",
      //   })
      // } finally {
      //   setIsSearching(false)
      // }
    } catch (err) {
      setIsSearching(false)
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
      <main className="rounded">
        <div id="hero" className="flex-1 flex items-center justify-center min-h-screen">
          <section className="w-full animate-fade-in">
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
            <div
              className="w-full max-w-sm space-y-2 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0"
              >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                name="orderId"
                placeholder={
              isSearching
                ? "Loading..."
                : "Enter Order ID. eg: 00082 or 82"
                }
                className={`w-full pl-8 bg-background border-amber-500/20 focus-visible:ring-amber-500 ${
              error ? "border-red-500" : ""
                }`}
                value={orderId}
                onChange={(e) => {
              setOrderId(e.target.value);
              setError("");
                }}
                required
                disabled={isSearching}
              />
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-300 button-hover"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
                </>
              ) : (
                "Track Order"
              )}
            </Button>
              </form>
              
            <Link
              href="https://yhe.bumpa.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-w-full justify-center bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              Visit Store
            </Link>
            </div>
          </div>
            </div>
          </section>
        </div>
        <section id="design-models" className="animate-slide-up">
          <div className="container px-6 md:px-9">
            <div className="flex flex-col space-y-4 text-center">
              <div className="space-y-2 animate-slide-up">
                <h2 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Explore Our Designs
                </h2>
                {/* <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Check out our latest designs.
                </p> */}
                <p className="mx-auto max-w-[700px] text-muted-foreground text-sm md:text-xl">
                  Zoom in and out to explore the details of our designs. Two fingers to drag.
                </p>
              </div>
              {/* ⏳ Skeleton or Carousel */}
              {!carouselLoaded ? (
                <ModelCarouselSkeleton />
              ) : (
                <ModelCarousel
                  models={[
                    "classof.glb",
                    "veni.glb",
                    "result.glb",
                    "plain.glb",
                    "lawyer.glb",
                    "years.glb",
                  ]}
                />
              )}
            </div>
          </div>
        </section>
        {/* FAQ */}
        <section id="faqs" className="animate-slide-up">
          <div className="container px-6 md:px-9">
            <div className="flex flex-col space-y-4">
              <div className="space-y-2 animate-slide-up">
                {/* <h2 className="text-3xl font-bold tracking-wide sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Frequently Asked Questions
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Have questions? We have answers.
                </p> */}
              </div>
              <FAQSection/>
            </div>
          </div>
        </section>
      </main>
      <ScrollToTopButton />
      <Footer />
    </div>
  )
}
