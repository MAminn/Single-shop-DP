import { useEffect, useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#root/components/ui/select';
import { Link } from '#root/components/Link';
import { Badge } from '#root/components/ui/badge';
import { useToast } from '#root/components/ui/use-toast';
import { Loader2, FilterX, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from '#root/components/ui/button';
import { Checkbox } from '#root/components/ui/checkbox';
import { formatCategoryName } from '#root/lib/utils';
import { ProductCard } from '#root/components/ProductCard';
import { Input } from '#root/components/ui/input';
import { Slider } from '#root/components/ui/slider';
import type { SortingTemplateData } from '../../templateRegistry';

interface ModernSortingTemplateProps {
  data?: SortingTemplateData;
  onUpdateData?: (updates: Partial<SortingTemplateData>) => void;
}

const ModernSortingTemplate: React.FC<ModernSortingTemplateProps> = ({
  data,
  onUpdateData,
}) => {
  // Use provided data or default values
  const products = data?.products || [];
  const isLoading = data?.isLoading || false;
  const sortCriteria = data?.sortCriteria || 'featured';
  const selectedPriceRange = data?.selectedPriceRange || 'all';
  const showFilters = data?.showFilters || false;
  const showMobileFilters = data?.showMobileFilters || false;
  const selectedCategories = data?.selectedCategories || [];
  const categories = data?.categories || [];
  
  // Local state for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on selected categories, price range, and search term
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return (
          product.name.toLowerCase().includes(term) ||
          (product.description?.toLowerCase().includes(term))
        );
      });
    }

    // Filter by selected categories if any
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.categories) return false;
        return product.categories.some((category) =>
          selectedCategories.includes(category.id)
        );
      });
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
      const [minStr, maxStr] = selectedPriceRange.split('-');
      const min = Number(minStr);
      const max = Number(maxStr);

      filtered = filtered.filter((product) => {
        const price =
          product.discountPrice !== undefined && product.discountPrice !== null
            ? typeof product.discountPrice === 'number'
              ? product.discountPrice
              : Number(product.discountPrice) || 0
            : typeof product.price === 'number'
              ? product.price
              : Number(product.price) || 0;

        return price >= min && price <= max;
      });
    }

    // Sort products based on criteria
    switch (sortCriteria) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA =
            a.discountPrice !== undefined && a.discountPrice !== null
              ? typeof a.discountPrice === 'number'
                ? a.discountPrice
                : Number(a.discountPrice) || 0
              : typeof a.price === 'number'
                ? a.price
                : Number(a.price) || 0;
          const priceB =
            b.discountPrice !== undefined && b.discountPrice !== null
              ? typeof b.discountPrice === 'number'
                ? b.discountPrice
                : Number(b.discountPrice) || 0
              : typeof b.price === 'number'
                ? b.price
                : Number(b.price) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA =
            a.discountPrice !== undefined && a.discountPrice !== null
              ? typeof a.discountPrice === 'number'
                ? a.discountPrice
                : Number(a.discountPrice) || 0
              : typeof a.price === 'number'
                ? a.price
                : Number(a.price) || 0;
          const priceB =
            b.discountPrice !== undefined && b.discountPrice !== null
              ? typeof b.discountPrice === 'number'
                ? b.discountPrice
                : Number(b.discountPrice) || 0
              : typeof b.price === 'number'
                ? b.price
                : Number(b.price) || 0;
          return priceB - priceA;
        });
        break;
      case 'date-asc':
        filtered.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'date-desc':
        filtered.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
          const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
          return dateB - dateA;
        });
        break;
      // Default to featured
      default:
        // No specific sorting for featured
        break;
    }

    return filtered;
  }, [products, selectedCategories, selectedPriceRange, sortCriteria, searchTerm]);

  // Event handlers that update the data through onUpdateData
  const handleSortChange = (value: string) => {
    onUpdateData?.({ sortCriteria: value });
  };

  const handlePriceRangeChange = (value: string) => {
    onUpdateData?.({ selectedPriceRange: value });
  };

  const toggleCategoryFilter = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onUpdateData?.({ selectedCategories: newSelectedCategories });
  };

  const resetFilters = () => {
    onUpdateData?.({ 
      selectedPriceRange: 'all',
      selectedCategories: [] 
    });
    setSearchTerm('');
  };

  const toggleMobileFilters = () => {
    onUpdateData?.({ showMobileFilters: !showMobileFilters });
  };

  return (
    <div className="w-full bg-gradient-to-b from-purple-50 to-white p-6 rounded-2xl">
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Mobile filter toggle button */}
      <div className="block md:hidden mb-6">
        <Button
          onClick={toggleMobileFilters}
          variant="outline"
          className="w-full bg-white border-purple-200 hover:bg-purple-50 rounded-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2 text-purple-500" />
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters - hidden on mobile until toggled */}
        <div
          className={`${
            showMobileFilters ? "block" : "hidden"
          } md:block w-full md:w-72 shrink-0`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-purple-800 text-lg">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-3 text-xs hover:bg-purple-50 text-purple-600"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Categories Filter */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-4 text-purple-700">Categories</h4>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() =>
                          toggleCategoryFilter(category.id)
                        }
                        className="rounded-sm border-purple-300 text-purple-600"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 hover:text-purple-900 cursor-pointer"
                      >
                        {formatCategoryName(category.name)}
                        {category.productCount !== undefined && (
                          <span className="text-purple-400 ml-1.5 text-xs">
                            ({category.productCount})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="mb-8">
              <h4 className="text-sm font-medium mb-4 text-purple-700">Price Range</h4>
              <Select
                value={selectedPriceRange}
                onValueChange={handlePriceRangeChange}
              >
                <SelectTrigger className="w-full bg-white border-purple-200 rounded-xl">
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-purple-200">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-50">Under 50 EGP</SelectItem>
                  <SelectItem value="50-100">50 - 100 EGP</SelectItem>
                  <SelectItem value="100-200">100 - 200 EGP</SelectItem>
                  <SelectItem value="200-500">200 - 500 EGP</SelectItem>
                  <SelectItem value="500-1000">500 - 1000 EGP</SelectItem>
                  <SelectItem value="1000-999999">Over 1000 EGP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedPriceRange !== 'all' || searchTerm) && (
              <div className="mb-8">
                <h4 className="text-sm font-medium mb-4 text-purple-700">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="outline" className="bg-purple-50 hover:bg-purple-100 text-purple-800 gap-1 border-purple-200">
                        {formatCategoryName(category.name)}
                        <button 
                          type="button"
                          onClick={() => toggleCategoryFilter(categoryId)}
                          className="ml-1 text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                  
                  {selectedPriceRange !== 'all' && (
                    <Badge variant="outline" className="bg-purple-50 hover:bg-purple-100 text-purple-800 gap-1 border-purple-200">
                      Price: {selectedPriceRange.replace('-', ' - ')} EGP
                      <button 
                        type="button"
                        onClick={() => handlePriceRangeChange('all')}
                        className="ml-1 text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  
                  {searchTerm && (
                    <Badge variant="outline" className="bg-purple-50 hover:bg-purple-100 text-purple-800 gap-1 border-purple-200">
                      Search: {searchTerm}
                      <button 
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Close filter button on mobile */}
            <div className="block md:hidden">
              <Button
                onClick={toggleMobileFilters}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-2xl shadow-md border border-purple-100">
            <div>
              <h2 className="text-xl font-semibold text-purple-800">
                {filteredProducts.length} Products
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600">Sort by:</span>
              <Select value={sortCriteria} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] bg-white border-purple-200 rounded-xl">
                  <SelectValue placeholder="Sort products" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-purple-200">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="date-desc">Newest</SelectItem>
                  <SelectItem value="date-asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-md border border-purple-100">
              <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-purple-100">
              <h3 className="text-lg font-medium mb-3 text-purple-800">No products found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters to find what you're looking for
              </p>
              <Button onClick={resetFilters} variant="outline" className="bg-white border-purple-200 hover:bg-purple-50 rounded-full">
                <FilterX className="h-4 w-4 mr-2 text-purple-500" />
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showVendor={true}
                  showImage={true}
                  imageSize="medium"
                  className="h-full transition-all hover:shadow-lg hover:scale-[1.02] rounded-2xl overflow-hidden border border-purple-100"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernSortingTemplate;