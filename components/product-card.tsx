"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { DesignPreview } from "@/components/design-preview"
import { PredesignedDesignPreview } from "@/components/predesigned-design-preview"
import { parseProductInfo, getTShirtType, formatProductName } from "@/lib/utils"
import { ProductCardSkeleton } from "@/components/skeletons"
import { getDesignByName } from "@/lib/predesigned-designs"

interface ProductCardProps {
  product: string
  orderId: string
  index?: number
}

export function ProductCard({ product, orderId, index = 0 }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <ProductCardSkeleton />
  }

  const productInfo = parseProductInfo(product)
  const tshirtType = getTShirtType(productInfo)
  const formattedName = formatProductName(productInfo.name)

  // For demo purposes, we'll construct design URLs based on order ID and product index
  const getFrontDesignUrl = () => `/designs/${orderId}-front-${index}.jpg`
  const getBackDesignUrl = () => `/designs/${orderId}-back-${index}.jpg`

  // Get predesigned design if available
  const predesignedDesign = productInfo.design ? getDesignByName(productInfo.design) : null

  return (
    <Card className="overflow-hidden border-amber-500/20 shadow-sm transition-all duration-300 card-hover">
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <div className="font-medium text-amber-500">{formattedName}</div>
            {productInfo.size && (
              <div className="text-sm text-muted-foreground">
                Size: <span className="font-medium">{productInfo.size}</span>
              </div>
            )}
            {productInfo.design && tshirtType !== "custom-front" && tshirtType !== "custom-front-back" && (
              <div className="text-sm text-muted-foreground">
                Design: <span className="font-medium">{productInfo.design}</span>
              </div>
            )}
          </div>

          {tshirtType === "custom-front" && (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                Design: Custom front design
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Front Design Preview</div>
                  <DesignPreview
                    designUrl={getFrontDesignUrl()}
                    designType="front"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <FileUpload label="Upload Front Design" orderId={orderId} designType="front" productIndex={index} />
              </div>
            </div>
          )}

          {tshirtType === "custom-front-back" && (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                Design: Custom front and back design
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Front Design Preview</div>
                  <DesignPreview
                    designUrl={getFrontDesignUrl()}
                    designType="front"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <FileUpload label="Upload Front Design" orderId={orderId} designType="front" productIndex={index} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Back Design Preview</div>
                  <DesignPreview
                    designUrl={getBackDesignUrl()}
                    designType="back"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <FileUpload label="Upload Back Design" orderId={orderId} designType="back" productIndex={index} />
              </div>
            </div>
          )}

          {tshirtType === "pre-designed" && predesignedDesign && (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                Design: Pre-designed t-shirt
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Design Preview</div>
                  <PredesignedDesignPreview
                    designId={predesignedDesign.id}
                    designName={predesignedDesign.name}
                    className="h-24 w-24 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Design Name</div>
                  <div className="text-sm p-2 bg-muted/30 rounded-md">{predesignedDesign.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
