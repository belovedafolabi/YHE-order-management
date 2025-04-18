import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProductInfo } from "./types"
import { getDesignByName } from "./predesigned-designs"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export function parseProductInfo(productString: string): ProductInfo {
  const productInfo: ProductInfo = {
    name: productString.trim(),
  }

  // Check if this is a t-shirt with size in the format "S-..." or "M-..."
  const sizeDesignMatch = productString.match(/^([SMLX]+)-(.+)$/)
  if (sizeDesignMatch && productString.includes("Designed & Custom White T-Shirt")) {
    const size = sizeDesignMatch[1]
    const design = sizeDesignMatch[2]

    productInfo.name = "Designed & Custom White T-Shirt"
    productInfo.size = size
    productInfo.design = design
    return productInfo
  }

  // Extract size from "size: X" format
  const sizeMatch = productString.match(/size:\s*([^,]+)/i)
  if (sizeMatch) {
    productInfo.size = sizeMatch[1].trim()
    // Remove the size part from the name if it's in the name
    if (productString.includes(", size:")) {
      productInfo.name = productString.split(", size:")[0].trim()
    }
  }

  // Extract design for t-shirts
  const designMatch = productString.match(/design:\s*([^,]+)/i)
  if (designMatch) {
    // Get everything after "design: " until the end or until "(after order placement"
    let design = designMatch[1].trim()
    if (design.includes("(after order placement")) {
      design = design.split("(after order placement")[0].trim()
    }
    productInfo.design = design

    // Check if this is a predesigned design
    const predesignedDesign = getDesignByName(design)
    if (predesignedDesign) {
      productInfo.predesignedId = predesignedDesign.id
    }
  }

  return productInfo
}

// Improved function to split multiple products in a single string
export function splitProducts(productString: string): string[] {
  if (!productString) return []

  // Handle the case where products are already in the format "S-Plain White T Shirt"
  if (productString.match(/^[SMLX]+-.+$/)) {
    return [productString]
  }

  // First, try to split by "Designed & Custom White T-Shirt" occurrences after the first one
  const tshirtMatches = productString.match(/Designed & Custom White T-Shirt/g)
  if (tshirtMatches && tshirtMatches.length > 1) {
    const products: string[] = []
    const remainingString = productString
    let startIndex = 0

    // Find the first occurrence
    const firstIndex = remainingString.indexOf("Designed & Custom White T-Shirt")
    if (firstIndex >= 0) {
      startIndex = firstIndex

      // Find each subsequent occurrence and split
      while (true) {
        const nextIndex = remainingString.indexOf("Designed & Custom White T-Shirt", startIndex + 1)
        if (nextIndex === -1) break

        // Add the product up to the next occurrence
        products.push(remainingString.substring(startIndex, nextIndex).trim())

        // Update the remaining string and start index
        startIndex = nextIndex
      }

      // Add the last product
      products.push(remainingString.substring(startIndex).trim())

      return products
    }
  }

  // Try to identify products by looking for patterns like "size: X" followed by another "size: Y"
  const sizeMatches = productString.match(/size:\s*[^,]+/gi)
  if (sizeMatches && sizeMatches.length > 1) {
    const products: string[] = []
    let currentProduct = ""
    let inDesignSection = false

    // Split by commas, but be careful with design sections that contain commas
    const parts = productString.split(",")

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim()

      // If this part contains "size:" and it's not the first part and we're not in a design section
      if (part.includes("size:") && i > 0 && !inDesignSection && currentProduct) {
        // This is the start of a new product
        products.push(currentProduct.trim())
        currentProduct = part
      }
      // If this part contains "design:", we're in a design section
      else if (part.includes("design:")) {
        inDesignSection = true
        currentProduct += ", " + part
      }
      // If we're in a design section and this part contains "requested)", end of design section
      else if (inDesignSection && part.includes("requested)")) {
        inDesignSection = false
        currentProduct += ", " + part
      }
      // Otherwise, just append to current product
      else {
        if (currentProduct) {
          currentProduct += ", " + part
        } else {
          currentProduct = part
        }
      }
    }

    // Add the last product if there is one
    if (currentProduct) {
      products.push(currentProduct.trim())
    }

    // Clean up products - remove any that are just empty or whitespace
    return products.filter((p) => p.trim().length > 0)
  }

  // If we couldn't split, return the original as a single product
  return [productString]
}

// Function to determine t-shirt type
export function getTShirtType(
  productInfo: ProductInfo,
): "plain" | "pre-designed" | "custom-front" | "custom-front-back" | null {
  if (!productInfo.name.includes("Designed & Custom White T-Shirt")) {
    return null
  }

  if (!productInfo.design) {
    return "plain"
  }

  // Check for plain white t-shirt
  if (productInfo.design.toLowerCase().includes("plain white t shirt")) {
    return "plain"
  }

  // Check for front custom design
  if (productInfo.design.toLowerCase().includes("front custom design")) {
    return "custom-front"
  }

  // Check for front & back custom design (various formats)
  // This is the key fix for the data issue where "&" is replaced with ","
  const design = productInfo.design.toLowerCase()
  if (
    design.includes("front , back custom design") ||
    design.includes("front ,back custom design") ||
    design.includes("front, back custom design") ||
    design.includes("front,back custom design") ||
    design.includes("front and back custom design") ||
    design.includes("front back custom design") ||
    design.includes("front & back custom design") ||
    // Additional patterns to catch more variations
    design.match(/front\s*[,&]\s*back\s*custom\s*design/) !== null ||
    design.includes("front and back") ||
    (design.includes("front") && design.includes("back"))
  ) {
    return "custom-front-back"
  }

  // Check if this is a predesigned design
  if (productInfo.predesignedId || getDesignByName(productInfo.design)) {
    return "pre-designed"
  }

  // If it's a t-shirt but not plain or custom, it must be pre-designed
  return "pre-designed"
}

// Function to check if a product is a gun
export function isGunProduct(productName: string): boolean {
  return (
    productName.includes("AquaStrike") || productName.includes("Play Gun Set") || productName.includes("Water Shooting")
  )
}
