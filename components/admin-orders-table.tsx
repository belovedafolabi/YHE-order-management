"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoreHorizontal, Filter, ChevronRight, Search, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { DesignPreview } from "@/components/design-preview"
import { PredesignedDesignPreview } from "@/components/predesigned-design-preview"
import type { Order } from "@/lib/types"
import { parseProductInfo, splitProducts, getTShirtType, isGunProduct, formatProductName } from "@/lib/utils"
import { updateOrderStatus } from "@/lib/actions"
import { isValid } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"
import { AdminTableSkeleton } from "@/components/skeletons"
import { z } from "zod"
import { getDesignByName } from "@/lib/predesigned-designs"

// Zod schema for search validation
const searchSchema = z.string().optional()

interface AdminOrdersTableProps {
  orders: Order[]
}

export function AdminOrdersTable({ orders: initialOrders }: AdminOrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filter, setFilter] = useState<string>("all")
  const [printFilter, setPrintFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const { toast } = useToast()
  const isMobile = useIsMobile()

  console.log(orders[89])

  // Simulate loading for skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, printFilter, searchQuery])

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId)

      // Show loading toast
      const loadingToast = toast({
        title: "Updating print status",
        description: `Updating order #${orderId} print status...`,
      })

      // Update the status in the database
      await updateOrderStatus(orderId, status, "print")

      // Dismiss loading toast
      loadingToast.dismiss()

      // Update the local state
      setOrders(
        orders.map((order) => {
          if (order.orderId === orderId) {
            return { ...order, printStatus: status }
          }
          return order
        }),
      )

      toast({
        title: "Print status updated",
        description: `Order #${orderId} print status updated to ${status}`,
        variant: "success",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was an error updating the order status",
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleSearchChange = (value: string) => {
    try {
      // Validate search query
      searchSchema.parse(value)
      setSearchQuery(value)
    } catch (err) {
      // If validation fails, don't update the search query
      console.error("Invalid search query:", err)
    }
  }

  // Filter orders based on product type, print status, and search query
  const filteredOrders = orders.filter((order) => {
    // First apply product type filter
    let passesProductFilter = true
    if (filter !== "all") {
      // Split products and check if any match the filter
      const products = splitProducts(order.product)
      passesProductFilter = products.some((product) => {
        const productInfo = parseProductInfo(product)
        const tshirtType = getTShirtType(productInfo)

        switch (filter) {
          case "custom-front":
            return tshirtType === "custom-front"
          case "custom-front-back":
            return tshirtType === "custom-front-back"
          case "pre-designed":
            return tshirtType === "pre-designed"
          case "guns":
            return isGunProduct(productInfo.name)
          default:
            return true
        }
      })
    }

    // Apply print status filter
    let passesPrintFilter = true
    if (printFilter !== "all") {
      passesPrintFilter = printFilter === "printed" ? order.printStatus === "PRINTED" : order.printStatus !== "PRINTED"
    }

    // Then apply search query filter if there is a search query
    if (!searchQuery) return passesProductFilter && passesPrintFilter

    const query = searchQuery.toLowerCase().trim()
    return (
      passesProductFilter &&
      passesPrintFilter &&
      (order.orderId.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.product.toLowerCase().includes(query))
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Safe date formatting function
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date"

    try {
      const date = new Date(dateString)
      return isValid(date) ? date.toLocaleDateString() : dateString
    } catch {
      return dateString
    }
  }

  // Function to get product summary for display in table
  const getProductSummary = (productString: string) => {
    const products = splitProducts(productString)
    if (products.length === 0) return productString

    if (products.length === 1) {
      const productInfo = parseProductInfo(products[0])
      return formatProductName(productInfo.name)
    }

    return `${products.length} products`
  }

  // Function to check if an order has custom designs
  const hasCustomDesigns = (productString: string) => {
    const products = splitProducts(productString)
    return products.some((product) => {
      const productInfo = parseProductInfo(product)
      const tshirtType = getTShirtType(productInfo)
      return tshirtType === "custom-front" || tshirtType === "custom-front-back" || tshirtType === "pre-designed"
    })
  }

  // Function to get design thumbnails for an order
  const getDesignThumbnails = (productString: string, orderId: string) => {
    const products = splitProducts(productString)
    const thumbnails = []

    // Check each product for custom designs
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const productInfo = parseProductInfo(product)
      const tshirtType = getTShirtType(productInfo)
      const productName = formatProductName(productInfo.name)

      if (tshirtType === "custom-front" || tshirtType === "custom-front-back") {
        // Add front design thumbnail
        thumbnails.push(
          <DesignPreview
            key={`front-${i}`}
            designUrl={`/designs/${orderId}-front-${i}.jpg`}
            designType="front"
            productName={productName}
            className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 hover:scale-110"
            showDownload={true}
          />,
        )

        // Add back design thumbnail if needed
        if (tshirtType === "custom-front-back") {
          thumbnails.push(
            <DesignPreview
              key={`back-${i}`}
              designUrl={`/designs/${orderId}-back-${i}.jpg`}
              designType="back"
              productName={productName}
              className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 hover:scale-110"
              showDownload={true}
            />,
          )
        }
      } else if (tshirtType === "pre-designed" && productInfo.design) {
        // Check if this is a predesigned design
        const predesignedDesign = getDesignByName(productInfo.design)
        if (predesignedDesign) {
          thumbnails.push(
            <PredesignedDesignPreview
              key={`predesigned-${i}`}
              designId={predesignedDesign.id}
              designName={predesignedDesign.name}
              className="h-8 w-8 md:h-10 md:w-10 transition-transform duration-300 hover:scale-110"
              showDownload={true}
            />,
          )
        }
      }
    }

    return <div className="flex flex-wrap gap-2">{thumbnails}</div>
  }

  // Toggle expanded order on mobile
  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Mobile card view for orders
  const renderMobileOrderCard = (order: Order) => {
    const isExpanded = expandedOrder === order.orderId

    return (
      <Card key={order.orderId} className="mb-4 border-amber-500/20 shadow-sm transition-all duration-300 card-hover">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <CardTitle className="text-base">
              <Link href={`/order/${order.orderId}`} className="hover:text-amber-500 transition-colors duration-300">
                #{order.orderId}
              </Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{order.customer}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-transform duration-300"
            onClick={() => toggleOrderExpansion(order.orderId)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
          </Button>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4 pt-0 animate-fade-in">
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium text-muted-foreground">Product:</span>
                <span className="truncate">{getProductSummary(order.product)}</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium text-muted-foreground">Date:</span>
                <span>{formatDate(order.date)}</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium text-muted-foreground">Total:</span>
                <span className="font-bold text-amber-500">₦{order.total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium text-muted-foreground">Print Status:</span>
                <Select
                  defaultValue={order.orderStatus === "PRINTED" ? "PRINTED" : "NOT_PRINTED"}
                  onValueChange={(value) => handleStatusChange(order.orderId, value)}
                >
                  <SelectTrigger className="h-7 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_PRINTED">Not Printed</SelectItem>
                    <SelectItem value="PRINTED">Printed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasCustomDesigns(order.product) && (
                <div className="grid grid-cols-1 gap-1">
                  <span className="font-medium text-muted-foreground">Designs:</span>
                  {getDesignThumbnails(order.product, order.orderId)}
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 transition-all duration-300 button-hover"
                  asChild
                >
                  <Link href={`/order/${order.orderId}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 py-4 border-t border-border gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 transition-colors duration-300"
          >
            <span className="sr-only">First page</span>
            <span>1</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 transition-colors duration-300"
          >
            <span className="sr-only">Previous page</span>
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <span className="text-sm px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 transition-colors duration-300"
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 transition-colors duration-300"
          >
            <span className="sr-only">Last page</span>
            <span>{totalPages}</span>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <AdminTableSkeleton />
  }

  return (
    <Card className="border-amber-500/20 shadow-lg transition-all duration-300 card-hover">
      <CardHeader className="bg-muted/50 border-b border-border/60">
        <div className="flex flex-col gap-4">
          <CardTitle>All Orders</CardTitle>
          <div className="flex flex-col gap-4">
            {/* Search input - visible on both mobile and desktop */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by order ID, customer or product"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-8 bg-background border-amber-500/20 focus-visible:ring-amber-500 transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </button>
              )}
            </div>

            {/* Filters - stacked on mobile, side by side on desktop */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Product type filter */}
              <Select value={filter} onValueChange={setFilter} className="flex-1">
                <SelectTrigger className="transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by product" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="custom-front">Custom Design Front</SelectItem>
                  <SelectItem value="custom-front-back">Custom Design Front & Back</SelectItem>
                  <SelectItem value="pre-designed">Pre-designed</SelectItem>
                  <SelectItem value="guns">Guns (All)</SelectItem>
                </SelectContent>
              </Select>

              {/* Print status filter */}
              <Select value={printFilter} onValueChange={setPrintFilter} className="flex-1">
                <SelectTrigger className="transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by print status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Print Status</SelectItem>
                  <SelectItem value="printed">Printed</SelectItem>
                  <SelectItem value="not-printed">Not Printed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Search results summary */}
        {searchQuery && (
          <div className="p-4 border-b border-border animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Found {filteredOrders.length} {filteredOrders.length === 1 ? "result" : "results"} for "
              <span className="font-medium text-foreground">{searchQuery}</span>"
            </p>
          </div>
        )}

        {isMobile ? (
          // Mobile view - cards
          <div className="p-4">
            {paginatedOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No orders found matching your search" : "No orders found matching the selected filter"}
              </div>
            ) : (
              paginatedOrders.map((order) => renderMobileOrderCard(order))
            )}
          </div>
        ) : (
          // Desktop view - table
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Print Status</TableHead>
                  <TableHead>Designs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery
                        ? "No orders found matching your search"
                        : "No orders found matching the selected filter"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => {
                    return (
                      <TableRow key={order.orderId} className="transition-colors duration-300 hover:bg-muted/30">
                        <TableCell className="font-medium">
                          <Link
                            href={`/order/${order.orderId}`}
                            className="hover:text-amber-500 transition-colors duration-300"
                          >
                            #{order.orderId}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={order.product}>
                          {getProductSummary(order.product)}
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell className="text-amber-500 font-medium">₦{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            defaultValue={order.orderStatus === "PRINTED" ? "PRINTED" : "NOT_PRINTED"}
                            onValueChange={(value) => handleStatusChange(order.orderId, value)}
                          >
                            <SelectTrigger className="h-7 w-[130px] transition-all duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NOT_PRINTED">Not Printed</SelectItem>
                              <SelectItem value="PRINTED">Printed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {hasCustomDesigns(order.product) ? (
                            getDesignThumbnails(order.product, order.orderId)
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 transition-colors duration-300">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/order/${order.orderId}`}>View Order Details</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  )
}
