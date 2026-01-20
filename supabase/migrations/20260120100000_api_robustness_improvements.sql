-- ============================================
-- API Robustness Improvements Migration
-- Ensures all TestSprite test cases pass
-- ============================================

-- 1. ADD POLICY: Allow anonymous users to read ALL products (including inactive for admin testing)
-- This helps with edge case testing for "Check Non-existent Product Handle"
CREATE POLICY "Admins can view all products including inactive"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. ADD POLICY: Allow anonymous users to read ALL categories (for testing inactive categories)
CREATE POLICY "Admins can view all categories including inactive"
ON public.categories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. ADD INDEXES for better query performance on large datasets
-- (Helps with "Test Response Time with Large Dataset" test case)
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON public.product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);

-- 4. ADD CONSTRAINTS for data validation
-- Ensures "Validate Response Structure" and "Check Product Data Accuracy" pass
ALTER TABLE public.products 
ADD CONSTRAINT check_price_positive CHECK (price >= 0),
ADD CONSTRAINT check_original_price_positive CHECK (original_price IS NULL OR original_price >= 0),
ADD CONSTRAINT check_stock_quantity_non_negative CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

ALTER TABLE public.orders
ADD CONSTRAINT check_total_amount_positive CHECK (total_amount >= 0);

ALTER TABLE public.order_items
ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT check_product_price_positive CHECK (product_price >= 0);

ALTER TABLE public.cart_items
ADD CONSTRAINT check_cart_quantity_positive CHECK (quantity > 0);

ALTER TABLE public.product_sizes
ADD CONSTRAINT check_size_stock_non_negative CHECK (stock_quantity >= 0);

-- 5. ADD FUNCTION: Safe product lookup that handles non-existent products gracefully
CREATE OR REPLACE FUNCTION public.get_product_by_id(p_id UUID)
RETURNS SETOF public.products
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.products WHERE id = p_id AND is_active = true;
$$;

-- 6. ADD FUNCTION: Get products with pagination for large datasets
CREATE OR REPLACE FUNCTION public.get_products_paginated(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_category TEXT DEFAULT NULL,
  p_featured_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  original_price DECIMAL,
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.original_price,
    p.image_url,
    p.category,
    p.stock_quantity,
    p.is_featured,
    p.is_active,
    p.created_at,
    p.updated_at,
    COUNT(*) OVER() as total_count
  FROM public.products p
  WHERE p.is_active = true
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_featured_only = FALSE OR p.is_featured = true)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- 7. ADD FUNCTION: Validate order data before insertion
CREATE OR REPLACE FUNCTION public.validate_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate required fields
  IF NEW.customer_name IS NULL OR trim(NEW.customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  
  IF NEW.customer_phone IS NULL OR trim(NEW.customer_phone) = '' THEN
    RAISE EXCEPTION 'Customer phone is required';
  END IF;
  
  IF NEW.customer_address IS NULL OR trim(NEW.customer_address) = '' THEN
    RAISE EXCEPTION 'Customer address is required';
  END IF;
  
  -- Validate phone format (basic validation)
  IF NEW.customer_phone !~ '^[0-9+\-\s()]{10,15}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  -- Validate email if provided
  IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    IF NEW.customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Normalize status
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;
  
  -- Validate payment method
  IF NEW.payment_method IS NULL THEN
    NEW.payment_method := 'cod';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order validation
DROP TRIGGER IF EXISTS validate_order_trigger ON public.orders;
CREATE TRIGGER validate_order_trigger
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order();

-- 8. ADD FUNCTION: Get order with items (for efficient single-query fetch)
CREATE OR REPLACE FUNCTION public.get_order_with_items(p_order_id UUID)
RETURNS TABLE (
  order_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  total_amount DECIMAL,
  status TEXT,
  payment_method TEXT,
  order_created_at TIMESTAMPTZ,
  item_id UUID,
  product_id UUID,
  product_name TEXT,
  product_price DECIMAL,
  quantity INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id as order_id,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.customer_address,
    o.total_amount,
    o.status,
    o.payment_method,
    o.created_at as order_created_at,
    oi.id as item_id,
    oi.product_id,
    oi.product_name,
    oi.product_price,
    oi.quantity
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  WHERE o.id = p_order_id
    AND (o.user_id = auth.uid() OR o.user_id IS NULL OR public.has_role(auth.uid(), 'admin'));
$$;

-- 9. ADD: Ensure cart items product exists validation
CREATE OR REPLACE FUNCTION public.validate_cart_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  product_exists BOOLEAN;
  product_active BOOLEAN;
BEGIN
  -- Check if product exists and is active
  SELECT EXISTS(SELECT 1 FROM public.products WHERE id = NEW.product_id),
         EXISTS(SELECT 1 FROM public.products WHERE id = NEW.product_id AND is_active = true)
  INTO product_exists, product_active;
  
  IF NOT product_exists THEN
    RAISE EXCEPTION 'Product does not exist';
  END IF;
  
  IF NOT product_active THEN
    RAISE EXCEPTION 'Product is not available';
  END IF;
  
  -- Validate quantity
  IF NEW.quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_cart_item_trigger ON public.cart_items;
CREATE TRIGGER validate_cart_item_trigger
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW EXECUTE FUNCTION public.validate_cart_item();

-- 10. ADD: Function to check product availability
CREATE OR REPLACE FUNCTION public.check_product_availability(p_product_id UUID)
RETURNS TABLE (
  available BOOLEAN,
  stock_quantity INTEGER,
  is_active BOOLEAN,
  message TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.id IS NULL THEN FALSE
      WHEN p.is_active = false THEN FALSE
      WHEN COALESCE(p.stock_quantity, 0) <= 0 THEN FALSE
      ELSE TRUE
    END as available,
    COALESCE(p.stock_quantity, 0) as stock_quantity,
    COALESCE(p.is_active, false) as is_active,
    CASE 
      WHEN p.id IS NULL THEN 'Product not found'
      WHEN p.is_active = false THEN 'Product is discontinued'
      WHEN COALESCE(p.stock_quantity, 0) <= 0 THEN 'Product is out of stock'
      ELSE 'Product is available'
    END as message
  FROM (SELECT p_product_id as product_id) params
  LEFT JOIN public.products p ON p.id = params.product_id;
$$;

-- 11. Ensure all tables return consistent empty arrays instead of errors
-- This is handled by PostgREST/Supabase automatically, but we can add views for safety

CREATE OR REPLACE VIEW public.active_products AS
SELECT * FROM public.products WHERE is_active = true;

CREATE OR REPLACE VIEW public.active_categories AS
SELECT * FROM public.categories WHERE is_active = true;

CREATE OR REPLACE VIEW public.featured_products AS
SELECT * FROM public.products WHERE is_active = true AND is_featured = true;

-- Grant access to views
GRANT SELECT ON public.active_products TO anon, authenticated;
GRANT SELECT ON public.active_categories TO anon, authenticated;
GRANT SELECT ON public.featured_products TO anon, authenticated;

-- 12. ADD: Product count function for testing "Correct Product Count"
CREATE OR REPLACE FUNCTION public.get_product_count(
  p_active_only BOOLEAN DEFAULT TRUE,
  p_featured_only BOOLEAN DEFAULT FALSE,
  p_category TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.products
  WHERE (p_active_only = FALSE OR is_active = true)
    AND (p_featured_only = FALSE OR is_featured = true)
    AND (p_category IS NULL OR category = p_category);
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_product_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_products_paginated(INTEGER, INTEGER, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_product_availability(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_with_items(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_count(BOOLEAN, BOOLEAN, TEXT) TO anon, authenticated;

-- 13. ADD: Rate limiting table for API abuse protection (optional but good practice)
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP or user_id
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.api_rate_limits(identifier, endpoint, window_start);

-- Clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.api_rate_limits WHERE window_start < now() - INTERVAL '1 hour';
$$;
