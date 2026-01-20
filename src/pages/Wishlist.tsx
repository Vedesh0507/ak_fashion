import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const Wishlist = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { items, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { message: 'Please login to view your wishlist' } });
    }
  }, [user, loading, navigate]);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl md:text-3xl font-serif font-bold">My Wishlist</h1>
          <span className="text-muted-foreground">({items.length} items)</span>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Save items you love by clicking the heart icon
              </p>
              <Link to="/">
                <Button variant="gold">Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group">
                <Link to={`/product/${item.product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Heart className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {/* Color variant badge */}
                    {item.color_variant && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-300" 
                          style={{ backgroundColor: item.color_variant.hexCode }}
                        />
                        <span className="text-xs font-medium text-gray-700">{item.color_variant.name}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="font-serif font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-2">{item.product.category}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-gold">
                      ₹{Number(item.product.price).toLocaleString()}
                    </span>
                    {item.product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{Number(item.product.original_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(item.product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromWishlist(item.product.id, item.color_variant_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
