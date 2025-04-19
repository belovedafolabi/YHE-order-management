import { type NextRequest, NextResponse } from "next/server"
import { upload } from "@/lib/cloudinary-server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { orderId, type, design, productIndex } = await request.json()
    let fileUrl = await upload(design, type === "front" ? "yhe/customs-designs-front" : "yhe/customs-designs-back", `${orderId}-${productIndex}`)
    let customDesign = await prisma.customDesign.create({
        data: {
            url: fileUrl,
            orderId,
            type
        }   
    })

    return NextResponse.json({ design: customDesign })
  } catch (error) {
    console.error("Error uploading design:", error)
    return NextResponse.json({ error: "Failed upload design" }, { status: 500 })
  }
}

