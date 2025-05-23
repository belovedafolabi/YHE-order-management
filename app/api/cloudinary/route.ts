import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload an image to Cloudinary
export async function uploadToCloudinary(
  file: File | Buffer,
  options: { folder: string; public_id?: string },
): Promise<{ secure_url: string; public_id: string }> {
  try {
    if (file instanceof File) {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options.folder,
            public_id: options.public_id,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          },
        )

        uploadStream.end(buffer)
      })

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      }
    } else {
      // Upload Buffer directly
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options.folder,
            public_id: options.public_id,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          },
        )

        uploadStream.end(file)
      })

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      }
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

// Function to get all images from a Cloudinary folder
export async function getCloudinaryImages(
  folder: string,
): Promise<Array<{ public_id: string; secure_url: string; filename: string; created_at?: string }>> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute()

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      filename: resource.public_id.split("/").pop() || "",
      created_at: resource.created_at,
    }))
  } catch (error) {
    console.error("Error getting images from Cloudinary:", error)
    throw new Error("Failed to get images from Cloudinary")
  }
}

// Function to get Cloudinary URL
export function getCloudinaryUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ width: "auto", crop: "scale", quality: "auto" }],
  })
}

// Function to delete an image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const { file, options } = await req.json();
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.public_id,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(Buffer.from(file, "base64"));
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
