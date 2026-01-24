import { Phone, MapPin, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CartSheet from "@/components/CartSheet";
import ProductSearch from "@/components/ProductSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import akLogo from "@/assets/ak-fashion-hub-logo.png";

const Header = () => {
  const { user } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();

  return (
    <>
      {/* Sticky Header - Logo and Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src={akLogo} 
                  alt="AK Fashion Hub logo" 
                  className="h-10 md:h-12 w-auto object-contain"
                  loading="eager"
                />
              </Link>
            </div>
            
            {/* Search Bar - Desktop (in header) */}
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
        </div>
      </header>

      {/* Search Bar - Mobile (not sticky, scrolls with content) */}
      <div className="md:hidden bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <ProductSearch />
        </div>
      </div>
    </>
  );
};

export default Header;
