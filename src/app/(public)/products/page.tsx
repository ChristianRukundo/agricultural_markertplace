"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  X,
  ShoppingCart,
  Heart,
  Loader2,
  Filter,
  List,
  Grid,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  CartSliderProvider,
  useCartSlider,
} from "@/components/products/CartSliderProvider";
import { CartSlider } from "@/components/products/CartSlider";
import { ProductCard } from "@/components/products/ProductCard";
import { PaginationControls } from "@/components/products/PaginationControls";
import { DatePicker } from "@/components/common/DatePicker";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/trpc/client";
import { cn, formatPrice } from "@/lib/utils";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { RWANDA_LOCATIONS } from "@/constants/rwandaLocations";
import { ProductStatus } from "@prisma/client";
import { useSession } from "next-auth/react";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest" },
  { value: "unitPrice-asc", label: "Price: Low to High" },
  { value: "unitPrice-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
];

const PRODUCT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "SOLD_OUT", label: "Sold Out" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DRAFT", label: "Draft" },
];

function FallbackRender({ error }: FallbackProps) {
  const utils = api.useUtils();
  return (
    <div
      role="alert"
      className="text-center p-8 bg-red-100 text-red-700 rounded-lg"
    >
      <p className="font-bold mb-2">Something went wrong fetching products:</p>
      <pre className="whitespace-pre-wrap text-sm">{error.message}</pre>
      <Button onClick={() => utils.product.getProducts.invalidate()}>
        Try again
      </Button>
    </div>
  );
}

function ProductsPageContent() {
    const { openCart } = useCartSlider();
    const { data: session } = useSession();
    const utils = api.useUtils();
  
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [dateRange, setDateRange] = useState<{
      from: Date | undefined;
      to: Date | undefined;
    } | null>(null);
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [minOrderQuantity, setMinOrderQuantity] = useState<string>("");
    const [maxOrderQuantity, setMaxOrderQuantity] = useState<string>("");
    const [productStatus, setProductStatus] = useState<ProductStatus | "">("");
    const [provinceFilter, setProvinceFilter] = useState("");
    const [districtFilter, setDistrictFilter] = useState("");
    const [sectorFilter, setSectorFilter] = useState("");
    const [sortBy, setSortBy] = useState("createdAt-desc");
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showFilters, setShowFilters] = useState(false);
  
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedMinPrice = useDebounce(minPrice, 500);
    const debouncedMaxPrice = useDebounce(maxPrice, 500);
    const debouncedMinOrderQuantity = useDebounce(minOrderQuantity, 500);
    const debouncedMaxOrderQuantity = useDebounce(maxOrderQuantity, 500);
  
    const productQueryInput = useMemo(() => {
      const [sortField, sortOrder] = sortBy.split("-") as [
        "createdAt" | "unitPrice" | "name",
        "asc" | "desc"
      ];
  
      const locationParts = [provinceFilter, districtFilter, sectorFilter].filter(
        Boolean
      );
      const locationString =
        locationParts.length > 0
          ? JSON.stringify({
              province: provinceFilter || undefined,
              district: districtFilter || undefined,
              sector: sectorFilter || undefined,
            })
          : undefined;
  
      return {
        page,
        limit: PAGE_SIZE,
        sortBy: sortField,
        sortOrder,
        search: debouncedSearchTerm || undefined,
        categoryId: categoryId || undefined,
        dateFrom: dateRange?.from,
        dateTo: dateRange?.to,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        minOrderQuantity: debouncedMinOrderQuantity
          ? parseInt(debouncedMinOrderQuantity)
          : undefined,
        maxOrderQuantity: debouncedMaxOrderQuantity
          ? parseInt(debouncedMaxOrderQuantity)
          : undefined,
        status: productStatus === "" ? undefined : productStatus,
        location: locationString,
      };
    }, [
      page,
      sortBy,
      debouncedSearchTerm,
      categoryId,
      dateRange,
      debouncedMinPrice,
      debouncedMaxPrice,
      debouncedMinOrderQuantity,
      debouncedMaxOrderQuantity,
      productStatus,
      provinceFilter,
      districtFilter,
      sectorFilter,
    ]);
  
    const { data: productsData, isLoading: isProductsLoading } =
      api.product.getProducts.useQuery(productQueryInput);
  
    const { data: categoriesData } = api.category.getAll.useQuery({});
    const { data: savedProductsData, isLoading: isSavedProductsLoading } =
      api.savedProduct.getAll.useQuery();
  
    const { data: cartDataForCount, isLoading: isCartCountLoading } =
      api.cart.getCart.useQuery(undefined, {
        enabled: session?.user?.role === "SELLER",
        staleTime: 0,
      });
    const cartItemCount = cartDataForCount?.items.length || 0;
  
    const handleFilterChange = (
        setter: React.Dispatch<React.SetStateAction<any>>,
        value: any
      ) => {
        setter(value);
        setPage(1);
      };
      
  
    const clearAllFilters = () => {
      setSearchTerm("");
      setCategoryId("");
      setDateRange(null);
      setMinPrice("");
      setMaxPrice("");
      setMinOrderQuantity("");
      setMaxOrderQuantity("");
      setProductStatus("");
      setProvinceFilter("");
      setDistrictFilter("");
      setSectorFilter("");
      setSortBy("createdAt-desc");
      setPage(1);
    };
  
    const activeFiltersCount = useMemo(() => {
      let count = 0;
      if (searchTerm) count++;
      if (categoryId) count++;
      if (dateRange?.from || dateRange?.to) count++;
      if (minPrice) count++;
      if (maxPrice) count++;
      if (minOrderQuantity) count++;
      if (maxOrderQuantity) count++;
      if (productStatus) count++;
      if (provinceFilter || districtFilter || sectorFilter) count++;
      return count;
    }, [
      searchTerm,
      categoryId,
      dateRange,
      minPrice,
      maxPrice,
      minOrderQuantity,
      maxOrderQuantity,
      productStatus,
      provinceFilter,
      districtFilter,
      sectorFilter,
    ]);
  
    const totalProducts = productsData?.pagination.total || 0;
    const totalPages = productsData?.pagination.pages || 0;
  
    const provinceOptions = useMemo(() => {
      return [
        { value: "", label: "All Provinces" },
        ...RWANDA_LOCATIONS.map((p) => ({ value: p.name, label: p.name })),
      ];
    }, []);
  
    const districtOptions = useMemo(() => {
      if (!provinceFilter) return [{ value: "", label: "All Districts" }];
      const selectedProvince = RWANDA_LOCATIONS.find(
        (p) => p.name === provinceFilter
      );
      return [
        { value: "", label: "All Districts" },
        ...(selectedProvince?.districts.map((d) => ({
          value: d.name,
          label: d.name,
        })) || []),
      ];
    }, [provinceFilter]);
  
    const sectorOptions = useMemo(() => {
      if (!provinceFilter || !districtFilter)
        return [{ value: "", label: "All Sectors" }];
      const selectedProvince = RWANDA_LOCATIONS.find(
        (p) => p.name === provinceFilter
      );
      const selectedDistrict = selectedProvince?.districts.find(
        (d) => d.name === districtFilter
      );
      return [
        { value: "", label: "All Sectors" },
        ...(selectedDistrict?.sectors.map((s) => ({
          value: s.name,
          label: s.name,
        })) || []),
      ];
    }, [provinceFilter, districtFilter]);
  
    const categoryOptions = useMemo(() => {
      const options =
        categoriesData?.categories.map((c) => ({ value: c.id, label: c.name })) ||
        [];
      return [{ value: "", label: "All Categories" }, ...options];
    }, [categoriesData]);
  
    const ProductGridSkeleton = () => (
      <div
        className={cn(
          "grid gap-8",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1"
        )}
      >
        {[...Array(PAGE_SIZE)].map((_, i) => (
          <Card
            key={i}
            className={cn("h-full", viewMode === "list" && "flex flex-row")}
          >
            <div className="animate-pulse flex-1">
              <div
                className={cn(
                  "bg-muted/80 rounded-t-lg",
                  viewMode === "grid" ? "aspect-[4/3]" : "w-32 h-32 flex-shrink-0"
                )}
              ></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  
    return (
      <div className="min-h-screen bg-background">
        <CartSlider />
  
        <section className="py-20 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="flex items-center justify-between mb-12">
                <div className="text-left flex-1">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-primary via-green-500 to-secondary-foreground bg-clip-text text-transparent">
                    AgriConnect Marketplace
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    Discover the freshest produce directly from verified farmers
                    across Rwanda.
                  </p>
                </div>
  
                {session?.user?.role === "SELLER" && (
                  <div className="flex-shrink-0 ml-8">
                    <Button
                      onClick={openCart}
                      className="relative px-6 py-3 text-lg"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      View Cart
                      {isCartCountLoading ? (
                        <Loader2 className="absolute top-1/2 -translate-y-1/2 right-2 w-4 h-4 animate-spin text-white" />
                      ) : (
                        cartItemCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 text-xs">
                            {cartItemCount}
                          </Badge>
                        )
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </FadeIn>
  
            <SlideInOnScroll>
              <Card className="p-6 bg-background/80 backdrop-blur-md border shadow-lg rounded-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                  <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search for products, e.g., 'Organic Tomatoes'..."
                      value={searchTerm}
                      onChange={(e) =>
                        handleFilterChange(setSearchTerm, e.target.value)
                      }
                      className="pl-12 h-12 text-base rounded-md"
                    />
                  </div>
                  <Select
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(val) => handleFilterChange(setSortBy, val)}
                    placeholder="Sort by"
                    className="w-full"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative h-12"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
  
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Category
                      </label>
                      <Select
                        options={categoryOptions}
                        value={categoryId}
                        onChange={(val) => handleFilterChange(setCategoryId, val)}
                        placeholder="Select category"
                        className="w-full"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Price Range (RWF)
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) =>
                            handleFilterChange(setMinPrice, e.target.value)
                          }
                          className="w-1/2"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) =>
                            handleFilterChange(setMaxPrice, e.target.value)
                          }
                          className="w-1/2"
                        />
                      </div>
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Order Quantity
                      </label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Min Qty"
                          value={minOrderQuantity}
                          onChange={(e) =>
                            handleFilterChange(
                              setMinOrderQuantity,
                              e.target.value
                            )
                          }
                          className="w-1/2"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max Qty"
                          value={maxOrderQuantity}
                          onChange={(e) =>
                            handleFilterChange(
                              setMaxOrderQuantity,
                              e.target.value
                            )
                          }
                          className="w-1/2"
                        />
                      </div>
                    </div>
  
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Availability Date
                      </label>
                      <DatePicker
                        value={dateRange}
                        onChange={(val) => handleFilterChange(setDateRange, val)}
                        placeholder="Select date range"
                        className="w-full"
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">
                        Product Status
                      </label>
                      <Select
                        options={PRODUCT_STATUS_OPTIONS}
                        value={productStatus}
                        onChange={(val) =>
                          handleFilterChange(
                            setProductStatus,
                            val as ProductStatus | ""
                          )
                        }
                        placeholder="Select status"
                        className="w-full"
                      />
                    </div>
  
                    <div className="lg:col-span-full grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                          Province
                        </label>
                        <Select
                          options={provinceOptions}
                          value={provinceFilter}
                          onChange={(val) => {
                            handleFilterChange(setProvinceFilter, val);
                            handleFilterChange(setDistrictFilter, "");
                            handleFilterChange(setSectorFilter, "");
                          }}
                          placeholder="Select Province"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                          District
                        </label>
                        <Select
                          options={districtOptions}
                          value={districtFilter}
                          onChange={(val) => {
                            handleFilterChange(setDistrictFilter, val);
                            handleFilterChange(setSectorFilter, "");
                          }}
                          placeholder="Select District"
                          className="w-full"
                          disabled={!provinceFilter}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                          Sector
                        </label>
                        <Select
                          options={sectorOptions}
                          value={sectorFilter}
                          onChange={(val) =>
                            handleFilterChange(setSectorFilter, val)
                          }
                          placeholder="Select Sector"
                          className="w-full"
                          disabled={!districtFilter}
                        />
                      </div>
                    </div>
  
                    {activeFiltersCount > 0 && (
                      <div className="md:col-span-full flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex flex-wrap gap-2">
                          {searchTerm && (
                            <Badge variant="secondary">
                              Search: {searchTerm}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setSearchTerm, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {categoryId && (
                            <Badge variant="secondary">
                              Category:{" "}
                              {
                                categoryOptions.find(
                                  (opt) => opt.value === categoryId
                                )?.label
                              }{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setCategoryId, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {(dateRange?.from || dateRange?.to) && (
                            <Badge variant="secondary">
                              Dates{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setDateRange, null)
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {minPrice && (
                            <Badge variant="secondary">
                              Min Price: {minPrice}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setMinPrice, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {maxPrice && (
                            <Badge variant="secondary">
                              Max Price: {maxPrice}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setMaxPrice, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {minOrderQuantity && (
                            <Badge variant="secondary">
                              Min Qty: {minOrderQuantity}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setMinOrderQuantity, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {maxOrderQuantity && (
                            <Badge variant="secondary">
                              Max Qty: {maxOrderQuantity}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setMaxOrderQuantity, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {productStatus && (
                            <Badge variant="secondary">
                              Status:{" "}
                              {
                                PRODUCT_STATUS_OPTIONS.find(
                                  (opt) => opt.value === productStatus
                                )?.label
                              }{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setProductStatus, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {provinceFilter && (
                            <Badge variant="secondary">
                              Province: {provinceFilter}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setProvinceFilter, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {districtFilter && (
                            <Badge variant="secondary">
                              District: {districtFilter}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setDistrictFilter, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                          {sectorFilter && (
                            <Badge variant="secondary">
                              Sector: {sectorFilter}{" "}
                              <button
                                onClick={() =>
                                  handleFilterChange(setSectorFilter, "")
                                }
                                className="ml-1 hover:text-destructive text-xs"
                              >
                                x
                              </button>
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" onClick={clearAllFilters}>
                          <X className="w-4 h-4 mr-2" /> Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </SlideInOnScroll>
          </div>
        </section>
  
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SlideInOnScroll direction="left">
                <Card className="glassmorphism p-6 sticky top-24">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      My Saved Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto">
                    {isSavedProductsLoading ? (
                      <div className="flex flex-col space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-3 animate-pulse"
                          >
                            <div className="w-12 h-12 bg-muted rounded-md"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : savedProductsData && savedProductsData.length > 0 ? (
                      savedProductsData.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.productId}`}
                          className="flex items-center space-x-3 group hover:bg-muted/50 p-2 rounded-md transition-colors"
                        >
                          <Image
                            src={item.product.imageUrls[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm group-hover:text-primary line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(Number(item.product.unitPrice))}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm">No saved products yet.</p>
                        <Link
                          href="/products"
                          className="text-primary text-sm hover:underline mt-2 inline-block"
                        >
                          Browse to save
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SlideInOnScroll>
            </div>
  
            <div className="lg:col-span-3 space-y-8">
              <FadeIn delay={0.1}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {isProductsLoading
                      ? "Loading Products..."
                      : `${totalProducts} Products Found`}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">View:</span>
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
              </FadeIn>
  
              <ErrorBoundary
                FallbackComponent={FallbackRender}
                onReset={() => utils.product.getProducts.invalidate()}
              >
                {isProductsLoading ? (
                  <ProductGridSkeleton />
                ) : productsData && productsData.products.length > 0 ? (
                  <div
                    className={cn(
                      "grid gap-8",
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {productsData.products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        delay={index * 0.05}
                      />
                    ))}
                  </div>
                ) : (
                  <SlideInOnScroll>
                    <Card className="glassmorphism">
                      <CardContent className="p-12 text-center">
                        <Search className="mx-auto w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-2xl font-bold">No Products Found</h3>
                        <p className="text-muted-foreground mt-2 mb-6">
                          Try adjusting your search or filters to find what you&apos;re
                          looking for.
                        </p>
                        {activeFiltersCount > 0 && (
                          <Button onClick={clearAllFilters}>
                            Clear All Filters
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </SlideInOnScroll>
                )}
              </ErrorBoundary>
  
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
          </div>
        </section>
  
        {session?.user?.role === "SELLER" && (
          <Button
            onClick={openCart}
            className="fixed bottom-6 right-6 z-30 rounded-full w-16 h-16 shadow-lg bg-primary text-white flex items-center justify-center animate-bounce-subtle"
            aria-label="Open shopping cart"
          >
            <ShoppingCart className="w-7 h-7" />
            {isCartCountLoading ? (
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white" />
            ) : (
              cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center p-0 text-sm">
                  {cartItemCount}
                </Badge>
              )
            )}
          </Button>
        )}
      </div>
    );
  }
  
  export default function ProductsPageWrapper() {
    return (
      <CartSliderProvider>
        <ProductsPageContent />
      </CartSliderProvider>
    );
  }