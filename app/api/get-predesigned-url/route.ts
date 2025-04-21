// app/api/get-predesigned-url/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { designName } = await request.json();

    if (!designName || typeof designName !== "string") {
      return NextResponse.json({ error: "designName is required" }, { status: 400 });
    }

    const result = await prisma.predesignedDesign.findFirst({
      where: { name: { equals: designName, mode: "insensitive" } },
      select: { url: true },
    });

    if (!result || !result.url) {
      return NextResponse.json({ url: "/placeholder.svg" });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Error fetching predesigned URL:", error);
    return NextResponse.json({ url: "/placeholder.svg" }, { status: 500 });
  }
}
