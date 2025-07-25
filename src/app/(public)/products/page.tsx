"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Grid, List, MapPin, SlidersHorizontal, X, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { api } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState<"createdAt" | "unitPrice" | "averageRating">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch products with enhanced filtering
  const productQueryInput: any = { page, limit: 12, sortBy, sortOrder }
  if (debouncedSearchTerm) productQueryInput.search = debouncedSearchTerm
  if (selectedCategory) productQueryInput.categoryId = selectedCategory
  if (selectedDistrict) productQueryInput.district = selectedDistrict
  if (priceRange[0] > 0) productQueryInput.minPrice = priceRange[0]
  if (priceRange[1] < 100000) productQueryInput.maxPrice = priceRange[1]
  if (availableOnly) productQueryInput.availableOnly = availableOnly
  const { data: productsData, isLoading } = api.product.getProducts.useQuery(productQueryInput)

  // Fetch categories
  const categoryQueryInput: any = { page: 1, limit: 50, includeProductCount: true }
  const { data: categoriesData } = api.category.getAll.useQuery(categoryQueryInput)

  const RWANDA_DISTRICTS = [
    "Kigali",
    "Nyarugenge",
    "Gasabo",
    "Kicukiro",
    "Nyanza",
    "Gisagara",
    "Nyaruguru",
    "Huye",
    "Nyamagabe",
    "Ruhango",
    "Muhanga",
    "Kamonyi",
    "Musanze",
    "Burera",
    "Gicumbi",
    "Rulindo",
    "Gakenke",
    "Rubavu",
    "Nyabihu",
    "Ngororero",
    "Rusizi",
    "Nyamasheke",
    "Karongi",
    "Rutsiro",
    "Rwamagana",
    "Nyagatare",
    "Gatsibo",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Bugesera",
  ]

  const SORT_OPTIONS = [
    { value: "createdAt", label: "Newest First", order: "desc" },
    { value: "createdAt", label: "Oldest First", order: "asc" },
    { value: "unitPrice", label: "Price: Low to High", order: "asc" },
    { value: "unitPrice", label: "Price: High to Low", order: "desc" },
    { value: "averageRating", label: "Highest Rated", order: "desc" },
  ]

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory) count++
    if (selectedDistrict) count++
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++
    if (availableOnly) count++
    return count
  }, [selectedCategory, selectedDistrict, priceRange, availableOnly])

  const clearAllFilters = () => {
    setSelectedCategory("")
    setSelectedDistrict("")
    setPriceRange([0, 100000])
    setAvailableOnly(false)
    setSearchTerm("")
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Fresh <span className="gradient-text">Products</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover quality agricultural products directly from verified farmers across Rwanda
              </p>
              <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span>{productsData?.pagination.total || 0} Products Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  <span>{categoriesData?.pagination.total || 0} Categories</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Enhanced Search and Filters */}
          <FadeIn delay={0.2}>
            <div className="max-w-6xl mx-auto">
              <div className="glassmorphism p-6 rounded-2xl">
                <div className="flex flex-col gap-4">
                  {/* Main Search Row */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search products by name, description, or farmer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-md border bg-background min-w-[150px]"
                      >
                        <option value="">All Categories</option>
                        {categoriesData?.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category._count?.products || 0})
                          </option>
                        ))}
                      </select>

                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split("-")
                          setSortBy(field as typeof sortBy)
                          setSortOrder(order as typeof sortOrder)
                        }}
                        className="px-4 py-2 rounded-md border bg-background min-w-[150px]"
                      >
                        {SORT_OPTIONS.map((option, index) => (
                          <option key={index} value={`${option.value}-${option.order}`}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="relative"
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex border rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-none"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "map" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("map")}
                        className="rounded-l-none"
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Filters Panel */}
                  {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* District Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">District</label>
                          <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border bg-background"
                          >
                            <option value="">All Districts</option>
                            {RWANDA_DISTRICTS.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Range */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Price Range (RWF)</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={priceRange[0] || ""}
                              onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                              className="w-full"
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={priceRange[1] === 100000 ? "" : priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 100000])}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Availability</label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={availableOnly}
                              onChange={(e) => setAvailableOnly(e.target.checked)}
                              className="mr-2"
                            />
                            <span className="text-sm">In stock only</span>
                          </label>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            disabled={activeFiltersCount === 0}
                            className="w-full bg-transparent"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Filters Display */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Active filters:</span>
                      {selectedCategory && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Category: {categoriesData?.categories.find((c) => c.id === selectedCategory)?.name}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
                        </Badge>
                      )}
                      {selectedDistrict && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          District: {selectedDistrict}
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDistrict("")} />
                        </Badge>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Price: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} RWF
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 100000])} />
                        </Badge>
                      )}
                      {availableOnly && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          In stock only
                          <X className="w-3 h-3 cursor-pointer" onClick={() => setAvailableOnly(false)} />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Products Grid/List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              {isLoading
                ? "Loading products..."
                : `Showing ${productsData?.products.length || 0} of ${productsData?.pagination.total || 0} products`}
            </div>
          </div>

          {isLoading ? (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
              )}
            >
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="glassmorphism overflow-hidden">
                    <div className={cn("bg-muted", viewMode === "grid" ? "aspect-video" : "h-48 md:h-32")} />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-muted rounded w-1/3" />
                        <div className="h-8 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : productsData?.products && productsData.products.length > 0 ? (
            <>
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1",
                )}
              >
                {productsData.products.map((product, index) => (
                  <SlideInOnScroll key={product.id} delay={index * 0.05}>
                    <Card
                      className={cn(
                        "glassmorphism overflow-hidden hover:scale-105 transition-all duration-300 group",
                        viewMode === "list" && "flex flex-row",
                      )}
                    >
                      {/* Product Image */}
                      <div
                        className={cn(
                          "bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative overflow-hidden",
                          viewMode === "grid" ? "aspect-video" : "w-48 h-48 md:w-32 md:h-32 flex-shrink-0",
                        )}
                      >
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <img
                            src={product.imageUrls[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary/90 text-primary-foreground text-xs">
                            {product.category.name}
                          </Badge>
                        </div>

                        {/* Stock Status */}
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant={Number(product.quantityAvailable) > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {Number(product.quantityAvailable) > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          {product._count.reviews > 0 && (
                            <div className="flex items-center ml-2">
                              <StarRating rating={product._count.reviews} readonly size="sm" />
                              <span className="text-xs text-muted-foreground ml-1">({product._count.reviews})</span>
                            </div>
                          )}
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                        {/* Farmer Info */}
                        <div className="flex items-center mb-4">
                          <div className="w-6 h-6 bg-gradient-primary rounded-full mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {product.farmer.profile?.name || "Unknown Farmer"}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate">
                                {product.farmer.profile?.location
                                  ? JSON.parse(product.farmer.profile.location).district || "Rwanda"
                                  : "Rwanda"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              RWF {Number(product.unitPrice).toLocaleString()}
                            </span>
                          </div>

                          <Button size="sm" className="bg-gradient-primary text-white" asChild>
                            <a href={`/products/${product.id}`}>View Details</a>
                          </Button>
                        </div>

                        {/* Stock Info */}
                        <div className="mt-3 text-sm">
                          {Number(product.quantityAvailable) > 0 ? (
                            <span className="text-green-600">
                              {Number(product.quantityAvailable)} available
                            </span>
                          ) : (
                            <span className="text-red-600">Out of stock</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </SlideInOnScroll>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {productsData.pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {productsData.pagination.page} of {productsData.pagination.pages}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>

                    {[...Array(Math.min(5, productsData.pagination.pages))].map((_, i) => {
                      const pageNum = Math.max(1, page - 2) + i
                      if (pageNum > productsData.pagination.pages) return null

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      disabled={page === productsData.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No products found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {activeFiltersCount > 0
                  ? "Try adjusting your filters or search criteria to find what you're looking for."
                  : "No products are currently available. Check back later for new listings."}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearAllFilters} className="bg-gradient-primary text-white">
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
