import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrderCard } from "@/components/order-card"
import { getOrderById } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "YHE OrderTrack - Order Details",
  description: "View your order details, track status, and upload designs",
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // Debug log to see what order ID we're looking for
  console.log(`Looking for order ID: ${orderId}`)

  const order = await getOrderById(orderId)

  // Debug log to see if we found the order
  console.log(`Order found: ${order ? "Yes" : "No"}`)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader title="Order Details" />
      <main className="flex-1">
        <div className="container py-6 md:py-12 px-4 animate-fade-in">
          <div className="mb-6 md:mb-8">
            <Button variant="ghost" size="sm" className="gap-1 transition-colors duration-300" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:gap-8 animate-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Order Details</h1>
            <OrderCard order={order} />
          </div>
        </div>
      </main>
      <footer className="w-full border-t border-border/40 bg-background py-4 md:py-6">
        <div className="container flex flex-col items-center justify-center gap-2 md:gap-4 text-center px-4 md:flex-row md:gap-8 md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} YHE OrderTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
)
}