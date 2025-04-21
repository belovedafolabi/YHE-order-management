"use client"
import { useState, useEffect, use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { DesignPreview } from "@/components/design-preview"
import { PredesignedDesignPreview } from "@/components/predesigned-design-preview"
import { parseProductInfo, getTShirtType, formatProductName } from "@/lib/utils"
import { isGunProduct } from "@/lib/utils";
import { ProductCardSkeleton } from "@/components/skeletons"
import { getDesignByName } from "@/lib/predesigned-designs"

interface ProductCardProps {
  product: string
  orderId: string
  index?: number
  customDesigns?: any[]
}

export function ProductCard({ product, orderId, index = 0, customDesigns }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [frontOnlyPreview, setFrontOnlyPreview] = useState<string | null>(null);
  const [backOnlyPreview, setBackOnlyPreview] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!customDesigns) return;

    const front = customDesigns.find((design) => design.type === "front" && index === design.itemNumber);
    const back = customDesigns.find((design) => design.type === "back" && index === design.itemNumber);
    const frontOnly = customDesigns.find((design) => design.type === "front-only" && index === design.itemNumber);
    const backOnly = customDesigns.find((design) => design.type === "back-only" && index === design.itemNumber);


    if (front?.url) setFrontPreview(front.url);
    if (back?.url) setBackPreview(back.url);
    if (frontOnly?.url) setFrontOnlyPreview(frontOnly.url);
    if (backOnly?.url) setBackOnlyPreview(backOnly.url);
  }, [customDesigns]);

  if (isLoading) return <ProductCardSkeleton />;
  const productInfo = parseProductInfo(product);
  console.log("Product Info:", productInfo);
  const tshirtType = getTShirtType(productInfo);
  const formattedName = formatProductName(productInfo.name);
  const isGun = isGunProduct(productInfo.name);
  console.log(isGun, "isGun");
  const predesignedDesign = productInfo.design ? getDesignByName(productInfo.design) : null;

  return (
    <Card className="overflow-hidden border-amber-500/20 shadow-sm transition-all duration-300 card-hover">
      <CardContent className="p-4 md:p-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <div className="font-medium text-amber-500">{formattedName}</div>
            {productInfo.size && (
              <div className="text-sm text-muted-foreground">
                Size: <span className="font-medium uppercase">{productInfo.size}</span>
              </div>
            )}
            {productInfo.design && tshirtType !== "custom-back" && tshirtType !== "custom-front" && tshirtType !== "custom-front-back" && (
              <div className="text-sm text-muted-foreground">
                Design: <span className="font-medium">{productInfo.design}</span>
              </div>
            )}
          </div>


          {tshirtType === "custom-back" && (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                Design: Custom back design
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Back Design Preview</div>
                  <DesignPreview
                    designUrl={backOnlyPreview as any}
                    designType="back-only"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 bg-white hover:scale-105"
                    showDownload={true}
                  />
                </div>
                <FileUpload label="Upload Back Design" orderId={orderId} designType="back-only" productIndex={index} setPreview={setBackOnlyPreview} />
              </div>
            </div>
          )}


          {tshirtType === "custom-front" && (
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                Design: Custom front design
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Front Design Preview</div>
                  <DesignPreview
                    designUrl={frontOnlyPreview as any}
                    designType="front-only"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 bg-white hover:scale-105"
                    showDownload={true}
                  />
                </div>
                <FileUpload label="Upload Front Design" orderId={orderId} designType="front-only" productIndex={index} setPreview={setFrontOnlyPreview} />
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
                    designUrl={frontPreview as any}
                    designType="front"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 bg-white hover:scale-105"
                    showDownload={true}
                  />
                </div>
                <FileUpload label="Upload Front Design" orderId={orderId} designType="front" productIndex={index} setPreview={setFrontPreview} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Back Design Preview</div>
                  <DesignPreview
                    designUrl={backPreview as any}
                    designType="back"
                    productName={formattedName}
                    className="h-24 w-24 transition-transform duration-300 bg-white hover:scale-105"
                    showDownload={true}
                  />
                </div>
                <FileUpload label="Upload Back Design" orderId={orderId} designType="back" productIndex={index} setPreview={setBackPreview} />
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
                    designId={""}
                    designName={productInfo.design || ""}
                    className="h-24 w-24 transition-transform duration-300 bg-white hover:scale-105"
                    showDownload={true}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Design Name</div>
                  <div className="text-sm p-2 bg-muted/30 rounded-md">{productInfo.design}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}