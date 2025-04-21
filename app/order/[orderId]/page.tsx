import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrderCard } from "@/components/order-card"
import { getOrderById } from "@/lib/data"
import { SiteHeader } from "@/components/site-header"
import { parseProductInfo } from "@/lib/utils"
import { Footer } from "@/components/footer"

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
  console.log(`Order data: ${JSON.stringify(order)}`)
  console.log(order)

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
      <Footer />
    </div>
)
}