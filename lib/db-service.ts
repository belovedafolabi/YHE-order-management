"use server"

import { revalidatePath } from "next/cache"
import type { DatabaseOrder, Order, ImageLink } from "./types"
import prisma from "./prisma"

// Function to check if an order exists in the database
export async function checkOrderInDatabase(orderId: string): Promise<DatabaseOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: {
        orderId: orderId,
      },
    })

    if (!order) return null

    return {
      orderId: order.orderId,
      customerName: order.customerName,
      phone: order.phone || undefined,
      product: order.product,
      total: order.total,
      orderStatus: order.orderStatus,
      payStatus: order.payStatus,
      shipStatus: order.shipStatus,
      shipDetail: order.shipDetail || "",
      date: order.date,
      printStatus: order.printStatus,
      imageLink: order.imageLink,
    }
  } catch (error) {
    console.error("Error checking order in database:", error)
    return null
  }
}

// Function to save an order to the database
export async function saveOrderToDatabase(order: DatabaseOrder): Promise<boolean> {
  try {
    await prisma.order.upsert({
      where: {
        orderId: order.orderId,
      },
      update: {
        customerName: order.customerName,
        phone: order.phone,
        product: order.product,
        total: order.total,
        orderStatus: order.orderStatus,
        payStatus: order.payStatus,
        shipStatus: order.shipStatus,
        shipDetail: order.shipDetail,
        date: order.date,
        printStatus: order.printStatus,
        imageLink: order.imageLink,
      },
      create: {
        orderId: order.orderId,
        customerName: order.customerName,
        phone: order.phone,
        product: order.product,
        total: order.total,
        orderStatus: order.orderStatus,
        payStatus: order.payStatus,
        shipStatus: order.shipStatus,
        shipDetail: order.shipDetail,
        date: order.date,
        printStatus: order.printStatus,
        imageLink: order.imageLink,
      },
    })

    // Revalidate paths
    revalidatePath(`/order/${order.orderId}`)
    revalidatePath("/youcantseethis")

    return true
  } catch (error) {
    console.error("Error saving order to database:", error)
    return false
  }
}

// Function to update phone number
export async function updatePhoneNumber(orderId: string, phone: string): Promise<boolean> {
  try {
    await prisma.order.update({
      where: {
        orderId: orderId,
      },
      data: {
        phone: phone,
      },
    })

    // Revalidate paths
    revalidatePath(`/order/${orderId}`)
    revalidatePath("/youcantseethis")

    return true
  } catch (error) {
    console.error("Error updating phone number:", error)
    return false
  }
}

// Function to update image link
export async function updateImageLink(orderId: string, imageLinks: ImageLink[]): Promise<boolean> {
  try {
    await prisma.order.update({
      where: {
        orderId: orderId,
      },
      data: {
        imageLink: JSON.stringify(imageLinks),
      },
    })

    // Revalidate paths
    revalidatePath(`/order/${orderId}`)
    revalidatePath("/youcantseethis")

    return true
  } catch (error) {
    console.error("Error updating image link:", error)
    return false
  }
}

// Function to update print status
export async function updatePrintStatus(orderId: string, printStatus: string): Promise<boolean> {
  try {
    await prisma.order.update({
      where: {
        orderId: orderId,
      },
      data: {
        printStatus: printStatus,
      },
    })

    // Revalidate paths
    revalidatePath(`/order/${orderId}`)
    revalidatePath("/youcantseethis")

    return true
  } catch (error) {
    console.error("Error updating print status:", error)
    return false
  }
}

// Function to convert CSV order to database order
export function convertCsvToDbOrder(csvOrder: Order): DatabaseOrder {
  return {
    orderId: csvOrder.orderId,
    customerName: csvOrder.customer,
    phone: csvOrder.phone,
    product: csvOrder.product,
    total: csvOrder.total,
    orderStatus: csvOrder.orderStatus,
    payStatus: csvOrder.paymentStatus,
    shipStatus: csvOrder.shippingStatus,
    shipDetail: csvOrder.shippingDetails,
    date: csvOrder.date,
    printStatus: csvOrder.orderStatus === "PRINTED" ? "PRINTED" : "NOT_PRINTED",
  }
}

// Function to convert database order to app order
export function convertDbToAppOrder(dbOrder: DatabaseOrder): Order {
  // Parse image links if they exist
  let imageLinks: ImageLink[] = []
  if (dbOrder.imageLink) {
    try {
      imageLinks = JSON.parse(dbOrder.imageLink)
    } catch (e) {
      console.error("Error parsing image links:", e)
    }
  }

  return {
    orderId: dbOrder.orderId,
    customer: dbOrder.customerName,
    phone: dbOrder.phone,
    product: dbOrder.product,
    total: dbOrder.total,
    orderStatus: dbOrder.orderStatus,
    paymentStatus: dbOrder.payStatus,
    shippingStatus: dbOrder.shipStatus,
    shippingDetails: dbOrder.shipDetail,
    salesChannel: "website", // Default value
    date: dbOrder.date,
    printStatus: dbOrder.printStatus,
    imageLinks: imageLinks,
  }
}

// Function to get all orders from the database
export async function getAllOrdersFromDb(): Promise<Order[]> {
  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return dbOrders.map(convertDbToAppOrder)
  } catch (error) {
    console.error("Error getting all orders from database:", error)
    return []
  }
}

// Function to get a specific order by ID from the database
export async function getOrderByIdFromDb(orderId: string): Promise<Order | null> {
  try {
    const dbOrder = await prisma.order.findUnique({
      where: {
        orderId: orderId,
      },
    })

    if (!dbOrder) return null

    return convertDbToAppOrder({
      orderId: dbOrder.orderId,
      customerName: dbOrder.customerName,
      phone: dbOrder.phone || undefined,
      product: dbOrder.product,
      total: dbOrder.total,
      orderStatus: dbOrder.orderStatus,
      payStatus: dbOrder.payStatus,
      shipStatus: dbOrder.shipStatus,
      shipDetail: dbOrder.shipDetail || "",
      date: dbOrder.date,
      printStatus: dbOrder.printStatus,
      imageLink: dbOrder.imageLink,
    })
  } catch (error) {
    console.error("Error getting order by ID from database:", error)
    return null
  }
}
