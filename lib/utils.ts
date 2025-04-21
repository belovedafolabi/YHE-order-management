import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProductInfo, DesignDetails } from "./types"
import { getDesignByName } from "./predesigned-designs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// List of supported gun products
const GUN_NAMES = [
  "Water Shooting Play Gun Set",
  "AquaStrike Elite Veteran",
  "AquaStrike Elite Pro",
  "AquaStrike Elite Novice",
  "Play Gun Set Pistol",
]

// Format product name for display
export function formatProductName(productName: string): string {
  // Handle t-shirts
  if (productName.includes("Designed & Custom White T-Shirt")) {
    return "Designed & Custom White T-Shirt"
  }

  // Handle gun products
  if (productName.includes("AquaStrike Elite")) {
    if (productName.includes("Veteran")) return "AquaStrike Elite Veteran"
    if (productName.includes("Pro")) return "AquaStrike Elite Pro"
    if (productName.includes("Novice")) return "AquaStrike Elite Novice"
    return "AquaStrike Elite"
  }

  if (productName.includes("Play Gun Set Pistol")) {
    return "Play Gun Set Pistol"
  }

  if (productName.includes("Water Shooting Play Gun Set")) {
    return "Water Shooting Play Gun Set"
  }

  return productName
}

// Escape regex special characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Split a product string into individual entries by detecting each segment start (t-shirt or gun)
 */
export function splitProducts(productString: string): string[] {
  if (!productString) return []

  const starters = ["Designed & Custom White T-Shirt", ...GUN_NAMES]
  const escaped = starters.map(escapeRegex).join("|")
  const re = new RegExp(`(${escaped})([\\s\\S]*?)(?=(?:${escaped})|$)`, 'g')

  const entries = Array.from(
    productString.matchAll(re),
    m => m[0].trim().replace(/,$/, "")
  )

  return entries
}

/**
 * Parse a single product entry into structured info.
 */
export function parseProductInfo(productString: string): ProductInfo {
  const productInfo: ProductInfo = { name: productString.trim() }
  const lower = productString.toLowerCase()

  // 1. Gun products
  for (const gun of GUN_NAMES) {
    if (lower.includes(gun.toLowerCase())) {
      productInfo.name = gun
      const sizeMatch = productString.match(new RegExp(`${escapeRegex(gun)}.*?size:\s*([^,]+)`, 'i'))
      if (sizeMatch) productInfo.size = sizeMatch[1].trim().toUpperCase()
      return productInfo
    }
  }

  // 2. T-shirt prefix format
  const sizeDesignMatch = productString.match(/^([SMLX]+)-(.+)$/i)
  if (sizeDesignMatch && productString.includes("Designed & Custom White T-Shirt")) {
    productInfo.name = "Designed & Custom White T-Shirt"
    productInfo.size = sizeDesignMatch[1].toUpperCase()
    productInfo.design = sizeDesignMatch[2].trim()
    return productInfo
  }

  // 3. Extract size
  const sizeMatch = productString.match(/size:\s*([^,]+)/i)
  if (sizeMatch) {
    productInfo.size = sizeMatch[1].trim()
    if (productString.includes(", size:")) {
      productInfo.name = productString.split(", size:")[0].trim()
    }
  }

  // 4. Extract design for t-shirts
  const designMatch = productString.match(/design:\s*([^,]+)/i)
  if (designMatch) {
    let design = designMatch[1].trim()
    if (design.includes("(after order placement")) {
      design = design.split("(after order placement")[0].trim()
    }
    productInfo.design = design
    const predesigned = getDesignByName(design)
    if (predesigned) productInfo.predesignedId = predesigned.id
  }

  return productInfo
}

/**
 * Determine t-shirt type based on parsed ProductInfo
 */
export function getTShirtType(
  productInfo: ProductInfo,
): "plain" | "pre-designed" | "custom-front" | "custom-back" | "custom-front-back" | null {
  if (!productInfo.name.includes("Designed & Custom White T-Shirt")) return null
  if (!productInfo.design) return "plain"

  const design = productInfo.design.toLowerCase()
  if (design.includes("plain white t shirt")) return "plain"
  if (design.includes("t shirt front custom design")) return "custom-front"
  if (design.includes("t shirt back custom design")) return "custom-back"
  if (design.includes("front") && design.includes("back")) return "custom-front-back"
  if (productInfo.predesignedId || getDesignByName(productInfo.design)) return "pre-designed"

  return "pre-designed"
}

/**
 * Check if a product is a gun
 */
export function isGunProduct(productName: string): boolean {
  return GUN_NAMES.some(gun => productName.includes(gun))
}

export function extractDesignDetailsFromUrl(url: string): DesignDetails | null {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split("/");

    // Example folder: 'customs-designs-front'
    const folderName = pathSegments.find((segment) =>
      segment.startsWith("customs-designs-")
    );

    // Extract type from folder name
    const type = folderName?.split("customs-designs-")[1];

    // Get the filename (e.g., 00001-1.png)
    const filename = pathSegments[pathSegments.length - 1];

    // Extract item number from filename: e.g., 00001-1.png → itemNumber = 1
    const match = filename.match(/-(\d+)\./);
    const itemNumber = match ? parseInt(match[1], 10) : NaN;

    if (!type || isNaN(itemNumber)) return null;

    return { type, itemNumber };
  } catch (error) {
    console.error("Invalid URL or format:", error);
    return null;
  }
}