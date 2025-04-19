import type { Metadata } from "next"
import { AdminOrdersTable } from "@/components/admin-orders-table"
import { getAllOrders } from "@/lib/data"

export const metadata: Metadata = {
  title: "YHE OrderTrack - Admin Dashboard",
  description: "Manage all orders in the system",
}

export default async function AdminPage() {
  const orders = await getAllOrders()

  return (
    <div className="grid gap-6 md:gap-8 animate-slide-up">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Order Management</h1>
      <AdminOrdersTable orders={orders} />
    </div>
  )
}
