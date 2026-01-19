import { Phone, MapPin, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CartSheet from "@/components/CartSheet";
import ProductSearch from "@/components/ProductSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";

const Header = () => {
  const { user } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-serif text-2xl md:text-3xl font-bold text-primary">
              AK <span className="text-gold italic">Fashion Hub</span>
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <ProductSearch />
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-sm">Nizampet, Khammam</span>
            </div>
            <a href="tel:7680924488" className="flex items-center gap-2 text-primary hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              <span className="font-medium">7680924488</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Profile/Auth */}
            <Link to={user ? "/profile" : "/auth"}>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            <CartSheet />
            
            <a href="tel:7680924488" className="md:hidden">
              <Button variant="call" size="sm">
                <Phone className="w-4 h-4" />
                Call
              </Button>
            </a>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-3">
          <ProductSearch />
        </div>
      </div>
    </header>
  );
};

export default Header;
