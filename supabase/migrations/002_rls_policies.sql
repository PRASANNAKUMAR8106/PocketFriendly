-- ====================================================================
-- POCKETFRIENDLY SAREES - ROW LEVEL SECURITY POLICIES (MIGRATION 002)
-- ====================================================================

-- 1. Helper function to check if current user is an admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES POLICIES
-- Anyone can view their own profile; Admins can view all profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON profiles FOR ALL 
USING (public.is_admin());

-- 4. CATEGORIES POLICIES
-- Public can view active categories; Admins can view and manage all
CREATE POLICY "Public can view active categories" 
ON categories FOR SELECT 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert/update/delete categories" 
ON categories FOR ALL 
USING (public.is_admin());

-- 5. PRODUCTS & PRODUCT IMAGES POLICIES
-- Public can view active products; Admins can view all and manage
CREATE POLICY "Public can view active products" 
ON products FOR SELECT 
USING (product_status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage all products" 
ON products FOR ALL 
USING (public.is_admin());

CREATE POLICY "Public can view product images" 
ON product_images FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product images" 
ON product_images FOR ALL 
USING (public.is_admin());

-- 6. COLLECTIONS & COLLECTION PRODUCTS
CREATE POLICY "Public can view active collections" 
ON collections FOR SELECT 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage collections" 
ON collections FOR ALL 
USING (public.is_admin());

CREATE POLICY "Public can view collection products" 
ON collection_products FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage collection products" 
ON collection_products FOR ALL 
USING (public.is_admin());

-- 7. DISCOUNTS POLICIES
-- Public can view active discounts; Admins can manage
CREATE POLICY "Public can view active discounts" 
ON discounts FOR SELECT 
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage discounts" 
ON discounts FOR ALL 
USING (public.is_admin());

-- 8. ADDRESSES POLICIES
CREATE POLICY "Users can manage own addresses" 
ON addresses FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view addresses for order processing" 
ON addresses FOR SELECT 
USING (public.is_admin());

-- 9. CARTS & CART ITEMS POLICIES
CREATE POLICY "Users can manage own carts" 
ON carts FOR ALL 
USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage own cart items" 
ON cart_items FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM carts 
        WHERE carts.id = cart_items.cart_id 
        AND (carts.user_id = auth.uid() OR carts.session_id IS NOT NULL)
    )
);

-- 10. WISHLIST POLICIES
CREATE POLICY "Users can manage own wishlist" 
ON wishlists FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. ORDERS & ORDER ITEMS POLICIES
-- Customers see only their own orders. Admins see all orders.
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update orders" 
ON orders FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own order items" 
ON order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Allow order item creation on checkout" 
ON order_items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
);

-- 12. PAYMENTS POLICIES
CREATE POLICY "Users can view own payments" 
ON payments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Admins can manage all payments" 
ON payments FOR ALL 
USING (public.is_admin());

-- 13. REVIEWS POLICIES
CREATE POLICY "Public can view approved reviews" 
ON reviews FOR SELECT 
USING (is_approved = true OR public.is_admin());

CREATE POLICY "Authenticated users can create reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all reviews" 
ON reviews FOR ALL 
USING (public.is_admin());

-- 14. SITE SETTINGS POLICIES
-- Public can read site settings; Only Admins can modify
CREATE POLICY "Public can read site settings" 
ON site_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can update site settings" 
ON site_settings FOR ALL 
USING (public.is_admin());

-- 15. AUDIT LOGS & INVENTORY LOGS
CREATE POLICY "Only admins can view audit logs" 
ON audit_logs FOR SELECT 
USING (public.is_admin());

CREATE POLICY "Only admins can view inventory logs" 
ON inventory_logs FOR SELECT 
USING (public.is_admin());

CREATE POLICY "System and admins can insert audit logs" 
ON audit_logs FOR INSERT 
WITH CHECK (true);
