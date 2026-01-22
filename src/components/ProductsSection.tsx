import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

// Fallback products for when database is empty
import pinkSuit from "@/assets/product-pink-suit.jpeg";
import greenSuit from "@/assets/product-green-suit.jpeg";
import magentaSuit from "@/assets/product-magenta-suit.jpeg";
import greenSaree from "@/assets/product-green-saree.jpeg";
import banarasTeal from "@/assets/banaras-saree-teal.jpeg";
import bandhaniGreen from "@/assets/bandhani-green.jpeg";
import palluRed from "@/assets/pallu-red.jpeg";
import floralSilver from "@/assets/floral-silver.jpeg";
import kundanPink from "@/assets/kundan-pink.jpeg";
import giniMustardOrange from "@/assets/gini-MustardOrange.jpeg";
import dupattaBlushPink from "@/assets/dupattu-BlushPink.jpeg";

const fallbackProducts = [
  {
    id: "demo-cotton-dupatta-dress",
    name: "Cotton Embroidered Dupatta Dress",
    description: "Cotton dress with embroidery work and Kundan, available with large embroidered dupatta. Also available in other colors.",
    price: 900,
    original_price: 1100,
    image_url: dupattaBlushPink,
    category: "Dress Material",
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-gini-cloth-saree",
    name: "Gini Cloth Saree",
    description: "Gini cloth saree with smooth silk fabric and beautiful stunning work all over. Also available in other colors.",
    price: 1500,
    original_price: 1700,
    image_url: giniMustardOrange,
    category: "Designer Saree",
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-kundan-georgette-dress",
    name: "Kundan Georgette Dress",
    description: "Pure georgette dress with embroidery work along with Kundan and dupatta with border work. Also available in other colors.",
    price: 1799,
    original_price: 1999,
    image_url: kundanPink,
    category: "Dress Material",
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-floral-georgette-saree",
    name: "Floral Georgette Saree",
    description: "Pure georgette saree with work on border and beautiful floral design. Also available in other colors.",
    price: 1800,
    original_price: 2100,
    image_url: floralSilver,
    category: "Designer Saree",
    stock_quantity: 20,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-pattu-silk-saree",
    name: "Pattu Silk Saree with Shiny Thread",
    description: "Silk saree with shiny thread all over the saree and pallu. Also available in stunning colors.",
    price: 900,
    original_price: 1400,
    image_url: palluRed,
    category: "Designer Saree",
    stock_quantity: 25,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-bandhani-saree",
    name: "Bandhani Saree with Smooth Finish",
    description: "Bandhani saree with smooth finishing cloth as shown. Also available in different colors.",
    price: 900,
    original_price: 1400,
    image_url: bandhaniGreen,
    category: "Daily Wear",
    stock_quantity: 30,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-banarasi-saree",
    name: "Banarasi Silk Saree with Zari Work",
    description: "Exquisite Banarasi silk saree featuring intricate zari work. Available in 4 stunning colors - Teal, Mauve, Lavender & Mint.",
    price: 1500,
    original_price: 1800,
    image_url: banarasTeal,
    category: "Designer Saree",
    stock_quantity: 25,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const ProductCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-card">
    <Skeleton className="aspect-[3/4] w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-6 w-24" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  </div>
);

const ProductsSection = () => {
  const { data: products, isLoading } = useProducts();
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    minPrice: 0,
    maxPrice: 10000,
  });
  const [sort, setSort] = useState('newest');
  
  // Use database products if available, otherwise use fallbacks
  const baseProducts = products && products.length > 0 ? products : fallbackProducts;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...baseProducts];

    // Apply category filter
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // Apply price filter
    result = result.filter(p => 
      Number(p.price) >= filters.minPrice && Number(p.price) <= filters.maxPrice
    );

    // Apply sorting
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [baseProducts, filters, sort]);

  return (
    <section className="py-12 md:py-16 bg-cream-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-3">
            New Arrivals
          </h2>
          <div className="w-20 h-1 bg-gradient-gold mx-auto rounded-full"></div>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Fresh styles handpicked for you. Add to cart or order via WhatsApp.
          </p>
        </div>

        {/* Filters and Sort */}
        <ProductFilters 
          onFilterChange={setFilters} 
          onSortChange={setSort} 
        />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.slice(0, 10).map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No products found matching your filters.
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <a href="tel:7680924488">
            <Button variant="gold" size="lg">
              <Phone className="w-5 h-5" />
              Call for More Collection: 7680924488
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
