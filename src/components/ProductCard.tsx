import { Button } from "@/components/ui/button";
import { ShoppingBag, MessageCircle, Heart } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isAnyVariantInWishlist, addToWishlist, removeFromWishlist, items } = useWishlist();
  const { user } = useAuth();
  const inWishlist = isAnyVariantInWishlist(product.id);
  
  const discount = product.original_price 
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  // Count how many variants of this product are in wishlist
  const variantsInWishlist = items.filter(item => item.product_id === product.id);
  const variantCount = variantsInWishlist.length;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist && variantCount === 1 && !variantsInWishlist[0].color_variant_id) {
      // Only remove if there's a single entry without color variant
      removeFromWishlist(product.id);
    } else if (!inWishlist) {
      // Add without color variant (user can add specific colors from product detail)
      addToWishlist(product.id);
    }
    // If there are multiple variants or a variant with color, don't remove from card view
    // User should go to wishlist page to manage individual variants
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift block"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
            {product.category}
          </span>
          {discount > 0 && (
            <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {discount}% OFF
            </span>
          )}
        </div>
        
        {/* Wishlist button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-md hover:bg-card transition-colors"
        >
          <Heart 
            className={`h-5 w-5 transition-colors ${
              inWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`} 
          />
        </button>
        
        {/* Quick WhatsApp button on hover */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <a 
            href={`https://wa.me/917680924488?text=Hi! I'm interested in ${encodeURIComponent(product.name)}`}
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <Button variant="whatsapp" size="icon" className="rounded-full shadow-lg">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-gold font-bold text-lg md:text-xl">₹{Number(product.price).toLocaleString()}</p>
          {product.original_price && (
            <p className="text-muted-foreground text-sm line-through">
              ₹{Number(product.original_price).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
