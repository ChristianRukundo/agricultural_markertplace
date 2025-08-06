"use client";

import React, { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/common/DatePicker";
import { Select } from "@/components/ui/Select"; 
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/_app";

type CategoriesData = inferRouterOutputs<AppRouter>["category"]["getAll"];
type DateRange = { from: Date | undefined; to: Date | undefined };

interface FilterBarProps {
  filters: {
    searchTerm: string;
    categoryId: string;
    dateRange: DateRange | null;
  };
  onFilterChange: (
    filterName: keyof FilterBarProps["filters"],
    value: any
  ) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  categoriesData: CategoriesData | undefined;
  activeFiltersCount: number;
  clearAllFilters: () => void;
}

export function FilterBar({
  filters,
  onFilterChange,
  sortBy,
  onSortChange,
  categoriesData,
  activeFiltersCount,
  clearAllFilters,
}: FilterBarProps) {
  const SORT_OPTIONS = [
    { value: "createdAt-desc", label: "Newest" },
    { value: "unitPrice-asc", label: "Price: Low to High" },
    { value: "unitPrice-desc", label: "Price: High to Low" },
  ];

  const categoryOptions = useMemo(() => {
    const options =
      categoriesData?.categories.map((c) => ({ value: c.id, label: c.name })) ||
      [];
    return [{ value: "", label: "All Categories" }, ...options];
  }, [categoriesData]);

  const sortOptions = useMemo(() => {
    return SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }));
  }, [SORT_OPTIONS]);

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="p-6 bg-background/80 backdrop-blur-md border shadow-lg rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for products, e.g., 'Organic Tomatoes'..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange("searchTerm", e.target.value)}
              className="pl-12 h-12 text-base rounded-md"
            />
          </div>
          <DatePicker
            value={filters.dateRange}
            onChange={(value) => onFilterChange("dateRange", value)}
          />
          {/* NEW SELECT COMPONENT FOR SORTING */}
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort by"
            className="w-full"
          />
        </div>
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Category
            </label>
            {/* NEW SELECT COMPONENT FOR CATEGORY */}
            <Select
              options={categoryOptions}
              value={filters.categoryId}
              onChange={(value) => onFilterChange("categoryId", value)}
              placeholder="Select category"
              className="w-full"
            />
          </div>
          {/* Placeholder for future filters */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Location
            </label>
            <Input placeholder="e.g., Kigali" disabled />
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-end justify-end">
              <Button variant="ghost" onClick={clearAllFilters}>
                <X className="w-4 h-4 mr-2" /> Clear Filters (
                {activeFiltersCount})
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
