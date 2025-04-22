import type { Order } from "./types"
import { getAllOrdersFromDb, getOrderByIdFromDb, saveOrderToDatabase, localConvertCsvToDbOrder } from "./db-service"
import Papa from "papaparse";

const CSV_URL = "https://bfa-portfolio.vercel.app/docs/bumpa/orders.csv"
// const CSV_URL = "https://bfa-portfolio.vercel.app/docs/order.csv" // For 100 Orders - No Guns
//const CSV_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/orders-sVkG73FndiUbAhEkmL8oHn86k9FeBE.csv"

// Utility function to convert a string to camelCase
function toCamelCase(str: string): string {
  return str.toLowerCase().replace(/\s(.)/g, (_, char) => char.toUpperCase())
}

/**
 * Fetch and parse all orders from the CSV, without persisting to DB
 */
export async function fetchOrdersData(): Promise<Order[]> {
  try {
    const response = await fetch(CSV_URL, { cache: "no-store" })
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`)

    const csvText = await response.text()
    const result = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    })

    return result.data.map(rec => ({
      orderId: rec["Order ID"]?.trim().padStart(5, "0") || "00000",
      customer: rec["Customer"]?.trim() || "Unknown",
      product: rec["Product"]?.trim() || "Unknown",
      total: rec["Total"] ? parseFloat(rec["Total"]) : 0,
      orderStatus: rec["Order Status"]?.trim() || "PENDING",
      paymentStatus: rec["Payment Status"]?.trim() || "PENDING",
      shippingStatus: rec["Shipping Status"]?.trim() || "PENDING",
      shippingDetails: rec["Shipping Details"]?.trim() || "",
      salesChannel: rec["Sales Channel"]?.trim() || "website",
      date:
        rec["Date"] && !isNaN(Date.parse(rec["Date"]))
          ? rec["Date"].trim()
          : new Date().toISOString(),
    }))
  } catch (error) {
    console.error("Error parsing CSV:", error)
    return []
  }
}

// Function to update the print status of an order
export async function updatePrintStatus(orderId: string, printStatus: "PRINTED" | "NOT_PRINTED"): Promise<boolean> {
  try {
    const orders = await fetchOrdersData()
    const orderIndex = orders.findIndex(order => String(order.orderId).trim() === String(orderId).trim())

    if (orderIndex === -1) {
      console.error(`Order with ID ${orderId} not found.`)
      return false
    }

    orders[orderIndex].printStatus = printStatus

    // Optionally, you could persist this change to the database here if needed
    // console.log(`Print status for order ${orderId} updated to ${printStatus}.`)
    return true
  } catch (error) {
    console.error("Error updating print status:", error)
    return false
  }
}
// Function to get all orders
export async function getAllOrders(): Promise<Order[]> {
  return fetchOrdersData()
}

// Function to get all orders from the database (Manager view)
export async function fetchAllOrdersFromDb(): Promise<Order[]> { 
  
    try {
      const dbOrders = await getAllOrdersFromDb()
      return dbOrders.map(order => ({
        ...order,
        salesChannel: order.salesChannel || "website", // Ensure salesChannel is always a string
      }))
    } catch (error) {
      console.error("Error getting all orders from DB:", error)
      return []
    }
  }

// Function to get a specific order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    // First, try to get the order from the database
    const dbOrder = await getOrderByIdFromDb(orderId)
    if (dbOrder) {
      return {
        ...dbOrder,
        salesChannel: dbOrder.salesChannel || "website", // Ensure salesChannel is always a string
      }
    }

    // If not found in the database, check the CSV
    const orders = await fetchOrdersData()

    // Convert both to strings for comparison to ensure we match regardless of type
    const order = orders.find((order) => String(order.orderId).trim() === String(orderId).trim())

    // If found in CSV, save to database for future use
    if (order) {
      const dbOrder = await localConvertCsvToDbOrder({
        ...order,
        printStatus: order.printStatus || "NOT_PRINTED", // Ensure printStatus is always defined
      })
      await saveOrderToDatabase(dbOrder)
    }

    return order || null
  } catch (error) {
    console.error("Error getting order by ID:", error)
    return null
  }
}
