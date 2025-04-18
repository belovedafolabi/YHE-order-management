import { getCloudinaryUrl, getCloudinaryImages, uploadToCloudinary } from "./cloudinary"
import prisma from "./prisma"

// Predesigned t-shirt designs with their display names and image paths
export const predesignedDesigns = [
  { id: "class-of-2025", name: "Class of 2025", path: "yhe/predesigned/class-of-2025" },
  { id: "deserve-an-award", name: "5 years later... I deserve an award", path: "yhe/predesigned/deserve-an-award" },
  { id: "made-in-abuad", name: "Made in ABUAD, upgraded for the world", path: "yhe/predesigned/made-in-abuad" },
  {
    id: "lawyer-in-progress",
    name: "Lawyer in progress – no objection!",
    path: "yhe/predesigned/lawyer-in-progress",
  },
  { id: "coding-my-way", name: "Coding my way to the future – ABUAD CS", path: "yhe/predesigned/coding-my-way" },
  { id: "results-dey", name: "Results dey, degrees dey, no wahala!", path: "yhe/predesigned/results-dey" },
  { id: "no-be-beans", name: "No be beans! Graduate mode activated", path: "yhe/predesigned/no-be-beans" },
  { id: "plain-white", name: "Plain white t-shirt", path: "yhe/predesigned/plain-white" },
]

// Function to get design by name or partial match
export async function getDesignByName(designName: string): Promise<{ id: string; name: string; path: string } | null> {
  if (!designName) return null

  const lowerDesignName = designName.toLowerCase()

  try {
    // First, check the database
    const dbDesign = await prisma.predesignedDesign.findFirst({
      where: {
        OR: [
          { designId: { contains: lowerDesignName, mode: "insensitive" } },
          { name: { contains: lowerDesignName, mode: "insensitive" } },
        ],
      },
    })

    if (dbDesign) {
      return {
        id: dbDesign.designId,
        name: dbDesign.name,
        path: dbDesign.path,
      }
    }

    // If not found in the database, check the hardcoded list
    // Try to find an exact match first
    const exactMatch = predesignedDesigns.find((design) => design.name.toLowerCase() === lowerDesignName)

    if (exactMatch) return exactMatch

    // If no exact match, try to find a partial match
    const partialMatch = predesignedDesigns.find(
      (design) => lowerDesignName.includes(design.id) || design.name.toLowerCase().includes(lowerDesignName),
    )

    return partialMatch || null
  } catch (error) {
    console.error("Error getting design by name:", error)
    return null
  }
}

// Function to get all predesigned designs
export async function getAllPredesignedDesigns(): Promise<Array<{ id: string; name: string; path: string }>> {
  try {
    // Get designs from the database
    const dbDesigns = await prisma.predesignedDesign.findMany()

    // Convert to the expected format
    const designs = dbDesigns.map((design) => ({
      id: design.designId,
      name: design.name,
      path: design.path,
    }))

    // Add hardcoded designs that aren't in the database
    for (const design of predesignedDesigns) {
      if (!designs.some((d) => d.id === design.id)) {
        designs.push(design)
      }
    }

    return designs
  } catch (error) {
    console.error("Error getting all predesigned designs:", error)
    return predesignedDesigns
  }
}

// Function to save a predesigned design to the database
export async function savePredesignedDesign(
  designId: string,
  name: string,
  path: string,
  publicId: string,
): Promise<boolean> {
  try {
    await prisma.predesignedDesign.upsert({
      where: {
        designId: designId,
      },
      update: {
        name: name,
        path: path,
        publicId: publicId,
      },
      create: {
        designId: designId,
        name: name,
        path: publicId,
        publicId: publicId,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving predesigned design:", error)
    return false
  }
}

// Export Cloudinary functions
export { getCloudinaryUrl, getCloudinaryImages, uploadToCloudinary }
