import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Color variant interface for wishlist items
interface WishlistColorVariant {
  id: string;
  name: string;
  hexCode: string;
  image: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  color_variant_id?: string;
  color_variant?: WishlistColorVariant;
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url?: string;
    category: string;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string, colorVariant?: WishlistColorVariant) => Promise<void>;
  removeFromWishlist: (productId: string, colorVariantId?: string) => Promise<void>;
  isInWishlist: (productId: string, colorVariantId?: string) => boolean;
  isAnyVariantInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Helper to detect demo products (non-UUID IDs)
const isDemoProduct = (productId: string): boolean => {
  return productId.startsWith('demo-');
};

// Local storage helpers for demo product wishlist
const LOCAL_WISHLIST_KEY = 'ak_fashion_local_wishlist';

interface LocalWishlistEntry {
  productId: string;
  colorVariantId?: string;
  colorVariant?: WishlistColorVariant;
}

const getLocalWishlist = (): LocalWishlistEntry[] => {
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Handle old format (array of strings)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      return parsed.map((id: string) => ({ productId: id }));
    }
    return parsed;
  } catch {
    return [];
  }
};

const saveLocalWishlist = (entries: LocalWishlistEntry[]) => {
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(entries));
};

// Demo product details for local wishlist display
const DEMO_PRODUCTS: Record<string, WishlistItem['product']> = {
  "demo-bandhani-saree": {
    id: "demo-bandhani-saree",
    name: "Bandhani Saree with Smooth Finish",
    price: 900,
    original_price: 1400,
    image_url: "/placeholder.svg",
    category: "Daily Wear"
  },
  "demo-banarasi-saree": {
    id: "demo-banarasi-saree",
    name: "Banarasi Silk Saree with Zari Work",
    price: 1500,
    original_price: 1800,
    image_url: "/placeholder.svg",
    category: "Designer Saree"
  },
  "demo-pattu-silk-saree": {
    id: "demo-pattu-silk-saree",
    name: "Pattu Silk Saree with Shiny Thread",
    price: 900,
    original_price: 1400,
    image_url: "/placeholder.svg",
    category: "Designer Saree"
  },
  "demo-floral-georgette-saree": {
    id: "demo-floral-georgette-saree",
    name: "Floral Georgette Saree",
    price: 1800,
    original_price: 2100,
    image_url: "/placeholder.svg",
    category: "Designer Saree"
  },
  "demo-kundan-georgette-dress": {
    id: "demo-kundan-georgette-dress",
    name: "Kundan Georgette Dress",
    price: 2899,
    original_price: 3999,
    image_url: "/placeholder.svg",
    category: "Dress Material"
  },
  "demo-gini-cloth-saree": {
    id: "demo-gini-cloth-saree",
    name: "Gini Cloth Saree",
    price: 1500,
    original_price: 1700,
    image_url: "/placeholder.svg",
    category: "Designer Saree"
  },
  "demo-cotton-dupatta-dress": {
    id: "demo-cotton-dupatta-dress",
    name: "Cotton Embroidered Dupatta Dress",
    price: 900,
    original_price: 1100,
    image_url: "/placeholder.svg",
    category: "Dress Material"
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlistItems = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Always load local wishlist for demo products
      const localWishlist = getLocalWishlist();
      const localItems: WishlistItem[] = localWishlist
        .filter(entry => DEMO_PRODUCTS[entry.productId])
        .map(entry => {
          const uniqueId = entry.colorVariantId 
            ? `local-${entry.productId}-${entry.colorVariantId}` 
            : `local-${entry.productId}`;
          
          // Use color variant image if available
          const baseProduct = DEMO_PRODUCTS[entry.productId];
          const productWithImage = entry.colorVariant 
            ? { ...baseProduct, image_url: entry.colorVariant.image }
            : baseProduct;
          
          return {
            id: uniqueId,
            product_id: entry.productId,
            color_variant_id: entry.colorVariantId,
            color_variant: entry.colorVariant,
            product: productWithImage
          };
        });

      if (!user) {
        // Guest users only see local demo wishlist
        setItems(localItems);
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase for logged-in users
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          product_id,
          product:products (
            id,
            name,
            price,
            original_price,
            image_url,
            category
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.warn('Supabase wishlist fetch failed:', error.message);
        setItems(localItems);
      } else {
        const supabaseItems = (data || []).filter(item => item.product !== null) as WishlistItem[];
        // Merge Supabase items with local demo items
        setItems([...supabaseItems, ...localItems]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      const localWishlist = getLocalWishlist();
      const localItems: WishlistItem[] = localWishlist
        .filter(entry => DEMO_PRODUCTS[entry.productId])
        .map(entry => {
          const uniqueId = entry.colorVariantId 
            ? `local-${entry.productId}-${entry.colorVariantId}` 
            : `local-${entry.productId}`;
          
          const baseProduct = DEMO_PRODUCTS[entry.productId];
          const productWithImage = entry.colorVariant 
            ? { ...baseProduct, image_url: entry.colorVariant.image }
            : baseProduct;
          
          return {
            id: uniqueId,
            product_id: entry.productId,
            color_variant_id: entry.colorVariantId,
            color_variant: entry.colorVariant,
            product: productWithImage
          };
        });
      setItems(localItems);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems]);

  const addToWishlist = async (productId: string, colorVariant?: WishlistColorVariant) => {
    // Handle demo products (store locally, no auth required)
    if (isDemoProduct(productId)) {
      const localWishlist = getLocalWishlist();
      
      // Check if this specific product + color variant combination exists
      const alreadyExists = localWishlist.some(entry => 
        entry.productId === productId && 
        (colorVariant ? entry.colorVariantId === colorVariant.id : !entry.colorVariantId)
      );
      
      if (alreadyExists) {
        toast.info('Already in wishlist');
        return;
      }
      
      // Optimistic update
      const demoProduct = DEMO_PRODUCTS[productId];
      if (demoProduct) {
        const uniqueId = colorVariant 
          ? `local-${productId}-${colorVariant.id}` 
          : `local-${productId}`;
        
        const productWithImage = colorVariant 
          ? { ...demoProduct, image_url: colorVariant.image }
          : demoProduct;
        
        setItems(prev => [...prev, {
          id: uniqueId,
          product_id: productId,
          color_variant_id: colorVariant?.id,
          color_variant: colorVariant,
          product: productWithImage
        }]);
        
        const newEntry: LocalWishlistEntry = {
          productId,
          colorVariantId: colorVariant?.id,
          colorVariant
        };
        saveLocalWishlist([...localWishlist, newEntry]);
        
        const colorText = colorVariant ? ` (${colorVariant.name})` : '';
        toast.success(`Added to wishlist!${colorText}`);
      }
      return;
    }

    // For real products, require authentication
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    // Check if already in wishlist (optimistic check)
    if (items.some(item => item.product_id === productId)) {
      toast.info('Already in wishlist');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          product_id: productId,
          user_id: user.id
        })
        .select(`
          id,
          product_id,
          product:products (
            id,
            name,
            price,
            original_price,
            image_url,
            category
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.info('Already in wishlist');
        } else {
          throw error;
        }
        return;
      }

      if (data && data.product) {
        // Optimistic update with returned data
        setItems(prev => [...prev, data as WishlistItem]);
        toast.success('Added to wishlist!');
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string, colorVariantId?: string) => {
    // Handle demo products
    if (isDemoProduct(productId)) {
      const localWishlist = getLocalWishlist();
      const updatedWishlist = localWishlist.filter(entry => 
        !(entry.productId === productId && 
          (colorVariantId ? entry.colorVariantId === colorVariantId : !entry.colorVariantId))
      );
      saveLocalWishlist(updatedWishlist);
      
      setItems(prev => prev.filter(item => 
        !(item.product_id === productId && 
          (colorVariantId ? item.color_variant_id === colorVariantId : !item.color_variant_id))
      ));
      toast.success('Removed from wishlist');
      return;
    }

    if (!user) return;

    // Optimistic update
    setItems(prev => prev.filter(item => item.product_id !== productId));

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        // Revert on error - refetch
        await fetchWishlistItems();
        throw error;
      }
      
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const isInWishlist = (productId: string, colorVariantId?: string) => {
    return items.some(item => 
      item.product_id === productId && 
      (colorVariantId ? item.color_variant_id === colorVariantId : !item.color_variant_id)
    );
  };

  // Check if any variant of a product is in wishlist (for product card display)
  const isAnyVariantInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{
      items,
      isLoading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isAnyVariantInWishlist,
      totalItems
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
