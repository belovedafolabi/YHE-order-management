import { NextResponse } from "next/server"
import { fetchOrdersData } from "@/lib/data"

export async function GET() {
  try {
    const orders = await fetchOrdersData()

    // Return the first 10 orders and the total count
    return NextResponse.json({
      totalOrders: orders.length,
      sampleOrders: orders.slice(0, 10),
      orderIds: orders.map((order) => order.orderId).slice(0, 20),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
