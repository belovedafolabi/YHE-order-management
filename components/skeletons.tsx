import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderCardSkeleton() {
  return (
    <Card className="overflow-hidden border-amber-500/20 shadow-md animate-pulse-slow">
      <CardHeader className="bg-muted/50">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="grid gap-4">
            <Skeleton className="h-4 w-20" />
            <div className="grid gap-4">
              <ProductCardSkeleton />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-amber-500/20 shadow-sm animate-pulse-slow">
      <CardContent className="p-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminTableSkeleton() {
  return (
    <Card className="border-amber-500/20 shadow-md animate-pulse-slow">
      <CardHeader className="bg-muted/50 flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-[180px]" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="mb-4 border-amber-500/20">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
              </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * A skeleton placeholder for the ModelCarousel component
 * Shows a pulsing rectangle with prev/next button placeholders
 */
export function ModelCarouselSkeleton() {
  return (
    <Card className="border-amber-500/20 shadow-md">
      <CardContent className="p-0 relative overflow-hidden">
        {/* Canvas placeholder: 16:9 aspect ratio */}
        <div className="w-full aspect-video bg-muted/20 animate-pulse" />
        {/* Prev/Next button placeholders */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}