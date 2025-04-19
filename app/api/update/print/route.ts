import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Zod schema for validating input
const updatePrintStatusSchema = z.object({
  orderId: z.string().regex(/^\d+$/, { message: "Order ID must contain only numbers" }),
  printStatus: z.string().min(1, { message: "Print status is required" }),
});

// API route handler for POST requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, printStatus } = updatePrintStatusSchema.parse(body);
    let formattedOrderId = orderId.padStart(5, "0"); // Ensure orderId is a 5-digit string
    await prisma.order.update({
      where: { orderId: formattedOrderId },
      data: { printStatus },
    });

    // Revalidate relevant paths
    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");
    revalidatePath("/youcantseethis/manager");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error updating print status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
