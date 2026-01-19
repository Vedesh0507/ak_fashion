-- Create product_colors table for color variants
CREATE TABLE public.product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hex_code TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_sizes table
CREATE TABLE public.product_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    chest_measurement TEXT,
    hip_measurement TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, size)
);

-- Create product_images table for gallery
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_addresses table
CREATE TABLE public.saved_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notify_me table for out of stock items
CREATE TABLE public.notify_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    size TEXT,
    color TEXT,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notify_requests ENABLE ROW LEVEL SECURITY;

-- Public read access for product-related tables
CREATE POLICY "Anyone can view product colors" ON public.product_colors
FOR SELECT USING (true);

CREATE POLICY "Anyone can view product sizes" ON public.product_sizes
FOR SELECT USING (true);

CREATE POLICY "Anyone can view product images" ON public.product_images
FOR SELECT USING (true);

-- Admin policies for product tables
CREATE POLICY "Admins can manage product colors" ON public.product_colors
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product sizes" ON public.product_sizes
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product images" ON public.product_images
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Saved addresses: users can manage their own
CREATE POLICY "Users can view their addresses" ON public.saved_addresses
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their addresses" ON public.saved_addresses
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their addresses" ON public.saved_addresses
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their addresses" ON public.saved_addresses
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notify requests: anyone can submit, admins can view all
CREATE POLICY "Anyone can submit notify requests" ON public.notify_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view notify requests" ON public.notify_requests
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notify requests" ON public.notify_requests
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));