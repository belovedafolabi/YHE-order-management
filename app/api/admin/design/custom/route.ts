import { type NextRequest, NextResponse } from "next/server"
import { upload } from "@/lib/cloudinary-server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { orderId, type, design, productIndex } = await request.json();
    let customDesign = await prisma.customDesign.findFirst({
      where: {
        orderId,
        type,
        itemNumber: productIndex,
      }
    })
    let fileUrl = await upload(
      design,
      type === "front"
      ? "yhe/customs-designs-front"
      : type === "back"
      ? "yhe/customs-designs-back"
      : type === "front-only"
      ? "yhe/customs-designs-front-only"
      : "yhe/customs-designs-back-only",
      `${orderId}-${productIndex}`
    )
    if(customDesign){
      customDesign = await prisma.customDesign.update({
        where: {
          id: customDesign.id,
          itemNumber: productIndex,
        },
        data: {
          url: fileUrl,
        }
      })
    } else {
      customDesign = await prisma.customDesign.create({
        data: {
          url: fileUrl,
          itemNumber: productIndex,
          orderId,
          type,
        }
      })
    }

    revalidatePath(`/order/${orderId}`)

    return NextResponse.json({ design: customDesign })
  } catch (error) {
    console.error("Error uploading design:", error)
    return NextResponse.json({ error: "Failed upload design" }, { status: 500 })
  }
}

