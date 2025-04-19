"use client"

import { useState, useEffect } from "react"
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
import { getCloudinaryUrl } from "@/lib/predesigned-designs"
import { useToast } from "@/hooks/use-toast"

interface PredesignedDesignPreviewProps {
  url: string
  designId: string
  designName: string
  className?: string
  showDownload?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const predesignedDesigns = [
  { id: "class-of-2025", name: "Class of 2025", path: "yhe/predesigned/class-of-2025" },
  { id: "deserve-an-award", name: "5 years later... I deserve an award", path: "yhe/predesigned/deserve-an-award" },
  { id: "made-in-abuad", name: "Made in ABUAD, upgraded for the world", path: "yhe/predesigned/made-in-abuad" },
  { id: "lawyer-in-progress", name: "Lawyer in progress – no objection!", path: "yhe/predesigned/lawyer-in-progress" },
  { id: "coding-my-way", name: "Coding my way to the future – ABUAD CS", path: "yhe/predesigned/coding-my-way" },
  { id: "results-dey", name: "Results dey, degrees dey, no wahala!", path: "yhe/predesigned/results-dey" },
  { id: "no-be-beans", name: "No be beans! Graduate mode activated", path: "yhe/predesigned/no-be-beans" },
  { id: "vini-vidi-vici", name: "Vini Vidi Vici", path: "yhe/predesigned/vini-vidi-vici" },
  { id: "plain-white", name: "Plain white t-shirt", path: "yhe/predesigned/plain-white" },
]

export function PredesignedDesignPreview({
  url,
  designId,
  designName,
  className,
  showDownload = false,
  open: controlledOpen,
  onOpenChange,
}: PredesignedDesignPreviewProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  // Handle controlled/uncontrolled state
  useEffect(() => {
    if (controlledOpen !== undefined) {
      setOpen(controlledOpen)
    }
  }, [controlledOpen])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  // Get the image URL from the design ID
  // const imageUrl = getCloudinaryUrl(`yhe/predesigned/${designId}`)

  const handleDownload = () => {
    // Create an anchor element and set properties for download
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
