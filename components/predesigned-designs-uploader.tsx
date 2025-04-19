"use client"

import React from "react"
import { useState, useRef } from "react"
import { z } from "zod"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { uploadPredesignedDesign } from "@/lib/actions"
import { uploadToCloudinary } from "@/app/api/cloudinary/route"
import { Upload, Loader2, Check, AlertCircle, ImageIcon } from "lucide-react"
import { upload } from "@/lib/cloudinary-server"
import axios from "axios"
import { revalidatePath } from "next/cache"

// Zod schema for file validation
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, `Max image size is 10MB.`)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
    "Only .jpg, .jpeg, .png formats are supported.",
  )

// Zod schema for design name validation
const designNameSchema = z
  .string()
  .min(3, "Design name must be at least 3 characters.")
  .max(50, "Design name must be less than 50 characters.")

// Zod schema for design ID validation
const designIdSchema = z
  .string()
  .min(3, "Design ID must be at least 3 characters.")
  .max(50, "Design ID must be less than 50 characters.")
  .refine((name) => /^[a-z0-9-]+$/.test(name), "Design ID must contain only lowercase letters, numbers, and hyphens.")

export function PredesignedDesignsUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [designId, setDesignId] = useState("")
  const [designName, setDesignName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast();

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      try {
        // Validate file using zod schema
        fileSchema.parse(selectedFile)
        setFile(selectedFile)
        setError(null)

        // Create preview URL
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)

        // Auto-generate design ID from filename
        const filename = selectedFile.name.split(".")[0]
        const sanitizedId = filename
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")

        setDesignId(sanitizedId)

        // Auto-generate design name from filename
        const nameFromFile = filename.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

        setDesignName(nameFromFile)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.errors[0].message)
          toast({
            title: "Invalid file",
            description: err.errors[0].message,
          })
        }
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      toast({
        title: "Missing file",
        description: "Please select an image file to upload",
      })
      return
    }

    try {
      let newFile = await readFileAsDataURL(file);
      let data = {
        file: newFile,
        designId: designId,
        designName: designName
      }
      // Validate design ID and name
      designIdSchema.parse(designId)
      designNameSchema.parse(designName)

      setUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(false)

      // Show loading toast
      const loadingToast = toast({
        title: "Uploading design",
        description: "Please wait while we upload your design",
      })

      console.log

      await axios.post("/api/admin/design", data, {
        headers: {
          "Content-Type": "application/json",
        },
        // onUploadProgress: (progressEvent) => {
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        //   setProgress(percentCompleted)
        // },
      }).then((response) => {
      } )
      .catch((error) => {
        console.log("Error uploading design:", error)
      })


      // Simulate progress
      // const interval = setInterval(() => {
      //   setProgress((prev) => {
      //     if (prev >= 95) {
      //       clearInterval(interval)
      //       return 95
      //     }
      //     return prev + 5
      //   })
      // }, 100)

      // Upload the file to Cloudinary
      // await uploadPredesignedDesign(file, designId, designName)
      // await upload(data.file, "yhe/predesigned", designId)
      // await uploadToCloudinary(file, {folder: "yhe/predesigned", public_id: designId})

      // clearInterval(interval)
      setProgress(100)
      setSuccess(true)

      // Dismiss loading toast
      loadingToast.dismiss()

      toast({
        title: "Design uploaded successfully",
        description: "Your predesigned t-shirt design has been uploaded",
      })

      // Reload the page on the client after 3 seconds
      setTimeout(() => {
        window.location.reload()
      }, 5000)

      

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null)
        setDesignId("")
        setDesignName("")
        setProgress(0)
        setSuccess(false)
        setPreviewUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 2000)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
        toast({
          title: "Validation error",
          description: err.errors[0].message,
        })
      } else if (err instanceof Error) {
        setError(err.message)
        toast({
          title: "Upload failed",
          description: err.message,
        })
      } else {
        setError("Failed to upload design")
        toast({
          title: "Upload failed",
          description: "There was an error uploading your design",
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <Card className="border-amber-500/20 shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Upload Predesigned Design</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="file">Design Image</Label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                id="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
                className="hidden"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={uploading}
                  className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 transition-all duration-300"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                {file && (
                  <span className="text-sm text-muted-foreground truncate max-w-full sm:max-w-[200px] self-center">
                    {file.name}
                  </span>
                )}
              </div>
              {previewUrl && (
                <div className="mt-4 border border-border rounded-md p-2 bg-muted/20">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-60 max-w-full rounded-md object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

            <div className="grid gap-2">
            <Label htmlFor="designName">Design Name</Label>
            <Input
              id="designName"
              value={designName}
              onChange={(e) => {
              const name = e.target.value
              setDesignName(name)

              // Auto-generate design ID from design name
              const sanitizedId = name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")
              setDesignId(sanitizedId)
              }}
              placeholder="e.g. Class of 2025"
              disabled={uploading}
              className="border-amber-500/20 focus-visible:ring-amber-500"
            />
            <p className="text-xs text-muted-foreground">Display name for the design that will be shown to users.</p>
            </div>

            <div className="grid gap-2">
            <Label htmlFor="designId">Design ID</Label>
            <Input
              id="designId"
              value={designId}
              onChange={(e) => setDesignId(e.target.value)}
              placeholder="e.g. class-of-2025"
              disabled={uploading}
              className="border-amber-500/20 focus-visible:ring-amber-500"
            />
            <p className="text-xs text-muted-foreground">
              Used for internal reference. Only lowercase letters, numbers, and hyphens.
            </p>
            </div>

          {uploading && (
            <div className="grid gap-2">
              <Progress value={progress} className="h-2 w-full shadow-amber" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Uploading... {progress}%</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Check className="h-4 w-4 flex-shrink-0" />
              Design uploaded successfully
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-amber-500 text-white hover:bg-amber-600 transition-all duration-300"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Design
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
