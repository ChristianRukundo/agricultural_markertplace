"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { StarRating } from "@/components/ui/StarRating"
import { FadeIn } from "@/components/animations/FadeIn"
import { SlideInOnScroll } from "@/components/animations/SlideInOnScroll"
import { api } from "@/lib/trpc/client"
import Link from "next/link"
import Image from "next/image"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  const { data: products, isLoading } = api.product.getProducts.useQuery({
    search: searchQuery,
    categoryId: selectedCategory || undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    page: 1,
    limit: 12,
  })

  const { data: categories } = api.category.getAll.useQuery({
    includeProductCount: true,
    page: 1,
    limit: 50,
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FadeIn>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Fresh Products from Local Farmers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover quality produce directly from Rwanda's finest farmers. Fresh, organic, and delivered with care.
          </p>
        </div>
      </FadeIn>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">All Categories</option>
            {categories?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex space-x-2">
            <Input
              placeholder="Min price"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
            />
            <Input
              placeholder="Max price"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-4">
              <div className="skeleton h-48 mb-4" />
              <div className="skeleton h-4 mb-2" />
              <div className="skeleton h-4 w-2/3 mb-2" />
              <div className="skeleton h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.products.map((product, index) => (
            <SlideInOnScroll key={product.id} delay={index * 0.1}>
              <Link href={`/products/${product.id}`}>
                <Card className="h-full overflow-hidden">
                  <div className="relative h-48 mb-4">
                    <Image
                      src={product.imageUrls[0] || "/placeholder.svg?height=200&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.category.name}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        RWF {Number(product.unitPrice).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Number(product.quantityAvailable)} kg available
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {product.farmer.profile?.name?.charAt(0) || "F"}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.farmer.profile?.name || "Farmer"}
                        </span>
                      </div>

                      <StarRating rating={4.5} readonly size="sm" />
                    </div>
                  </div>
                </Card>
              </Link>
            </SlideInOnScroll>
          ))}
        </div>
      )}

      {/* Load More */}
      {products && products.pagination.pages > 1 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}
