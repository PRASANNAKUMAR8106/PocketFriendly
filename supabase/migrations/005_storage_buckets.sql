-- ====================================================================
-- POCKETFRIENDLY SAREES - STORAGE BUCKETS & POLICIES (MIGRATION 005)
-- ====================================================================

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('product-images', 'product-images', true),
    ('collections', 'collections', true),
    ('hero-images', 'hero-images', true),
    ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for product-images
-- Public can read images
CREATE POLICY "Public Access for Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only Admins can upload product images
CREATE POLICY "Admin Upload for Product Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
);

-- Only Admins can update/delete product images
CREATE POLICY "Admin Update Delete Product Images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'product-images'
    AND public.is_admin()
);

-- 3. Storage Policies for collections
CREATE POLICY "Public Access for Collections Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'collections');

CREATE POLICY "Admin Manage Collections Images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'collections'
    AND public.is_admin()
);

-- 4. Storage Policies for hero-images
CREATE POLICY "Public Access for Hero Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-images');

CREATE POLICY "Admin Manage Hero Images"
ON storage.objects FOR ALL
USING (
    bucket_id = 'hero-images'
    AND public.is_admin()
);

-- 5. Storage Policies for banners
CREATE POLICY "Public Access for Banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Admin Manage Banners"
ON storage.objects FOR ALL
USING (
    bucket_id = 'banners'
    AND public.is_admin()
);
