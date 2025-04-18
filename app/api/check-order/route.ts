import { type NextRequest, NextResponse } from "next/server"
import { getOrderById } from "@/lib/data"
import { z } from "zod"
import { orderIdSchema } from "@/lib/actions"

export async function GET(request: NextRequest) {
  try {
    // Get order ID from query params
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get("orderId")

    // Validate order ID
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    try {
      orderIdSchema.parse(orderId)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 })
    }

    // Check if order exists
    const order = await getOrderById(orderId)

    return NextResponse.json({ exists: !!order })
  } catch (error) {
    console.error("Error checking order:", error)
    return NextResponse.json({ error: "Failed to check order" }, { status: 500 })
  }
}
