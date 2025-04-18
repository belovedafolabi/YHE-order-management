import { z } from "zod"

export interface Order {
  orderId: string
  customer: string
  product: string
  total: number
  orderStatus: string
  paymentStatus: string
  shippingStatus: string
  shippingDetails: string
  salesChannel: string
  date: string
  phoneNumber?: string
  imageLinks?: ImageLink[]
  printStatus?: string
}

export interface ProductInfo {
  name: string
  size?: string
  design?: string
  predesignedId?: string
}

export interface DatabaseOrder {
  orderId: string
  customerName: string
  phone?: string
  product: string
  total: number
  orderStatus: string
  payStatus: string
  shipStatus: string
  shipDetail: string
  date: string
  printStatus: string
  imageLink?: string // JSON string of ImageLink[]
}

export interface ImageLink {
  productIndex: number
  designType: "front" | "back" | "predesigned"
  url: string
  designId?: string
}

export const orderIdSchema = z.string().regex(/^\d+$/, {
  message: "Order ID must contain only numbers",
})

export interface CloudinaryImage {
  public_id: string
  secure_url: string
  filename: string
  created_at?: string
}
