"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, Check, AlertCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { uploadDesign } from "@/lib/actions"
import axios from "axios"
// import { fileSchema } from "@/lib/actions"

interface FileUploadProps {
  label: string
  orderId: string
  designType: "front" | "back" | "front-only" | "back-only"
  productIndex?: number
  setPreview: any
}

export function FileUpload({ label, orderId, designType, productIndex = 0, setPreview }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast();

  const [isReady, setIsReady] = useState(true);

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      try {
        // Validate file using zod schema
        // fileSchema.parse(selectedFile)
        let image = await readFileAsDataURL(selectedFile);
        // console.log(image)
        setPreview(image)
        setLocalPreview(image)
        setFile(selectedFile)
        setError(null)
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
    if (!localPreview) return

    setUploading(true)
    setProgress(0)

    try {
      // Show loading toast
      const loadingToast = toast({
        title: `Uploading ${designType} design`,
        description: "Please wait while we upload your design",
      })
      
      let data = {
        orderId,
        type: designType,
        design: localPreview,
        productIndex
      }
      await axios.post("/api/admin/design/custom", data)
      .then((response)=>{
        console.log(response.data)
      })
      .catch((error)=>{
        console.log(error)
      })
      setProgress(100)
      setUploaded(true)

      // Dismiss loading toast
      loadingToast.dismiss()

      toast({
        title: "Design uploaded successfully",
        description: "Your design has been uploaded and linked to your order",
      })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to upload file")
      }

      toast({
        title: "Upload failed",
        description: "There was an error uploading your design",
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">{label}</div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".png,.jpg,.jpeg,image/png,image/jpeg,image/jpg"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={uploading}
          className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 w-full sm:w-auto transition-all duration-300 button-hover shadow-amber"
        >
          Select File
        </Button>
        {file && (
          <span className="text-sm text-muted-foreground truncate max-w-full sm:max-w-[200px]">{file.name}</span>
        )}
      </div>

      {/* {isReady && (
        <Button
          type="button"
          size="sm"
          onClick={handleUpload}
          className="mt-2 w-full bg-amber-500 text-white hover:bg-amber-600 transition-all duration-300 button-hover shadow-amber"
        >
          <Upload className="mr-2 h-4 w-4" />
          Save Design
        </Button>
      )} */}

      {file && !uploaded && !uploading && (
        <Button
          type="button"
          size="sm"
          onClick={handleUpload}
          className="mt-2 w-full bg-amber-500 text-white hover:bg-amber-600 transition-all duration-300 button-hover shadow-amber"
        >
          <Upload className="mr-2 h-4 w-4" />
          Save Design
        </Button>
      )}

      {uploading && (
        <div className="mt-2 grid gap-2">
          <Progress value={progress} className="h-2 w-full shadow-amber" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading... {progress}%</span>
          </div>
        </div>
      )}

      {uploaded && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
          <Check className="h-4 w-4 flex-shrink-0" />
          Design uploaded successfully
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
