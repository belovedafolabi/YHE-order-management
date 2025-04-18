import { type NextRequest, NextResponse } from "next/server"
import { getOrderById } from "@/lib/data"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = params.orderId

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
