import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
}

const ProductFilters = ({ onFilterChange, onSortChange }: ProductFiltersProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
  });
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true);
    
    if (data) {
      setCategories(data.map(c => c.name));
    }
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category: category === 'all' ? '' : category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceChangeComplete = () => {
    const newFilters = { ...filters, minPrice: priceRange[0], maxPrice: priceRange[1] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    const defaultFilters = { category: '', minPrice: 0, maxPrice: 10000 };
    setFilters(defaultFilters);
    setPriceRange([0, 10000]);
    setSort('newest');
    onFilterChange(defaultFilters);
    onSortChange('newest');
  };

  const hasActiveFilters = filters.category || filters.minPrice > 0 || filters.maxPrice < 10000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Category</h4>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.category === '' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryChange('all')}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={filters.category === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeComplete}
            max={10000}
            min={0}
            step={100}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0].toLocaleString()}</span>
            <span>₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        {/* Mobile Filter Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Category Badges */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <Badge
            variant={filters.category === '' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => handleCategoryChange('all')}
          >
            All
          </Badge>
          {categories.slice(0, 4).map((cat) => (
            <Badge
              key={cat}
              variant={filters.category === cat ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      <Select value={sort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="name">Name A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductFilters;
