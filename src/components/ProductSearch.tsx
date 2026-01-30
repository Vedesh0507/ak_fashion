import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

// Import demo product images
import banarasTeal from "@/assets/banaras-saree-teal.jpeg";
import bandhaniGreen from "@/assets/bandhani-green.jpeg";
import palluRed from "@/assets/pallu-red.jpeg";
import floralSilver from "@/assets/floral-silver.jpeg";
import kundanPink from "@/assets/kundan-pink.jpeg";
import giniMustardOrange from "@/assets/gini-MustardOrange.jpeg";
import dupattaBlushPink from "@/assets/dupattu-BlushPink.jpeg";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

// Demo products for search
const demoProducts: SearchResult[] = [
  {
    id: "demo-banarasi-saree",
    name: "Banarasi Silk Saree with Zari Work",
    price: 1500,
    image_url: banarasTeal,
    category: "Designer Saree",
  },
  {
    id: "demo-bandhani-saree",
    name: "Bandhani Saree with Smooth Finish",
    price: 900,
    image_url: bandhaniGreen,
    category: "Daily Wear",
  },
  {
    id: "demo-pattu-silk-saree",
    name: "Pattu Silk Saree with Shiny Thread",
    price: 900,
    image_url: palluRed,
    category: "Designer Saree",
  },
  {
    id: "demo-floral-georgette-saree",
    name: "Floral Georgette Saree",
    price: 1800,
    image_url: floralSilver,
    category: "Designer Saree",
  },
  {
    id: "demo-kundan-georgette-dress",
    name: "Kundan Georgette Dress",
    price: 1799,
    image_url: kundanPink,
    category: "Dress Material",
  },
  {
    id: "demo-gini-cloth-saree",
    name: "Gini Cloth Saree",
    price: 1500,
    image_url: giniMustardOrange,
    category: "Designer Saree",
  },
  {
    id: "demo-cotton-dupatta-dress",
    name: "Cotton Embroidered Dupatta Dress",
    price: 900,
    image_url: dupattaBlushPink,
    category: "Dress Material",
  },
];

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Search in Supabase database
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, image_url, category')
          .eq('is_active', true)
          .ilike('name', `%${query}%`)
          .limit(6);

        if (error) throw error;
        
        // Also search in demo products
        const lowerQuery = query.toLowerCase();
        const matchingDemoProducts = demoProducts.filter(product => 
          product.name.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery)
        );
        
        // Combine results (database first, then demo products)
        const dbResults = data || [];
        const combinedResults = [...dbResults, ...matchingDemoProducts];
        
        // Remove duplicates and limit to 8 results
        const uniqueResults = combinedResults.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        ).slice(0, 8);
        
        setResults(uniqueResults);
      } catch (error) {
        console.error('Search error:', error);
        // If database fails, still show demo products
        const lowerQuery = query.toLowerCase();
        const matchingDemoProducts = demoProducts.filter(product => 
          product.name.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery)
        );
        setResults(matchingDemoProducts.slice(0, 8));
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/50 transition-colors"
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <span className="text-sm font-bold text-gold">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
