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
import axios from "axios"

export function PredesignedDesignsTable() {
  const [preview, setPreview] = useState<{ url: string, designName: string, designId: string } | null>(null)
  const [designs, setDesigns] = useState<any[]>([])
  const [images, setImages] = useState<Array<{ public_id: string; secure_url: string; filename: string }> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)
      try {
        const data = await axios.get("/api/admin/design")
        console.log("Fetched designs:", data.data.designs)
        setDesigns(data.data.designs)
        // setImages(data.data.designs)
      } catch (error) {
        console.error("Failed to load images:", error)
        toast({
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

  // const handleDownload = (url: string, filename: string) => {
  //   const link = document.createElement("a")
  //   link.href = url
  //   link.download = filename || `design-${Date.now()}.jpg`
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)

  //   toast({
  //     title: "Download started",
  //     description: `Downloading ${filename}`,
  //   })
  // }

  // Refactored handleDownload to fetch blob and force download without opening a new tab
async function handleDownload(url: string, filename?: string) {
  try {
    // Fetch the file as a blob
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Create a temporary object URL
    const blobUrl = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || `design-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    // Notify user
    toast({
      title: 'Download started',
      description: `Downloading ${link.download}`,
    });
  } catch (error) {
    console.error('Download failed:', error);
    toast({
      variant: 'destructive',
      title: 'Download failed',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}


const handlePreview = (url: string, designName: string, designId: string) => {
  setPreview({ url: url, designName, designId })
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
              ) : designs && designs.length > 0 ? (
                designs.map((design: any, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={design.url}
                        alt={design.name}
                        className="h-24 w-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePreview(design.url, design.name, design.designId)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg?height=128&width=128&text=No+Image+Available" as string
                          (e.target as HTMLImageElement).alt = "No image available"
                        }}
                      />
                    </TableCell>
                    <TableCell>{design.name}</TableCell>
                    <TableCell className="font-mono text-xs truncate]">{design.designId}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          // onClick={() => handlePreview(image.public_id)}
                          className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button> */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(design.url, design.name)}
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
                    No designs found. Upload some designs to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {isPreviewOpen && (
        <PredesignedDesignPreview
          url={preview?.url as any}
          designId={preview?.designId as any}
          designName={preview?.designName as any}
          showDownload={true}
          open={true}
          onOpenChange={setIsPreviewOpen}
        />
      )}
    </Card>
  )
}
