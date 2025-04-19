import { type NextRequest, NextResponse } from "next/server"
import { upload } from "@/lib/cloudinary-server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { file, designId, designName } = await request.json()
    let fileUrl = await upload(file, "yhe/predesigned-designs", designId)
    let design = await prisma.predesignedDesign.create({
        data: {
            url: fileUrl,
            designId,
            name: designName,
        }   
    })
    revalidatePath("/youcantseethis/predesigned-designs")

    return NextResponse.json({ design })
  } catch (error) {
    console.error("Error uploading design:", error)
    return NextResponse.json({ error: "Failed upload design" }, { status: 500 })
  }
}


export async function GET(request: NextRequest) {
  try {
    let predesignedDesigns = await prisma.predesignedDesign.findMany()
    return NextResponse.json({ designs: predesignedDesigns })
  } catch (error) {
    console.error("Error uploading design:", error)
    return NextResponse.json({ error: "Failed upload design" }, { status: 500 })
  }
}

