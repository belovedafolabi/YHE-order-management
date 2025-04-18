import type { Metadata } from "next"
import { PredesignedDesignsUploader } from "@/components/predesigned-designs-uploader"
import { PredesignedDesignsTable } from "@/components/predesigned-designs-table"

export const metadata: Metadata = {
  title: "YHE OrderTrack - Predesigned Designs Management",
  description: "Upload and manage predesigned t-shirt designs",
}

export default async function PredesignedDesignsPage() {
  return (
    <div className="grid gap-6 md:gap-8 animate-slide-up">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Predesigned T-Shirt Designs</h1>

      <div className="grid gap-8">
        <PredesignedDesignsUploader />
        <PredesignedDesignsTable />
      </div>
    </div>
  )
}
