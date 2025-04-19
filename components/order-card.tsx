"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { PhoneNumberInput } from "@/components/phone-number-input"
import type { Order } from "@/lib/types"
import { format, isValid, parseISO } from "date-fns"
import { splitProducts } from "@/lib/utils"
import { OrderCardSkeleton } from "@/components/skeletons"

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Safe date formatting function
  const formatDate = (dateString: string | undefined) => {
    // If dateString is undefined or null, return a default value
    if (!dateString) {
      return "No date available"
    }

    try {
      // Try to parse the date string directly
      let date = new Date(dateString)

      // If that doesn't work, try to parse as ISO format
      if (!isValid(date)) {
        try {
          date = parseISO(dateString)
        } catch (e) {
          // Ignore parsing error
        }
      }

      // If still not valid and the string contains a comma, try to parse it as "Apr 15, 2025" format
      if (!isValid(date) && dateString.includes(",")) {
        try {
          const parts = dateString.split(",")
          if (parts.length === 2) {
            date = new Date(`${parts[0]},${parts[1]}`)
          }
        } catch (e) {
          // Ignore parsing error
        }
      }

      // Return formatted date if valid, otherwise return the original string
      return isValid(date) ? format(date, "MMMM d, yyyy") : dateString
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString // Fallback to the original string
    }
  }

  // Split products string into individual products
  const products = splitProducts(order.product)

  if (isLoading) {
    return <OrderCardSkeleton />
  }

  return (
    <Card className="overflow-hidden border-amber-500/20 shadow-lg transition-all duration-300 card-hover animate-fade-in shadow-[0_0_15px_rgba(242,174,73,0.15)]">
      <CardHeader className="bg-muted/50 p-4 md:p-6 border-b border-border/60">
        <CardTitle className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <span className="text-amber-500">Order #{order.orderId}</span>
          <span className="text-sm font-normal text-muted-foreground">{formatDate(order.date)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-4 md:gap-6">
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Customer</div>
            <div className="font-medium">{order.customer}</div>
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Shipping Details</div>
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              {order.shippingDetails || "No shipping details available"}
            </div>
          </div>
          <div className="grid gap-2">
            <PhoneNumberInput orderId={order.orderId} initialPhoneNumber={order.phone} />
          </div>
          <div className="grid gap-2">
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="flex flex-wrap gap-2">
              
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 transition-all duration-300 hover:bg-amber-500/20">
                Shipping: {order.shippingStatus || "PENDING"}
              </span>
              <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 transition-all duration-300 hover:bg-amber-500/20">
                Print Status: {order.orderStatus === "PRINTED" ? "Printed" : "Not Printed"}
              </span>
              {/* <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500 transition-all duration-300 hover:bg-amber-500/20">
                Payment: {order.paymentStatus || "PENDING"}
              </span> */}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="text-sm font-medium text-muted-foreground">Products</div>
            {products.length > 0 ? (
              <div className="grid gap-4">
                {products.map((product, index) => (
                  <ProductCard key={index} product={product} orderId={order.orderId} index={index} />
                ))}
              </div>
            ) : (
              <ProductCard product={order.product} orderId={order.orderId} />
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
            <div className="text-sm font-medium text-muted-foreground">Total</div>
            <div className="text-xl font-bold text-amber-500">₦{order.total.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
