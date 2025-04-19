"use server"

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { convertCsvToDbOrder as importedConvertCsvToDbOrder, localConvertDbToAppOrder as importedLocalConvertDbToAppOrder } from "./order-utils";
import type { DatabaseOrder, ImageLink } from "./types";

export type Order = {
  orderId: string;
  customer: string;
  phone?: string;
  product: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingDetails: string;
  salesChannel?: string;
  date: string;
  printStatus: string;
  imageLinks?: ImageLink[];
};

export async function checkOrderInDatabase(orderId: string): Promise<DatabaseOrder | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) return null;
    const formattedOrderId = order.orderId.padStart(5, "0");
    return {
      orderId: formattedOrderId,
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
      imageLink: order.imageLink ?? undefined,
    };
  } catch (error) {
    console.error("Error checking order in database:", error);
    return null;
  }
}

export async function saveOrderToDatabase(order: DatabaseOrder): Promise<boolean> {
  try {
    // Format the Order ID to a 5-digit padded string
    const formattedOrderId = order.orderId.padStart(5, "0");

    // Validate and parse the date
    let isoDate: string;
    if (order.date && !isNaN(Date.parse(order.date))) {
      isoDate = new Date(order.date).toISOString(); // Convert valid date to ISO-8601
    } else {
      console.warn(`Invalid date value: "${order.date}". Using current date as fallback.`);
      isoDate = new Date().toISOString(); // Fallback to the current date
    }

    await prisma.order.upsert({
      where: { orderId: formattedOrderId },
      update: {
        customerName: order.customerName,
        phone: order.phone || undefined,
        product: order.product,
        total: order.total,
        orderStatus: order.orderStatus,
        payStatus: order.payStatus,
        shipStatus: order.shipStatus,
        shipDetail: order.shipDetail || "",
        date: isoDate, // Use the validated ISO-8601 date
        printStatus: order.printStatus,
        imageLink: order.imageLink || undefined,
      },
      create: {
        orderId: formattedOrderId,
        customerName: order.customerName,
        phone: order.phone || undefined,
        product: order.product,
        total: order.total,
        orderStatus: order.orderStatus,
        payStatus: order.payStatus,
        shipStatus: order.shipStatus,
        shipDetail: order.shipDetail || "",
        date: isoDate, // Use the validated ISO-8601 date
        printStatus: order.printStatus,
        imageLink: order.imageLink || undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("Error saving order to database:", error);
    return false;
  }
}

export async function updatePhoneNumber(orderId: string, phone: string): Promise<any> {
  try {
    console.log("Updating phone number:", orderId, phone);
    // Validate orderId
    const formattedID = orderId.padStart(5, "0");
    let updatedOrder = await prisma.order.update({
      where: { orderId: formattedID },
      data: { phone },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");

    return updatedOrder;
  } catch (error) {
    console.error("Error updating phone number:", error);
    return false;
  }
}

export async function updateImageLink(orderId: string, imageLinks: ImageLink[]): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { orderId },
      data: {
        imageLink: JSON.stringify(imageLinks),
      },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");

    return true;
  } catch (error) {
    console.error("Error updating image link:", error);
    return false;
  }
}

export async function updatePrintStatus(orderId: string, printStatus: string): Promise<boolean> {
  try {
    await prisma.order.update({
      where: { orderId },
      data: { printStatus },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");

    return true;
  } catch (error) {
    console.error("Error updating print status:", error);
    return false;
  }
}

export async function localConvertCsvToDbOrder(csvOrder: Order): Promise<DatabaseOrder> {
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
  };
}

export async function localConvertDbToAppOrder(dbOrder: DatabaseOrder): Promise<Order> {
  let imageLinks: ImageLink[] = [];
  if (dbOrder.imageLink) {
    try {
      imageLinks = JSON.parse(dbOrder.imageLink);
    } catch (e) {
      console.error("Error parsing image links:", e);
    }
  }

  return {
    orderId: dbOrder.orderId || "Unknown",
    customer: dbOrder.customerName || "Unknown",
    phone: dbOrder.phone ?? undefined,
    product: dbOrder.product || "Unknown",
    total: dbOrder.total || 0,
    orderStatus: dbOrder.orderStatus || "Unknown",
    paymentStatus: dbOrder.payStatus || "Unknown",
    shippingStatus: dbOrder.shipStatus || "Unknown",
    shippingDetails: dbOrder.shipDetail || "",
    salesChannel: "website", // Default value
    date: dbOrder.date || new Date().toISOString(),
    printStatus: dbOrder.printStatus || "NOT_PRINTED",
    imageLinks,
  };
}

export async function getAllOrdersFromDb(): Promise<Order[]> {
  try {
    const dbOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Filter out invalid or null entries
    const validDbOrders = dbOrders.filter((dbOrder) => dbOrder !== null);

    return await Promise.all(
      validDbOrders.map(async (dbOrder) =>
        await localConvertDbToAppOrder({
          ...dbOrder,
          shipDetail: dbOrder.shipDetail || "",
          imageLink: dbOrder.imageLink ?? undefined,
        })
      )
    );
  } catch (error) {
    console.error("Error getting all orders from database:", error);
    return [];
  }
}

export async function getOrderByIdFromDb(orderId: string): Promise<Order | null> {
  try {
    const dbOrder = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!dbOrder) return null;

    return await localConvertDbToAppOrder({
      ...dbOrder,
      shipDetail: dbOrder.shipDetail || "",
      imageLink: dbOrder.imageLink ?? undefined,
    });
  } catch (error) {
    console.error("Error getting order by ID from database:", error);
    return null;
  }
}
