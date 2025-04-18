"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getCloudinaryImages, getCloudinaryUrl } from "@/lib/predesigned-designs"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PredesignedDesignPreview } from "@/components/predesigned-design-preview"

export function PredesignedDesignsTable() {
  const [images, setImages] = useState<Array<{ public_id: string; secure_url: string; filename: string }> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)
      try {
        const data = await getCloudinaryImages("yhe/predesigned")
        setImages(data)
      } catch (error) {
        console.error("Failed to load images:", error)
        toast({
          variant: "destructive",
          title: "Failed to load images",
          description: "There was an error loading the predesigned designs",
        })
        setImages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [toast])

  const handleDownload = (publicId: string, filename: string) => {
    const url = getCloudinaryUrl(publicId)
    const link = document.createElement("a")
    link.href = url
    link.download = filename || `design-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: `Downloading ${filename}`,
      variant: "success",
    })
  }

  const handlePreview = (publicId: string) => {
    setSelectedDesign(publicId)
    setIsPreviewOpen(true)
  }

  return (
    <Card className="border-amber-500/20 shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Predesigned Designs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Public ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-24 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-60" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-24 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              ) : images && images.length > 0 ? (
                images.map((image) => (
                  <TableRow key={image.public_id}>
                    <TableCell>
                      <img
                        src={getCloudinaryUrl(image.public_id) || "/placeholder.svg"}
                        alt={image.filename}
                        className="h-24 w-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(image.public_id)}
                      />
                    </TableCell>
                    <TableCell>{image.filename}</TableCell>
                    <TableCell className="font-mono text-xs truncate max-w-[200px]">{image.public_id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(image.public_id)}
                          className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(image.public_id, image.filename)}
                          className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500"
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No images found. Upload some designs to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {selectedDesign && (
        <PredesignedDesignPreview
          designId={selectedDesign.split("/").pop() || ""}
          designName={images?.find((img) => img.public_id === selectedDesign)?.filename || "Design"}
          showDownload={true}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      )}
    </Card>
  )
}
