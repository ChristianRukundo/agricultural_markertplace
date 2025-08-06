"use client";

import React, { useState, useMemo } from "react";

// --- UI & ANIMATION IMPORTS ---
import { api } from "@/lib/trpc/client";
import { useDebounce } from "@/hooks/use-debounce";

// --- NEW MODULAR COMPONENT IMPORTS ---
import { CartSliderProvider } from "@/components/products/CartSliderProvider";
import { CartSlider } from "@/components/products/CartSlider";
import { ProductGrid } from "@/components/products/ProductGrid";
import { FilterBar } from "@/components/products/FilterBar";
import { PaginationControls } from "@/components/products/PaginationControls";

const PAGE_SIZE = 12;

// ============================================================================
// MAIN PRODUCTS PAGE CONTENT
// ============================================================================

function ProductsPageContent() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryId: "",
    dateRange: null as { from: Date | undefined; to: Date | undefined } | null, // Updated type
  });
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  const productQueryInput = useMemo(() => {
    const [sortField, sortOrder] = sortBy.split("-") as [
      "createdAt" | "unitPrice",
      "asc" | "desc"
    ];
    return {
      page,
      limit: PAGE_SIZE,
      sortBy: sortField,
      sortOrder,
      search: debouncedSearchTerm || undefined,
      categoryId: filters.categoryId || undefined,
      // Pass from and to dates from the dateRange object
      dateFrom: filters.dateRange?.from,
      dateTo: filters.dateRange?.to,
    };
  }, [page, sortBy, debouncedSearchTerm, filters]);

  const { data: productsData, isLoading } =
    api.product.getProducts.useQuery(productQueryInput);
  const { data: categoriesData } = api.category.getAll.useQuery({});

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ searchTerm: "", categoryId: "", dateRange: null });
    setSortBy("createdAt-desc");
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    // Correctly count dateRange filter if either from or to is set
    let count = 0;
    if (filters.categoryId) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    return count;
  }, [filters]);

  const totalProducts = productsData?.pagination.total || 0;
  const totalPages = productsData?.pagination.pages || 0;

  return (
    <div className="min-h-screen bg-background">
      <CartSlider />

      <section className="py-20 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-primary via-green-500 to-secondary-foreground bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the freshest produce directly from verified farmers
              across Rwanda.
            </p>
          </div>
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            categoriesData={categoriesData}
            activeFiltersCount={activeFiltersCount}
            clearAllFilters={clearAllFilters}
          />
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              {isLoading
                ? "Loading products..."
                : `Showing ${
                    productsData?.products.length || 0
                  } of ${totalProducts} products`}
            </div>
          </div>
          <ProductGrid productsData={productsData} isLoading={isLoading} />

          {totalProducts > 0 && totalPages > 1 && (
            <div className="mt-16">
              <PaginationControls
                currentPage={page}
                totalCount={totalProducts}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Final Page Export using the Provider
export default function ProductsPage() {
  return (
    <CartSliderProvider>
      <ProductsPageContent />
    </CartSliderProvider>
  );
}
