import type { Metadata } from "next"
import { fetchAllOrdersFromDb } from "@/lib/data"
import { ManagerOrdersTable } from "@/components/manager-order-table"

export const metadata: Metadata = {
  title: "YHE OrderTrack - Admin Dashboard",
  description: "Manage all orders in the system",
}

export default async function AdminPage() {
  const orders = await fetchAllOrdersFromDb()

  return (
    <div className="grid gap-6 md:gap-8 animate-slide-up">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Order Management</h1>
      <ManagerOrdersTable orders={orders} />
    </div>
  )
}
