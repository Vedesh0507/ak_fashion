import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  MessageCircle, 
  Share2,
  Ruler,
  Bell,
  Check,
  Home,
  Heart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// Demo product images
import pinkSuit from "@/assets/product-pink-suit.jpeg";
import greenSuit from "@/assets/product-green-suit.jpeg";
import magentaSuit from "@/assets/product-magenta-suit.jpeg";
import greenSaree from "@/assets/product-green-saree.jpeg";

// Banarasi Saree color variant images
import banarasTeal from "@/assets/banaras-saree-teal.jpeg";
import banarasMauve from "@/assets/banaras-saree-mauve.jpeg";
import banarasLavender from "@/assets/banaras-saree-lavender.jpeg";
import banarasMint from "@/assets/banaras-saree-mint.jpeg";

// Bandhani Saree color variant images
import bandhaniGreen from "@/assets/bandhani-green.jpeg";
import bandhaniRed from "@/assets/bandhani-red.jpeg";
import bandhaniBlue from "@/assets/bandhani-blue.jpeg";
import bandhaniPink from "@/assets/bandhani-pink.jpeg";
import bandhaniOrange from "@/assets/bandhani-orange.jpeg";
import bandhaniRust from "@/assets/bandhani-rust.jpeg";

// Pattu Silk Saree color variant images
import palluRed from "@/assets/pallu-red.jpeg";
import palluLeafGreen from "@/assets/pallu-LeafGreen.jpeg";
import palluMustardYellow from "@/assets/pallu-MustardYellow.jpeg";
import palluTealGreen from "@/assets/pallu-TealGreen.jpeg";

// Floral Georgette Saree color variant images
import floralSilver from "@/assets/floral-silver.jpeg";
import floralBrown from "@/assets/floral-brown.jpeg";
import floralLightGreen from "@/assets/floral-LighGreen.jpeg";

// Kundan Georgette Dress color variant images
import kundanPink from "@/assets/kundan-pink.jpeg";
import kundanDarkGreen from "@/assets/kundan-darkgreen.jpeg";
import kundanLightGreen from "@/assets/kundan-lightgreen.jpeg";
import kundanViolet from "@/assets/kundan-violet.jpeg";

// Gini Cloth Saree color variant images
import giniMustardOrange from "@/assets/gini-MustardOrange.jpeg";
import giniTealBlue from "@/assets/gini-TealBlue.jpeg";
import giniWinePurple from "@/assets/gini-WinePurple.jpeg";

// Cotton Dupatta Dress color variant images
import dupattaBlushPink from "@/assets/dupattu-BlushPink.jpeg";
import dupattaSageGreen from "@/assets/dupatta-SageGreen.jpeg";
import dupattaSilverGray from "@/assets/dupatta-SilverGray.jpeg";

// Color variant type for products with multiple colors
interface ColorVariant {
  id: string;
  name: string;
  hexCode: string;
  image: string;
}

// Products with color variants (single product, multiple colors)
const productColorVariants: Record<string, ColorVariant[]> = {
  "demo-banarasi-saree": [
    { id: "teal", name: "Teal Blue", hexCode: "#008080", image: banarasTeal },
    { id: "mauve", name: "Dusty Mauve", hexCode: "#B4838D", image: banarasMauve },
    { id: "lavender", name: "Lavender Purple", hexCode: "#9683B8", image: banarasLavender },
    { id: "mint", name: "Mint Green", hexCode: "#7EBDB4", image: banarasMint },
  ],
  "demo-bandhani-saree": [
    { id: "green", name: "Green", hexCode: "#4A7C4E", image: bandhaniGreen },
    { id: "red", name: "Red", hexCode: "#B22234", image: bandhaniRed },
    { id: "blue", name: "Sky Blue", hexCode: "#00A3CC", image: bandhaniBlue },
    { id: "pink", name: "Pink", hexCode: "#C71585", image: bandhaniPink },
    { id: "orange", name: "Orange", hexCode: "#FF8C00", image: bandhaniOrange },
    { id: "rust", name: "Rust", hexCode: "#B7410E", image: bandhaniRust },
  ],
  "demo-pattu-silk-saree": [
    { id: "red", name: "Red", hexCode: "#B22234", image: palluRed },
    { id: "leaf-green", name: "Leaf Green", hexCode: "#4A7C4E", image: palluLeafGreen },
    { id: "mustard-yellow", name: "Mustard Yellow", hexCode: "#FFDB58", image: palluMustardYellow },
    { id: "teal-green", name: "Teal Green", hexCode: "#008080", image: palluTealGreen },
  ],
  "demo-floral-georgette-saree": [
    { id: "silver", name: "Silver", hexCode: "#C0C0C0", image: floralSilver },
    { id: "brown", name: "Brown", hexCode: "#8B4513", image: floralBrown },
    { id: "light-green", name: "Light Green", hexCode: "#90EE90", image: floralLightGreen },
  ],
  "demo-kundan-georgette-dress": [
    { id: "pink", name: "Pink", hexCode: "#FFC0CB", image: kundanPink },
    { id: "sea-green", name: "Sea Green", hexCode: "#2E8B57", image: kundanDarkGreen },
    { id: "teal-green", name: "Teal Green", hexCode: "#008080", image: kundanLightGreen },
    { id: "violet", name: "Violet", hexCode: "#8B008B", image: kundanViolet },
  ],
  "demo-gini-cloth-saree": [
    { id: "mustard-orange", name: "Mustard Orange", hexCode: "#FF8C00", image: giniMustardOrange },
    { id: "teal-blue", name: "Teal Blue", hexCode: "#008080", image: giniTealBlue },
    { id: "wine-purple", name: "Wine Purple", hexCode: "#722F37", image: giniWinePurple },
  ],
  "demo-cotton-dupatta-dress": [
    { id: "blush-pink", name: "Blush Pink", hexCode: "#DE5D83", image: dupattaBlushPink },
    { id: "sage-green", name: "Sage Green", hexCode: "#9DC183", image: dupattaSageGreen },
    { id: "silver-gray", name: "Silver Gray", hexCode: "#C0C0C0", image: dupattaSilverGray },
  ],
};

// Demo products for fallback
const demoProducts: Record<string, Product> = {
  "demo-cotton-dupatta-dress": {
    id: "demo-cotton-dupatta-dress",
    name: "Cotton Embroidered Dupatta Dress",
    description: "It's a cotton dress with embroidery work along with Kundan on it available with large embroidered dupatta. Available in stunning colors - Blush Pink, Sage Green, and Silver Gray.",
    price: 900,
    original_price: 1100,
    image_url: dupattaBlushPink,
    category: "Dress Material",
    stock_quantity: 20,
    is_active: true,
  },
  "demo-gini-cloth-saree": {
    id: "demo-gini-cloth-saree",
    name: "Gini Cloth Saree",
    description: "This is a gini cloth saree with smooth silk fabric beautiful stunning work all over the saree as shown in this image. Available in stunning colors - Mustard Orange, Teal Blue, and Wine Purple.",
    price: 1500,
    original_price: 1700,
    image_url: giniMustardOrange,
    category: "Designer Saree",
    stock_quantity: 20,
    is_active: true,
  },
  "demo-kundan-georgette-dress": {
    id: "demo-kundan-georgette-dress",
    name: "Kundan Georgette Dress",
    description: "It's a pure georgette dress with embroidery work along with Kundan on it and also dupatta designed with border work. Available in stunning colors - Pink, Dark Green, Light Green, and Violet.",
    price: 2899,
    original_price: 3999,
    image_url: kundanPink,
    category: "Dress Material",
    stock_quantity: 20,
    is_active: true,
  },
  "demo-floral-georgette-saree": {
    id: "demo-floral-georgette-saree",
    name: "Floral Georgette Saree",
    description: "Pure georgette saree with work on border and all saree printed with beautiful floral design. Available in stunning colors - Silver, Brown, and Light Green.",
    price: 1800,
    original_price: 2100,
    image_url: floralSilver,
    category: "Designer Saree",
    stock_quantity: 20,
    is_active: true,
  },
  "demo-pattu-silk-saree": {
    id: "demo-pattu-silk-saree",
    name: "Pattu Silk Saree with Shiny Thread",
    description: "Silk saree with shiny thread all over the saree and pallu. We also have stunning colors in this saree - Red, Leaf Green, Mustard Yellow, and Teal Green. Perfect for weddings, festivals, and special occasions.",
    price: 900,
    original_price: 1400,
    image_url: palluRed,
    category: "Designer Saree",
    stock_quantity: 25,
    is_active: true,
  },
  "demo-bandhani-saree": {
    id: "demo-bandhani-saree",
    name: "Bandhani Saree with Smooth Finish",
    description: "Bandhani saree with smooth finishing cloth as shown. Also available in different colors - Green, Red, Sky Blue, Pink, Orange, and Rust. Each piece showcases authentic Bandhani tie-dye patterns with premium quality fabric. Perfect for daily wear, casual occasions, and festive celebrations.",
    price: 900,
    original_price: 1400,
    image_url: bandhaniGreen,
    category: "Daily Wear",
    stock_quantity: 30,
    is_active: true,
  },
  "demo-banarasi-saree": {
    id: "demo-banarasi-saree",
    name: "Banarasi Silk Saree with Zari Work",
    description: "Exquisite Banarasi silk saree featuring intricate zari work and traditional motifs. This luxurious saree is perfect for weddings, festivals, and special celebrations. Made with premium quality silk with rich golden borders and pallu. Available in 4 stunning colors - Teal Blue, Dusty Mauve, Lavender Purple, and Mint Green. Each piece is handcrafted with attention to detail, showcasing the finest Banarasi weaving traditions.",
    price: 1500,
    original_price: 1800,
    image_url: banarasTeal, // Default image (teal)
    category: "Designer Saree",
    stock_quantity: 25,
    is_active: true,
  }
};

interface ProductColor {
  id: string;
  name: string;
  hex_code: string;
  image_url: string | null;
}

interface ProductSize {
  id: string;
  size: string;
  chest_measurement: string | null;
  hip_measurement: string | null;
  stock_quantity: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  stock_quantity: number | null;
  is_active: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  
  // Color variant state for demo products
  const [selectedColorVariant, setSelectedColorVariant] = useState<ColorVariant | null>(null);
  
  // Get color variants for this product (if any)
  const colorVariants = id ? productColorVariants[id] || [] : [];
  const hasColorVariants = colorVariants.length > 0;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Check if this is a demo product first
      if (id && id.startsWith('demo-') && demoProducts[id]) {
        setProduct(demoProducts[id]);
        setColors([]);
        setSizes([]);
        setImages([]);
        setRelatedProducts(Object.values(demoProducts).filter(p => p.id !== id).slice(0, 4));
        
        // Set default color variant if product has color variants
        const variants = productColorVariants[id];
        if (variants && variants.length > 0) {
          setSelectedColorVariant(variants[0]);
        }
        
        setLoading(false);
        return;
      }

      // Fetch product from database
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (productError || !productData) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Fetch colors, sizes, images in parallel
      const [colorsRes, sizesRes, imagesRes, relatedRes] = await Promise.all([
        supabase.from('product_colors').select('*').eq('product_id', id),
        supabase.from('product_sizes').select('*').eq('product_id', id),
        supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
        supabase.from('products')
          .select('*')
          .eq('category', productData.category)
          .eq('is_active', true)
          .neq('id', id)
          .limit(4)
      ]);

      setColors(colorsRes.data || []);
      setSizes(sizesRes.data || []);
      setImages(imagesRes.data || []);
      setRelatedProducts(relatedRes.data || []);

      // Set defaults
      if (colorsRes.data?.length) setSelectedColor(colorsRes.data[0]);
      if (sizesRes.data?.length) setSelectedSize(sizesRes.data[0]);

    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const allImages = images.length > 0 
    ? images.map(img => img.image_url) 
    : hasColorVariants && selectedColorVariant
      ? [selectedColorVariant.image] // Use selected color variant image
      : product?.image_url 
        ? [product.image_url] 
        : [];

  // Current display image (color variant takes priority)
  const currentDisplayImage = hasColorVariants && selectedColorVariant 
    ? selectedColorVariant.image 
    : allImages[currentImageIndex] || product?.image_url;

  const discount = product?.original_price 
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  const isOutOfStock = selectedSize ? selectedSize.stock_quantity === 0 : false;

  const handleAddToCart = async () => {
    if (sizes.length > 0 && !selectedSize) {
      toast({ title: 'Please select a size', variant: 'destructive' });
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast({ title: 'Please select a color', variant: 'destructive' });
      return;
    }
    if (hasColorVariants && !selectedColorVariant) {
      toast({ title: 'Please select a color variant', variant: 'destructive' });
      return;
    }
    if (isOutOfStock) {
      toast({ title: 'This item is out of stock', variant: 'destructive' });
      return;
    }
    
    if (product) {
      // Add to cart with color variant info if applicable
      await addToCart(product.id, selectedColorVariant ? {
        colorName: selectedColorVariant.name,
        colorImage: selectedColorVariant.image,
        colorHex: selectedColorVariant.hexCode
      } : undefined);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    
    let message = `Hi! I'd like to order:\n\n*${product.name}*\nPrice: ₹${Number(product.price).toLocaleString()}`;
    if (selectedColorVariant) message += `\nColor: ${selectedColorVariant.name}`;
    else if (selectedColor) message += `\nColor: ${selectedColor.name}`;
    if (selectedSize) message += `\nSize: ${selectedSize.size}`;
    message += `\n\nPlease confirm availability and share payment details.`;
    
    window.open(`https://wa.me/917680924488?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNotifyMe = async () => {
    if (!notifyEmail || !product) return;
    
    try {
      const { error } = await supabase.from('notify_requests').insert({
        product_id: product.id,
        email: notifyEmail,
        size: selectedSize?.size,
        color: selectedColor?.name
      });

      if (error) throw error;
      
      toast({ title: 'We\'ll notify you when this is back in stock!' });
      setIsNotifyDialogOpen(false);
      setNotifyEmail('');
    } catch (error) {
      toast({ title: 'Failed to submit request', variant: 'destructive' });
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product?.name} at AK Fashion Hub!`;
    
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied to clipboard!' });
    } else {
      window.open(shareUrls[platform], '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, this product doesn't exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/')} variant="gold">
            Browse Our Collection
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | AK Fashion Hub</title>
        <meta name="description" content={product.description || `Shop ${product.name} at AK Fashion Hub`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.category}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream">
                {currentDisplayImage ? (
                  <img
                    src={currentDisplayImage}
                    alt={`${product.name}${selectedColorVariant ? ` - ${selectedColorVariant.name}` : ''}`}
                    className="w-full h-full object-cover object-top transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-emerald-600 text-white">
                    {discount}% OFF
                  </Badge>
                )}

                {allImages.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? allImages.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === allImages.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gold">
                    ₹{Number(product.price).toLocaleString()}
                  </span>
                  {product.original_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{Number(product.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Color Variants Selection (Amazon/Myntra style) */}
              {hasColorVariants && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Color: <span className="text-primary font-medium">{selectedColorVariant?.name || 'Select a color'}</span>
                  </h3>
                  
                  {/* Color Thumbnails */}
                  <div className="flex gap-3 flex-wrap">
                    {colorVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedColorVariant(variant)}
                        className={`relative group transition-all duration-200 ${
                          selectedColorVariant?.id === variant.id
                            ? 'ring-2 ring-primary ring-offset-2'
                            : 'hover:ring-2 hover:ring-muted-foreground/50 hover:ring-offset-1'
                        }`}
                        title={variant.name}
                      >
                        {/* Thumbnail Image */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-transparent">
                          <img
                            src={variant.image}
                            alt={variant.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        
                        {/* Selected Checkmark */}
                        {selectedColorVariant?.id === variant.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        
                        {/* Color dot indicator */}
                        <div 
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: variant.hexCode }}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Color swatches (alternative view) */}
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Quick select:</span>
                    {colorVariants.map((variant) => (
                      <button
                        key={`swatch-${variant.id}`}
                        onClick={() => setSelectedColorVariant(variant)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColorVariant?.id === variant.id
                            ? 'border-primary ring-2 ring-primary/30 scale-110'
                            : 'border-muted hover:border-muted-foreground hover:scale-105'
                        }`}
                        style={{ backgroundColor: variant.hexCode }}
                        title={variant.name}
                      >
                        {selectedColorVariant?.id === variant.id && (
                          <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    Color: <span className="text-muted-foreground font-normal">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor?.id === color.id 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-muted hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color.hex_code }}
                        title={color.name}
                      >
                        {selectedColor?.id === color.id && (
                          <Check className={`h-5 w-5 ${
                            color.hex_code.toLowerCase() === '#ffffff' || 
                            color.hex_code.toLowerCase() === '#fff' 
                              ? 'text-black' 
                              : 'text-white'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Size: <span className="text-muted-foreground font-normal">{selectedSize?.size}</span>
                    </h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="text-primary">
                          <Ruler className="h-4 w-4 mr-1" />
                          Size Chart
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Size Chart</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3">Size</th>
                                <th className="text-left py-2 px-3">Chest/Bust</th>
                                <th className="text-left py-2 px-3">Hip</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sizes.map(size => (
                                <tr key={size.id} className="border-b">
                                  <td className="py-2 px-3 font-medium">{size.size}</td>
                                  <td className="py-2 px-3">{size.chest_measurement || '-'}</td>
                                  <td className="py-2 px-3">{size.hip_measurement || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map(size => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        disabled={size.stock_quantity === 0}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedSize?.id === size.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : size.stock_quantity === 0
                              ? 'border-muted bg-muted text-muted-foreground line-through cursor-not-allowed'
                              : 'border-muted hover:border-primary'
                        }`}
                      >
                        {size.size}
                        {size.stock_quantity > 0 && size.stock_quantity <= 3 && (
                          <span className="block text-xs text-amber-600">Only {size.stock_quantity} left</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4">
                {isOutOfStock ? (
                  <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" size="lg">
                        <Bell className="h-5 w-5 mr-2" />
                        Notify When Available
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Get Notified</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Enter your email and we'll notify you when this item is back in stock.
                        </p>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={notifyEmail}
                          onChange={e => setNotifyEmail(e.target.value)}
                        />
                        <Button onClick={handleNotifyMe} className="w-full">
                          Notify Me
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <>
                    <Button 
                      variant="gold" 
                      size="lg" 
                      className="w-full"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="whatsapp" 
                      size="lg" 
                      className="w-full"
                      onClick={handleWhatsAppOrder}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Order via WhatsApp
                    </Button>
                  </>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant={isInWishlist(product.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product.id);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share:
                </span>
                <div className="flex gap-2">
                  {['whatsapp', 'facebook', 'twitter', 'copy'].map(platform => (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(platform)}
                      className="capitalize"
                    >
                      {platform === 'copy' ? 'Copy Link' : platform}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-serif font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map(p => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-card hover-lift"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-cream">
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
                      <p className="text-gold font-bold">₹{Number(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
