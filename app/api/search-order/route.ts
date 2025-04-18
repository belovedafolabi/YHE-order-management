import { type NextRequest, NextResponse } from "next/server"
import { getOrderById } from "@/lib/data"
import { checkOrderInDatabase, saveOrderToDatabase, convertCsvToDbOrder } from "@/lib/db-service"
import { z } from "zod"

// Zod schema for order ID validation
const orderIdSchema = z.string().regex(/^\d+$/, {
  message: "Order ID must contain only numbers",
})

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

    // Step 1: Check if order exists in database
    const dbOrder = await checkOrderInDatabase(orderId)

    if (dbOrder) {
      return NextResponse.json({
        found: true,
        source: "database",
        orderId: dbOrder.orderId,
      })
    }

    // Step 2: If not in database, check CSV
    const csvOrder = await getOrderById(orderId)

    if (csvOrder) {
      // Convert CSV order to database format
      const dbOrder = convertCsvToDbOrder(csvOrder)

      // Save to database
      await saveOrderToDatabase(dbOrder)

      return NextResponse.json({
        found: true,
        source: "csv",
        orderId: csvOrder.orderId,
      })
    }

    // Order not found in either source
    return NextResponse.json({
      found: false,
      error: "Order not found",
    })
  } catch (error) {
    console.error("Error searching for order:", error)
    return NextResponse.json({ error: "Failed to search for order" }, { status: 500 })
  }
}
