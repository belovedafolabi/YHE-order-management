import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const metadata: Metadata = {
  title: "YHE OrderTrack - Order Management System",
  description: "Track and manage your orders with ease",
}

export default function Home() {
  return <ClientPage />
}
