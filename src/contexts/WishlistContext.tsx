import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
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
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Helper to detect demo products (non-UUID IDs)
const isDemoProduct = (productId: string): boolean => {
  return productId.startsWith('demo-');
};

// Local storage helpers for demo product wishlist
const LOCAL_WISHLIST_KEY = 'ak_fashion_local_wishlist';

const getLocalWishlist = (): string[] => {
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (productIds: string[]) => {
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(productIds));
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
        .filter(id => DEMO_PRODUCTS[id])
        .map(id => ({
          id: `local-${id}`,
          product_id: id,
          product: DEMO_PRODUCTS[id]
        }));

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
        .filter(id => DEMO_PRODUCTS[id])
        .map(id => ({
          id: `local-${id}`,
          product_id: id,
          product: DEMO_PRODUCTS[id]
        }));
      setItems(localItems);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems]);

  const addToWishlist = async (productId: string) => {
    // Handle demo products (store locally, no auth required)
    if (isDemoProduct(productId)) {
      const localWishlist = getLocalWishlist();
      if (localWishlist.includes(productId)) {
        toast.info('Already in wishlist');
        return;
      }
      
      // Optimistic update
      const demoProduct = DEMO_PRODUCTS[productId];
      if (demoProduct) {
        setItems(prev => [...prev, {
          id: `local-${productId}`,
          product_id: productId,
          product: demoProduct
        }]);
        saveLocalWishlist([...localWishlist, productId]);
        toast.success('Added to wishlist!');
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

  const removeFromWishlist = async (productId: string) => {
    // Handle demo products
    if (isDemoProduct(productId)) {
      const localWishlist = getLocalWishlist();
      saveLocalWishlist(localWishlist.filter(id => id !== productId));
      setItems(prev => prev.filter(item => item.product_id !== productId));
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

  const isInWishlist = (productId: string) => {
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
