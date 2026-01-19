import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import demo product images
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

// Color variant info for cart items
interface ColorVariantInfo {
  colorName: string;
  colorImage: string;
  colorHex: string;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  colorVariant?: ColorVariantInfo; // Optional color variant
  product: {
    id: string;
    name: string;
    price: number;
    original_price?: number;
    image_url?: string;
    category: string;
  };
}

// Local cart item for localStorage
interface LocalCartItem {
  id: string;
  product_id: string;
  quantity: number;
  colorVariant?: ColorVariantInfo;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, colorVariant?: ColorVariantInfo) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Demo products data (for when database is empty)
const DEMO_PRODUCTS: Record<string, CartItem['product']> = {
  "demo-cotton-dupatta-dress": {
    id: "demo-cotton-dupatta-dress",
    name: "Cotton Embroidered Dupatta Dress",
    price: 900,
    original_price: 1100,
    image_url: dupattaBlushPink,
    category: "Dress Material",
  },
  "demo-gini-cloth-saree": {
    id: "demo-gini-cloth-saree",
    name: "Gini Cloth Saree",
    price: 1500,
    original_price: 1700,
    image_url: giniMustardOrange,
    category: "Designer Saree",
  },
  "demo-kundan-georgette-dress": {
    id: "demo-kundan-georgette-dress",
    name: "Kundan Georgette Dress",
    price: 2899,
    original_price: 3999,
    image_url: kundanPink,
    category: "Dress Material",
  },
  "demo-floral-georgette-saree": {
    id: "demo-floral-georgette-saree",
    name: "Floral Georgette Saree",
    price: 1800,
    original_price: 2100,
    image_url: floralSilver,
    category: "Designer Saree",
  },
  "demo-pattu-silk-saree": {
    id: "demo-pattu-silk-saree",
    name: "Pattu Silk Saree with Shiny Thread",
    price: 900,
    original_price: 1400,
    image_url: palluRed,
    category: "Designer Saree",
  },
  "demo-bandhani-saree": {
    id: "demo-bandhani-saree",
    name: "Bandhani Saree with Smooth Finish",
    price: 900,
    original_price: 1400,
    image_url: bandhaniGreen,
    category: "Daily Wear",
  },
  "demo-banarasi-saree": {
    id: "demo-banarasi-saree",
    name: "Banarasi Silk Saree with Zari Work",
    price: 1500,
    original_price: 1800,
    image_url: banarasTeal,
    category: "Designer Saree",
  }
};

// Check if a product ID is a demo product
const isDemoProduct = (productId: string): boolean => {
  return productId.startsWith('demo-');
};

// Generate or retrieve session ID for guest users
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

// Local storage cart helpers
const LOCAL_CART_KEY = 'ak_fashion_cart';

const getLocalCart = (): LocalCartItem[] => {
  try {
    const cart = localStorage.getItem(LOCAL_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: LocalCartItem[]) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId] = useState(getSessionId);

  // Fetch product details for local cart items (handles both demo and real products)
  const fetchProductsForLocalCart = useCallback(async (localItems: LocalCartItem[]): Promise<CartItem[]> => {
    if (localItems.length === 0) return [];
    
    const cartItems: CartItem[] = [];
    const realProductIds: string[] = [];
    
    // Separate demo products from real products
    for (const item of localItems) {
      if (isDemoProduct(item.product_id)) {
        // Handle demo products directly
        const demoProduct = DEMO_PRODUCTS[item.product_id];
        if (demoProduct) {
          // If item has color variant, use the color image
          const productWithImage = item.colorVariant 
            ? { ...demoProduct, image_url: item.colorVariant.colorImage }
            : demoProduct;
          
          cartItems.push({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            colorVariant: item.colorVariant,
            product: productWithImage
          });
        }
      } else {
        realProductIds.push(item.product_id);
      }
    }
    
    // Fetch real products from Supabase
    if (realProductIds.length > 0) {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, original_price, image_url, category')
        .in('id', realProductIds)
        .eq('is_active', true);

      if (!error && products) {
        for (const item of localItems) {
          if (!isDemoProduct(item.product_id)) {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
              cartItems.push({
                id: item.id,
                product_id: item.product_id,
                quantity: item.quantity,
                colorVariant: item.colorVariant,
                product
              });
            }
          }
        }
      }
    }
    
    return cartItems;
  }, []);

  const fetchCartItems = useCallback(async () => {
    try {
      // Always load local cart first (for demo products and fallback)
      const localItems = getLocalCart();
      
      // Try to fetch from Supabase for non-demo items
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            id,
            name,
            price,
            original_price,
            image_url,
            category
          )
        `)
        .eq('session_id', sessionId);

      // Get local cart items with products (includes demo products)
      const localCartItems = await fetchProductsForLocalCart(localItems);
      
      if (error) {
        console.warn('Supabase cart fetch failed, using local storage only:', error.message);
        setItems(localCartItems);
      } else {
        // Merge Supabase items with local demo items
        const supabaseItems = (data || []).filter(item => item.product !== null) as CartItem[];
        
        // Combine: Supabase items + local demo items (avoid duplicates)
        const supabaseProductIds = new Set(supabaseItems.map(i => i.product_id));
        const demoItemsFromLocal = localCartItems.filter(item => 
          isDemoProduct(item.product_id) && !supabaseProductIds.has(item.product_id)
        );
        
        setItems([...supabaseItems, ...demoItemsFromLocal]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      const localItems = getLocalCart();
      const cartItems = await fetchProductsForLocalCart(localItems);
      setItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, fetchProductsForLocalCart]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = async (productId: string, colorVariant?: ColorVariantInfo) => {
    // For products with color variants, create a unique key combining product + color
    const cartKey = colorVariant 
      ? `${productId}-${colorVariant.colorName.toLowerCase().replace(/\s+/g, '-')}`
      : productId;
    
    const existingItem = items.find(item => {
      if (colorVariant) {
        return item.product_id === productId && 
               item.colorVariant?.colorName === colorVariant.colorName;
      }
      return item.product_id === productId && !item.colorVariant;
    });
    
    // Optimistic update for quantity increase
    if (existingItem) {
      setItems(prev => prev.map(item => 
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Optimistic add for new items (need product info)
      const demoProduct = isDemoProduct(productId) ? DEMO_PRODUCTS[productId] : null;
      if (demoProduct) {
        const productWithColorImage = colorVariant 
          ? { ...demoProduct, image_url: colorVariant.colorImage }
          : demoProduct;
        
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          product_id: productId,
          quantity: 1,
          colorVariant,
          product: productWithColorImage
        };
        setItems(prev => [...prev, newItem]);
      }
    }

    try {
      // Handle demo products - always use local storage
      if (isDemoProduct(productId)) {
        const localItems = getLocalCart();
        const existingLocalItem = localItems.find(item => {
          if (colorVariant) {
            return item.product_id === productId && 
                   item.colorVariant?.colorName === colorVariant.colorName;
          }
          return item.product_id === productId && !item.colorVariant;
        });
        
        if (existingLocalItem) {
          existingLocalItem.quantity += 1;
          saveLocalCart(localItems);
          toast.success('Updated quantity in cart!');
        } else {
          localItems.push({
            id: crypto.randomUUID(),
            product_id: productId,
            quantity: 1,
            colorVariant
          });
          saveLocalCart(localItems);
          toast.success('Added to cart!');
        }
        
        await fetchCartItems();
        return;
      }

      // Handle real products - try Supabase first
      if (existingItem && !isDemoProduct(existingItem.product_id)) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
        toast.success('Updated quantity in cart!');
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            product_id: productId,
            session_id: sessionId,
            quantity: 1
          });

        if (error) {
          // Fallback to local storage
          console.warn('Supabase insert failed, using local storage:', error.message);
          const localItems = getLocalCart();
          localItems.push({
            id: crypto.randomUUID(),
            product_id: productId,
            quantity: 1,
            colorVariant
          });
          saveLocalCart(localItems);
          toast.success('Added to cart!');
          await fetchCartItems();
          return;
        }
        toast.success('Added to cart!');
      }
      
      await fetchCartItems();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Fallback to local storage
      const localItems = getLocalCart();
      const existingLocalItem = localItems.find(item => {
        if (colorVariant) {
          return item.product_id === productId && 
                 item.colorVariant?.colorName === colorVariant.colorName;
        }
        return item.product_id === productId && !item.colorVariant;
      });
      
      if (existingLocalItem) {
        existingLocalItem.quantity += 1;
      } else {
        localItems.push({
          id: crypto.randomUUID(),
          product_id: productId,
          quantity: 1,
          colorVariant
        });
      }
      saveLocalCart(localItems);
      toast.success('Added to cart!');
      await fetchCartItems();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    // Find the item to check if it's a demo product
    const itemToRemove = items.find(item => item.id === cartItemId);
    const isDemo = itemToRemove ? isDemoProduct(itemToRemove.product_id) : false;
    
    // Optimistic update
    setItems(prev => prev.filter(item => item.id !== cartItemId));
    
    // Always update local storage (for demo products and as fallback)
    const localItems = getLocalCart().filter(item => item.id !== cartItemId);
    saveLocalCart(localItems);
    
    // For demo products, we're done
    if (isDemo) {
      toast.success('Removed from cart');
      return;
    }
    
    // For real products, also try to remove from Supabase
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.warn('Supabase delete failed:', error.message);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
    
    toast.success('Removed from cart');
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(cartItemId);
    }

    // Find the item to check if it's a demo product
    const itemToUpdate = items.find(item => item.id === cartItemId);
    const isDemo = itemToUpdate ? isDemoProduct(itemToUpdate.product_id) : false;

    // Optimistic update
    setItems(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity } : item
    ));

    // Always update local storage
    const localItems = getLocalCart();
    const localItem = localItems.find(i => i.id === cartItemId);
    if (localItem) {
      localItem.quantity = quantity;
      saveLocalCart(localItems);
    }
    
    // For demo products, we're done
    if (isDemo) return;

    // For real products, also try to update Supabase
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) {
        console.warn('Supabase update failed:', error.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    // Optimistic update
    setItems([]);
    
    // Always clear local storage
    saveLocalCart([]);
    
    // Also try to clear Supabase cart
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      if (error) {
        console.warn('Supabase clear failed:', error.message);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      saveLocalCart([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      sessionId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
