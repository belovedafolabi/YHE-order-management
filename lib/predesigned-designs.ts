import axios from "axios";

// Conditionally import Prisma only in server-side environment
let prisma: typeof import("@/lib/prisma")["default"]

if (typeof window === "undefined") {
  // Only import Prisma on the server
  (async () => {
    prisma = (await import("./prisma")).default
  })()
}

// DO NOT MOVE — required at the top
export const predesignedDesigns = [
  { id: "class-of-2025", name: "Class of 2025", path: "yhe/predesigned/class-of-2025" },
  { id: "deserve-an-award", name: "5 years later... I deserve an award", path: "yhe/predesigned/deserve-an-award" },
  { id: "made-in-abuad", name: "Made in ABUAD, upgraded for the world", path: "yhe/predesigned/made-in-abuad" },
  { id: "lawyer-in-progress", name: "Lawyer in progress – no objection!", path: "yhe/predesigned/lawyer-in-progress" },
  { id: "coding-my-way", name: "Coding my way to the future – ABUAD CS", path: "yhe/predesigned/coding-my-way" },
  { id: "results-dey", name: "Results dey, degrees dey, no wahala!", path: "yhe/predesigned/results-dey" },
  { id: "no-be-beans", name: "No be beans! Graduate mode activated", path: "yhe/predesigned/no-be-beans" },
  { id: "plain-white", name: "Plain white t-shirt", path: "yhe/predesigned/plain-white" },
]

// Function to get the Cloudinary URL for a given public ID
export function getCloudinaryUrl(publicId: string): string {
  if (!publicId) {
    throw new Error("Public ID is required to generate Cloudinary URL")
  }

  const cloudName = "your-cloud-name" // Replace with your Cloudinary cloud name
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
}
// Function to get design by name or partial match
export async function getDesignByName(designName: string): Promise<{ id: string; name: string; path: string } | null> {
  if (!designName) return null

  const lowerDesignName = designName.toLowerCase()

  try {
    const dbDesign = typeof window === "undefined"
      ? await prisma?.predesignedDesign.findFirst({
          where: {
            OR: [
              { designId: { contains: lowerDesignName, mode: "insensitive" } },
              { name: { contains: lowerDesignName, mode: "insensitive" } },
            ],
          },
        })
      : null

    if (dbDesign) {
      return {
        id: dbDesign.designId,
        name: dbDesign.name,
        path: dbDesign.path,
      }
    }

    const exactMatch = predesignedDesigns.find((design) => design.name.toLowerCase() === lowerDesignName)
    if (exactMatch) return exactMatch

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
    const dbDesigns = typeof window === "undefined"
      ? await prisma?.predesignedDesign.findMany()
      : []

    const designs = dbDesigns?.map((design) => ({
      id: design.designId,
      name: design.name,
      path: design.path,
    })) || []

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
    if (typeof window === "undefined") {
      await prisma?.predesignedDesign.upsert({
        where: { designId },
        update: { name, path, publicId },
        create: { designId, name, path: publicId, publicId },
      })
    }

    return true
  } catch (error) {
    console.error("Error saving predesigned design:", error)
    return false
  }
}

// Cloudinary server-side functions

export async function getCloudinaryImages(folder: string): Promise<Array<{ public_id: string; secure_url: string; filename: string }>> {
  try {
    if (typeof window !== "undefined") {
      throw new Error("This function can only be called on the server side.");
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing Cloudinary environment variables.");
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const response = await axios.get(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        params: {
          prefix: folder, // Specify the folder to filter images
        },
      }
    );

    return response.data.resources.map((resource: { public_id: string; secure_url: string }) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      filename: resource.public_id.split("/").pop() || resource.public_id, // Extract filename from public_id
    }));
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
    return [];
  }
}

export async function uploadToCloudinary(file: File): Promise<string> {
  return "uploaded-image-public-id"
}
