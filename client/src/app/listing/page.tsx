"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useProductStore } from "@/store/useProductStore";
import { brands, categories, sizes } from "@/utils/config";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const colors = [
  { name: "Navy", class: "bg-[#0F172A]" },
  { name: "Yellow", class: "bg-[#FCD34D]" },
  { name: "White", class: "bg-white border" },
  { name: "Orange", class: "bg-[#FB923C]" },
  { name: "Green", class: "bg-[#22C55E]" },
  { name: "Pink", class: "bg-[#EC4899]" },
  { name: "Cyan", class: "bg-[#06B6D4]" },
  { name: "Blue", class: "bg-[#3B82F6]" },
];

function ProductListingPage() {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const router = useRouter();
  const {
    products,
    currentPage,
    totalProducts,
    totalPages,
    setCurrentPage,
    fetchProductsForClient,
    isLoading,
    error,
  } = useProductStore();

  const fetchAllProducts = () => {
    fetchProductsForClient({
      page: currentPage,
      limit: 5,
      categories: selectedCategories,
      sizes: selectedSizes,
      colors: selectedColors,
      brands: selectedBrands,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy,
      sortOrder,
    });
  };

  useEffect(() => {
    fetchAllProducts();
  }, [
    currentPage,
    selectedCategories,
    selectedSizes,
    selectedBrands,
    selectedColors,
    priceRange,
    sortBy,
    sortOrder,
  ]);

  const handleSortChange = (value: string) => {
    console.log(value);
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as "asc" | "desc");
  };

  const handleToggleFilter = (
    filterType: "categories" | "sizes" | "brands" | "colors",
    value: string
  ) => {
    const setterMap = {
      categories: setSelectedCategories,
      sizes: setSelectedSizes,
      colors: setSelectedColors,
      brands: setSelectedBrands,
    };

    setterMap[filterType]((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const FilterSection = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-semibold">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    handleToggleFilter("categories", category)
                  }
                  id={category}
                />
                <Label htmlFor={category} className="ml-2 text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Brands</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleToggleFilter("brands", brand)}
                  id={brand}
                />
                <Label htmlFor={brand} className="ml-2 text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sizeItem) => (
              <Button
                key={sizeItem}
                variant={
                  selectedSizes.includes(sizeItem) ? "default" : "outline"
                }
                onClick={() => handleToggleFilter("sizes", sizeItem)}
                className="h-8 w-8"
                size="sm"
              >
                {sizeItem}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                className={`w-6 h-6 rounded-full ${color.class} ${
                  selectedColors.includes(color.name)
                    ? "ring-offset-2 ring-black ring-2"
                    : ""
                }`}
                title={color.name}
                onClick={() => handleToggleFilter("colors", color.name)}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Price range</h3>
          <Slider
            defaultValue={[0, 100000]}
            max={100000}
            step={1}
            className="w-full"
            value={priceRange}
            onValueChange={(value) => setPriceRange(value)}
          />
          <div className="flex justify-between mt-2 text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
    );
  };

  console.log(totalPages, totalProducts, products);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[300px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
          alt="Listing Page Banner"
          className="w-full object-cover h-full "
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">HOT COLLECTION</h1>
            <p className="text-lg">Discover our latest collection</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">All Products</h2>
          <div className="flex items-center gap-4">
            {/* Mobile filter render */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"outline"} className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-h-[600px] overflow-auto max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <FilterSection />
              </DialogContent>
            </Dialog>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => handleSortChange(value)}
              name="sort"
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-asc">Sort by: Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price : High to Low</SelectItem>
                <SelectItem value="createdAt-desc">
                  Sort by: Newest First
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSection />
          </div>
          {/* product grid */}
          <div className="flex-1">
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>Error: {error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((productItem) => (
                  <div
                    onClick={() => router.push(`/listing/${productItem.id}`)}
                    key={productItem.id}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] mb-4 bg-gray-100 overflow-hidden">
                      <img
                        src={productItem.images[0]}
                        alt={productItem.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button className="bg-white text-black hover:bg-gray-100">
                          Quick View
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold">{productItem.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold">
                        ${productItem.price.toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        {productItem.colors.map((colorItem, index) => (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded-full border `}
                            style={{ backgroundColor: colorItem }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* pagination */}
            <div className="mt-10 items-center flex justify-center gap-2">
              <Button
                disabled={currentPage === 1}
                variant={"outline"}
                size={"icon"}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    className="w-10"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                disabled={currentPage === totalPages}
                variant={"outline"}
                size={"icon"}
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListingPage;
