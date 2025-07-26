"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Filter,
  Star,
  Award,
  Users,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

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
];

const SPECIALIZATIONS = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Legumes",
  "Herbs",
  "Organic Farming",
  "Dairy",
  "Poultry",
  "Livestock",
  "Aquaculture",
];

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<
    "name" | "rating" | "products" | "recent"
  >("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    selectedDistrict,
    selectedSpecialization,
    minRating,
    sortBy,
  ]);

  // Fetch farmers
  const { data: farmersData, isLoading } = api.user.getFarmers.useQuery({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    district: selectedDistrict || undefined,
    specialization: selectedSpecialization || undefined,
    minRating: minRating || undefined,
    sortBy,
  });

  // Get farmer stats
  const { data: farmerStats } = api.user.getFarmerStats.useQuery();

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDistrict("");
    setSelectedSpecialization("");
    setMinRating(0);
    setSortBy("rating");
  };

  const activeFiltersCount = [
    debouncedSearch,
    selectedDistrict,
    selectedSpecialization,
    minRating > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 dark:from-green-950 dark:via-blue-950 dark:to-yellow-950 py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Meet Our <span className="gradient-text">Farmers</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Connect directly with verified farmers across Rwanda and
                discover their fresh produce
              </p>

              {/* Stats */}
              {farmerStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="glassmorphism p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {farmerStats.totalFarmers}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Farmers
                    </div>
                  </div>
                  <div className="glassmorphism p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {farmerStats.totalProducts}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Products Available
                    </div>
                  </div>
                  <div className="glassmorphism p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {farmerStats.averageRating.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Rating
                    </div>
                  </div>
                  <div className="glassmorphism p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {farmerStats.districtsCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Districts Covered
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Search and Filters */}
          <FadeIn delay={0.2}>
            <div className="max-w-6xl mx-auto">
              <Card className="glassmorphism">
                <CardContent className="p-6">
                  {/* Main Search */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search farmers by name, specialization, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="relative"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>

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
                          className="rounded-l-none"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* District Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            District
                          </label>
                          <select
                            value={selectedDistrict}
                            onChange={(e) =>
                              setSelectedDistrict(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="">All Districts</option>
                            {RWANDA_DISTRICTS.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Specialization Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Specialization
                          </label>
                          <select
                            value={selectedSpecialization}
                            onChange={(e) =>
                              setSelectedSpecialization(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="">All Specializations</option>
                            {SPECIALIZATIONS.map((spec) => (
                              <option key={spec} value={spec}>
                                {spec}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Minimum Rating
                          </label>
                          <select
                            value={minRating}
                            onChange={(e) =>
                              setMinRating(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value={0}>Any Rating</option>
                            <option value={4}>4+ Stars</option>
                            <option value={4.5}>4.5+ Stars</option>
                            <option value={5}>5 Stars</option>
                          </select>
                        </div>

                        {/* Sort By */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Sort By
                          </label>
                          <select
                            value={sortBy}
                            onChange={(e) =>
                              setSortBy(e.target.value as typeof sortBy)
                            }
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name A-Z</option>
                            <option value="products">Most Products</option>
                            <option value="recent">Recently Joined</option>
                          </select>
                        </div>
                      </div>

                      {/* Active Filters & Clear */}
                      {activeFiltersCount > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex flex-wrap gap-2">
                            {debouncedSearch && (
                              <Badge variant="secondary">
                                Search: {debouncedSearch}
                                <button
                                  onClick={() => setSearchTerm("")}
                                  className="ml-2 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            )}
                            {selectedDistrict && (
                              <Badge variant="secondary">
                                District: {selectedDistrict}
                                <button
                                  onClick={() => setSelectedDistrict("")}
                                  className="ml-2 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            )}
                            {selectedSpecialization && (
                              <Badge variant="secondary">
                                Specialization: {selectedSpecialization}
                                <button
                                  onClick={() => setSelectedSpecialization("")}
                                  className="ml-2 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            )}
                            {minRating > 0 && (
                              <Badge variant="secondary">
                                Rating: {minRating}+ Stars
                                <button
                                  onClick={() => setMinRating(0)}
                                  className="ml-2 hover:text-destructive"
                                >
                                  ×
                                </button>
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {isLoading
                  ? "Loading..."
                  : `${farmersData?.pagination.total || 0} Farmers Found`}
              </h2>
              <p className="text-muted-foreground">
                {activeFiltersCount > 0
                  ? "Filtered results"
                  : "All verified farmers"}
              </p>
            </div>
          </div>

          {/* Farmers Grid/List */}
          {isLoading ? (
            <div
              className={cn(
                "grid gap-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-80" />
                </div>
              ))}
            </div>
          ) : farmersData?.farmers && farmersData.farmers.length > 0 ? (
            <>
              <div
                className={cn(
                  "grid gap-8",
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {farmersData.farmers.map((farmer, index) => {
                  const specializations = farmer.profile?.specializations
                    ? JSON.parse(farmer.profile.specializations)
                    : [];
                  return (
                    <SlideInOnScroll key={farmer.id} delay={index * 0.1}>
                      <Card
                        className={cn(
                          "glassmorphism overflow-hidden hover:scale-105 transition-all duration-300 group",
                          viewMode === "list" && "flex flex-row"
                        )}
                      >
                        {/* Farmer Avatar */}
                        <div
                          className={cn(
                            "bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 relative",
                            viewMode === "grid"
                              ? "aspect-square"
                              : "w-48 flex-shrink-0"
                          )}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-2xl">
                                {farmer.profile?.name?.charAt(0) || "F"}
                              </span>
                            </div>
                          </div>

                          {/* Verification Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-500 text-white">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          </div>

                          {/* Rating Badge */}
                          <div className="absolute bottom-4 left-4">
                            <Badge className="bg-background/90 text-foreground">
                              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {farmer.averageRating?.toFixed(1) || "0.0"}
                            </Badge>
                          </div>
                        </div>

                        {/* Farmer Info */}
                        <CardContent className="p-6 flex-1">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {farmer.profile?.name || "Unknown Farmer"}
                              </h3>

                              {/* Location */}
                              {farmer.profile?.location && (
                                <div className="flex items-center text-muted-foreground mb-2">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span className="text-sm">
                                    {JSON.parse(farmer.profile.location)
                                      .district || "Rwanda"}
                                  </span>
                                </div>
                              )}

                              {/* Rating */}
                              <div className="flex items-center space-x-2 mb-3">
                                <StarRating
                                  rating={farmer.averageRating || 0}
                                  readonly
                                  size="sm"
                                />
                                <span className="text-sm text-muted-foreground">
                                  ({farmer.reviewCount || 0} reviews)
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-muted-foreground line-clamp-3">
                              {farmer.profile?.description ||
                                "Dedicated farmer providing quality produce."}
                            </p>

                            {/* Specializations */}
                            {specializations.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {specializations
                                  .slice(0, 3)
                                  .map((spec: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {spec}
                                    </Badge>
                                  ))}
                                {specializations.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{specializations.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Stats */}

                            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b text-center">
                              <div>
                                <div className="font-bold text-primary">
                                  N/A
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Products
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-primary">
                                  {farmer._count?.ordersAsFarmer || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Orders
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-primary">
                                  {farmer.createdAt
                                    ? Math.floor(
                                        (Date.now() -
                                          new Date(
                                            farmer.createdAt
                                          ).getTime()) /
                                          (1000 * 60 * 60 * 24 * 30)
                                      )
                                    : 0}
                                  m
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Experience
                                </div>
                              </div>
                            </div>

                            {/* Contact Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-primary text-white"
                                asChild
                              >
                                <Link href={`/farmers/${farmer.id}`}>
                                  View Profile
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </SlideInOnScroll>
                  );
                })}
              </div>

              {/* Pagination */}
              {farmersData.pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>

                    {[...Array(Math.min(5, farmersData.pagination.pages))].map(
                      (_, i) => {
                        const pageNum = Math.max(1, page - 2) + i;
                        if (pageNum > farmersData.pagination.pages) return null;

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      disabled={page === farmersData.pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <SlideInOnScroll>
              <Card className="glassmorphism">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">No farmers found</h3>
                  <p className="text-muted-foreground mb-8">
                    {activeFiltersCount > 0
                      ? "Try adjusting your search criteria or filters"
                      : "No farmers are currently available"}
                  </p>
                  {activeFiltersCount > 0 && (
                    <Button onClick={clearFilters}>Clear All Filters</Button>
                  )}
                </CardContent>
              </Card>
            </SlideInOnScroll>
          )}
        </div>
      </section>
    </div>
  );
}
