"use client"

import { useEffect, useState } from "react"
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

interface PredesignedDesignPreviewProps {
  designId: string
  designName: string
  className?: string
  showDownload?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PredesignedDesignPreview({
  designId,
  designName,
  className,
  showDownload = false,
  open: controlledOpen,
  onOpenChange,
}: PredesignedDesignPreviewProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("/placeholder.svg")
  const { toast } = useToast()

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen)
    }
  }, [controlledOpen])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  // Fetch image URL from backend API
  useEffect(() => {
    const fetchDesignUrl = async () => {
      try {
        const res = await fetch("/api/get-predesigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designName }),
        })
        const data = await res.json()
        setUrl(data.url || "/placeholder.svg")
      } catch (err) {
        console.error("Failed to fetch design URL:", err)
        setUrl("/placeholder.svg")
      }
    }

    fetchDesignUrl()
  }, [designName])

/*   const handleDownload = () => {
    const link = document.createElement("a")
    link.href = url
    link.download = `${designId}-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: `Downloading ${designName}`,
    })
  } */

  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
  
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = `${designId}-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
  
      toast({
        title: "Download started",
        description: `Downloading ${designName}`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Something went wrong while downloading.",
        variant: "destructive",
      })
    }
  }
    

  return (
    <>
      {!controlledOpen && (
        <button
          onClick={() => handleOpenChange(true)}
          className={cn(
            "relative overflow-hidden rounded-md border border-amber-500/20 bg-muted/30 hover:bg-muted/50 transition-all duration-300",
            "hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/10",
            className,
          )}
        >
          <img
            src={url}
            alt={`${designName} design`}
            className="h-full w-full object-cover aspect-square"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128&text=No+Image+Available"
              ;(e.target as HTMLImageElement).alt = "No image available"
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-medium text-white px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
              View design
            </span>
          </div>
        </button>
      )}

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b border-border">
            <DrawerTitle>{designName}</DrawerTitle>
            <DrawerDescription>Preview the predesigned t-shirt design</DrawerDescription>
          </DrawerHeader>
          <div className="flex items-center justify-center p-4 md:p-6">
            <div className="relative max-w-full max-h-[60vh] overflow-hidden">
              <img
                src={url}
                alt={`${designName} design`}
                className="max-h-[60vh] max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128&text=No+Image+Available"
                  ;(e.target as HTMLImageElement).alt = "No image available"
                }}
                loading="lazy"
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
