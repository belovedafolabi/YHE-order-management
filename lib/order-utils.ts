export interface LocalOrder {
  orderId: string;
  customer: string;
  phone: string; // Added phone property
  product: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingDetails: string;
  date: string;
  salesChannel?: string; // Added salesChannel property
  printStatus?: string; // Added printStatus property
  imageLinks?: ImageLink[]; // Added imageLinks property
}

export interface LocalOrderDetails {
  orderId: string;
  customer: string;
  phone: string; // Added phone property
  product: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingDetails: string;
  date: string;
  salesChannel?: string; // Added salesChannel property
  printStatus?: string; // Added printStatus property
  imageLinks?: ImageLink[]; // Added imageLinks property
}

export interface LocalOrderInterface {
  orderId: string;
  customer: string;
  phone: string; // Added phone property
  product: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  shippingStatus: string;
  shippingDetails: string;
  date: string;
  salesChannel?: string; // Added salesChannel property
  printStatus?: string; // Added printStatus property
  imageLinks?: ImageLink[]; // Added imageLinks property
}

import type { Order, DatabaseOrder, ImageLink } from "./types";

// Function to convert CSV order to database order
export function convertCsvToDbOrder(csvOrder: LocalOrderInterface): DatabaseOrder {
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

// Function to convert database order to app order
export function convertDbToAppOrder(dbOrder: DatabaseOrder): LocalOrderInterface {
  // Parse image links if they exist
  let imageLinks: ImageLink[] = [];
  if (dbOrder.imageLink) {
    try {
      imageLinks = JSON.parse(dbOrder.imageLink);
    } catch (e) {
      console.error("Error parsing image links:", e);
    }
  }

  return {
    orderId: dbOrder.orderId,
    customer: dbOrder.customerName,
    phone: dbOrder.phone ?? "N/A", // Provide a default value if phone is undefined
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
  };
}

// Function to convert database order to app order
export function localConvertDbToAppOrder(dbOrder: DatabaseOrder): LocalOrderInterface {
  // Parse image links if they exist
  let imageLinks: ImageLink[] = [];
  if (dbOrder.imageLink) {
    try {
      imageLinks = JSON.parse(dbOrder.imageLink);
    } catch (e) {
      console.error("Error parsing image links:", e);
    }
  }

  return {
    orderId: dbOrder.orderId,
    customer: dbOrder.customerName,
    phone: dbOrder.phone ?? "",
    product: dbOrder.product,
    total: dbOrder.total,
    orderStatus: dbOrder.orderStatus,
    paymentStatus: dbOrder.payStatus,
    shippingStatus: dbOrder.shipStatus,
    shippingDetails: dbOrder.shipDetail || "", // Ensure shipDetail is a string
    salesChannel: "website", // Default value
    date: dbOrder.date,
    printStatus: dbOrder.printStatus,
    imageLinks: imageLinks,
  };
}