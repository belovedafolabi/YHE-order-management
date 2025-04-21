"use client"

import { useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface DesignPreviewProps {
  designUrl: string
  designType: "front" | "back" | "front-only" | "back-only"
  productName?: string
  className?: string
  showDownload?: boolean
}

export function DesignPreview({
  designUrl,
  designType,
  productName,
  className,
  showDownload = false,
}: DesignPreviewProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  // For demo purposes, we'll use a placeholder if no real URL is provided
  // const imageUrl = .startsWith("http")
  //   ? designUrl
  //   : `/placeholder.svg?height=400&width=400&text=${designType === "front" ? "Front" : "Back"}+Design`

/*   const handleDownload = () => {
    // Create an anchor element and set properties for download
    const link = document.createElement("a")
    link.href = designUrl
    link.download = `${designType}-design-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: `Downloading ${designType} design`,
    })
  } */

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob
      const response = await fetch(designUrl, { mode: 'cors' })
      if (!response.ok) throw new Error("Failed to fetch image")
  
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
  
      // Create and trigger download link
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${designType}-design-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
  
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl)
  
      toast({
        title: "Download started",
        description: `Downloading ${designType} design`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download failed",
        description: "There was a problem downloading the file.",
        variant: "destructive",
      })
    }
  }
    

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "relative overflow-hidden rounded-md border border-amber-500/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300",
          "hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/10",
          className,
        )}
      >
        <img
          src={designUrl || "/placeholder.svg"}
          alt={`${designType} design`}
          className="h-full w-full object-cover aspect-square"
          loading="lazy"
          onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128&text=No+Image+Available";
          (e.target as HTMLImageElement).alt = "No image available";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-medium text-white px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
        View {designType} design
          </span>
        </div>
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>
              {designType.charAt(0).toUpperCase() + designType.slice(1)} Design
              {productName && ` - ${productName}`}
            </DrawerTitle>
            <DrawerDescription>Preview the uploaded design</DrawerDescription>
          </DrawerHeader>
          <div className="flex items-center justify-center p-4 md:p-6">
            <div className="relative max-w-full max-h-[60vh] overflow-hidden">
              <img
                src={designUrl || "/placeholder.svg"}
                alt={`${designType} design`}
                className="max-h-[60vh] max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128&text=No+Image+Available";
                  (e.target as HTMLImageElement).alt = "No image available";
                }}
              />
            </div>
          </div>
          <DrawerFooter className="border-t border-border">
            <div className="flex gap-2">
              {showDownload && (
                <Button
                  onClick={handleDownload}
                  className="bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Design
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline" className="transition-colors duration-300">
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
