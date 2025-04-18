import type { Order } from "./types"
import { getAllOrdersFromDb, getOrderByIdFromDb, saveOrderToDatabase, convertCsvToDbOrder } from "./db-service"

const CSV_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/orders-sVkG73FndiUbAhEkmL8oHn86k9FeBE.csv"

// Function to fetch and parse the CSV data
export async function fetchOrdersData(): Promise<Order[]> {
  try {
    // First, try to get orders from the database
    const dbOrders = await getAllOrdersFromDb()

    // If we have orders in the database, return them
    if (dbOrders.length > 0) {
      return dbOrders
    }

    // Otherwise, fetch from CSV
    const response = await fetch(CSV_URL, { cache: "no-store" })

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    const orders = parseCSV(csvText)

    // Save orders to database for future use
    for (const order of orders) {
      const dbOrder = convertCsvToDbOrder(order)
      await saveOrderToDatabase(dbOrder)
    }

    return orders
  } catch (error) {
    console.error("Error fetching orders data:", error)
    return []
  }
}

// Function to parse CSV text into Order objects
function parseCSV(csvText: string): Order[] {
  const lines = csvText.split("\n")
  if (lines.length === 0) return []

  const headers = lines[0].split(",")
  const orders: Order[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    // Handle quoted CSV values properly
    const values: string[] = []
    let currentValue = ""
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(currentValue)
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    // Add the last value
    values.push(currentValue)

    // Skip if we don't have enough values
    if (values.length < headers.length) {
      console.warn(`Skipping row ${i}: not enough values`)
      continue
    }

    const order: Partial<Order> = {}

    headers.forEach((header, index) => {
      const val = values[index]?.trim()

      if (header === "Order ID") {
        order.orderId = val
      } else if (header === "Total") {
        order.total = val ? Number.parseFloat(val) : 0
      } else {
        // Convert header to camelCase
        const key = header.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
        // @ts-ignore - Dynamic assignment
        order[key] = val
      }
    })

    // Ensure all required fields have at least default values
    const safeOrder: Order = {
      orderId: order.orderId || "Unknown",
      customer: order.customer || "Unknown",
      product: order.product || "Unknown",
      total: order.total || 0,
      orderStatus: order.orderStatus || "PENDING",
      paymentStatus: order.paymentStatus || "PENDING",
      shippingStatus: order.shippingStatus || "PENDING",
      shippingDetails: order.shippingDetails || "",
      salesChannel: order.salesChannel || "website",
      date: order.date || new Date().toDateString(),
    }

    orders.push(safeOrder)
  }

  return orders
}

// Function to get all orders
export async function getAllOrders(): Promise<Order[]> {
  return fetchOrdersData()
}

// Function to get a specific order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    // First, try to get the order from the database
    const dbOrder = await getOrderByIdFromDb(orderId)
    if (dbOrder) {
      return dbOrder
    }

    // If not found in the database, check the CSV
    const orders = await fetchOrdersData()

    // Convert both to strings for comparison to ensure we match regardless of type
    const order = orders.find((order) => String(order.orderId).trim() === String(orderId).trim())

    // If found in CSV, save to database for future use
    if (order) {
      const dbOrder = convertCsvToDbOrder(order)
      await saveOrderToDatabase(dbOrder)
    }

    return order || null
  } catch (error) {
    console.error("Error getting order by ID:", error)
    return null
  }
}
