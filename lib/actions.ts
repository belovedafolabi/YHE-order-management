"use server"

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updatePhoneNumber, updateImageLink, updatePrintStatus } from "./db-service";
import { uploadToCloudinary } from "../app/api/cloudinary/route";
import { savePredesignedDesign } from "./predesigned-designs";
import type { ImageLink } from "./types";

// Helper function to validate files
function validateFile(file: File): void {
  const fileSchema = z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, `Max image size is 10MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
      "Only .jpg, .jpeg, .png formats are supported."
    );

  fileSchema.parse(file);
}

// Zod schema for phone number validation
export const phoneNumberSchema = z.string().regex(/^\d{11}$/, {
  message: "Phone number must be exactly 11 digits and contain only numbers",
});

// Zod schema for order ID validation
export const orderIdSchema = z.string().regex(/^\d+$/, {
  message: "Order ID must contain only numbers",
});

// Function to upload design image
export async function uploadDesign(
  file: File,
  orderId: string,
  designType: string,
  productIndex: number
): Promise<{ url: string }> {
  try {
    // Validate file
    validateFile(file);

    // Generate a unique filename
    const filename = `${orderId}-${designType}-${productIndex}`;

    // Determine the folder based on design type
    const folder = designType === "front" ? "yhe/frontDesign" : "yhe/backDesign";

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, {
      folder: folder,
      public_id: filename,
    });

    // Create image link object
    const imageLink: ImageLink = {
      productIndex: productIndex,
      designType: designType as "front" | "back",
      url: result.secure_url,
    };

    // Update the order with the new image link
    // First, get existing image links
    const order = await fetch(`/api/order/${orderId}`).then((res) => res.json());
    const existingLinks = order.imageLinks || [];

    // Filter out any existing links for this product and design type
    const filteredLinks = existingLinks.filter(
      (link: ImageLink) => !(link.productIndex === productIndex && link.designType === designType)
    );

    // Add the new link
    const updatedLinks = [...filteredLinks, imageLink];

    // Save to database
    await updateImageLink(orderId, updatedLinks);

    // Revalidate the order page to show the uploaded design
    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");

    return { url: result.secure_url };
  } catch (error) {
    console.error("Error uploading design:", error);
    throw new Error("Failed to upload design");
  }
}

// Function to upload predesigned design
export async function uploadPredesignedDesign(
  file: File,
  designId: string,
  designName: string
): Promise<{ url: string }> {
  try {
    // Validate file
    validateFile(file);

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, {
      folder: "yhe/predesigned",
      public_id: designId,
    });

    // Save to database
    await savePredesignedDesign(designId, designName, `yhe/predesigned/${designId}`, result.public_id);

    // Revalidate paths
    revalidatePath("/youcantseethis/predesigned-designs");

    return { url: result.secure_url };
  } catch (error) {
    console.error("Error uploading predesigned design:", error);
    throw new Error("Failed to upload predesigned design");
  }
}

// Function to update order status
export async function updateOrderStatus(orderId: string, status: string, type: "print"): Promise<void> {
  try {
    await updatePrintStatus(orderId, status);

    // Revalidate the paths to reflect the changes
    revalidatePath(`/order/${orderId}`);
    revalidatePath("/youcantseethis");

    return Promise.resolve();
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Failed to update order status");
  }
}

// Function to save phone number
export async function savePhoneNumber(orderId: string, phone: string): Promise<void> {
  console.log("savePhoneNumber called with:", orderId, phone);
  try {
    // Validate orderId
    orderIdSchema.parse(orderId);
    console.log("Order ID validated:", orderId);

    // Validate phone number
    phoneNumberSchema.parse(phone);
    console.log("Phone number validated:", phone);

    // Update phone number in the database
    await updatePhoneNumber(orderId, phone);
    console.log("Phone number saved successfully");
  } catch (error) {
    console.error("Error saving phone number:", error);
    throw new Error("Failed to save phone number");
  }
}
