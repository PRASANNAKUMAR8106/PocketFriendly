-- ====================================================================
-- POCKETFRIENDLY SAREES - FUNCTIONS & TRIGGERS (MIGRATION 003)
-- ====================================================================

-- 1. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at to relevant tables
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_discounts_updated_at BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. AUTOMATIC PRODUCT FINAL PRICE CALCULATION TRIGGER
CREATE OR REPLACE FUNCTION calculate_product_final_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.discount_type = 'percentage' AND NEW.discount_value > 0 THEN
        NEW.final_price := ROUND(NEW.original_price - (NEW.original_price * (NEW.discount_value / 100.0)), 2);
    ELSIF NEW.discount_type = 'fixed' AND NEW.discount_value > 0 THEN
        NEW.final_price := GREATEST(0, NEW.original_price - NEW.discount_value);
    ELSE
        NEW.final_price := NEW.original_price;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_product_price
BEFORE INSERT OR UPDATE OF original_price, discount_type, discount_value ON products
FOR EACH ROW EXECUTE FUNCTION calculate_product_final_price();

-- 3. AUTOMATIC PROFILE CREATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ATOMIC ORDER PLACEMENT AND INVENTORY VALIDATION FUNCTION
-- This guarantees server-side price validation, stock reduction, and prevents race conditions.
CREATE OR REPLACE FUNCTION public.place_order_atomic(
    p_user_id UUID,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_shipping_address JSONB,
    p_billing_address JSONB,
    p_items JSONB, -- Array of [{ "product_id": "...", "quantity": 1 }]
    p_payment_method TEXT DEFAULT 'cod',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID := gen_random_uuid();
    v_order_number TEXT;
    v_subtotal NUMERIC(10, 2) := 0;
    v_shipping_fee NUMERIC(10, 2) := 0;
    v_tax_total NUMERIC(10, 2) := 0;
    v_total_amount NUMERIC(10, 2) := 0;
    v_free_shipping_threshold NUMERIC(10, 2) := 999;
    v_std_shipping NUMERIC(10, 2) := 99;
    v_tax_percent NUMERIC(5, 2) := 5.0;
    v_item RECORD;
    v_prod RECORD;
    v_item_subtotal NUMERIC(10, 2);
    v_payment_status TEXT := 'pending';
BEGIN
    -- Read store shipping & tax settings
    SELECT free_shipping_threshold, standard_shipping_fee, tax_percentage 
    INTO v_free_shipping_threshold, v_std_shipping, v_tax_percent
    FROM site_settings WHERE id = 1;

    -- Generate unique order number
    v_order_number := 'PFS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 6));

    IF p_payment_method = 'cod' THEN
        v_payment_status := 'cod_pending';
    END IF;

    -- Iterate and validate all items first
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        -- Lock product row to prevent overselling
        SELECT * INTO v_prod FROM products WHERE id = v_item.product_id FOR UPDATE;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product with ID % not found', v_item.product_id;
        END IF;

        IF v_prod.product_status != 'active' THEN
            RAISE EXCEPTION 'Product "%" is currently not available for purchase', v_prod.name;
        END IF;

        IF v_prod.stock_quantity < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for "%". Requested: %, Available: %', v_prod.name, v_item.quantity, v_prod.stock_quantity;
        END IF;

        v_item_subtotal := v_prod.final_price * v_item.quantity;
        v_subtotal := v_subtotal + v_item_subtotal;
    END LOOP;

    -- Calculate shipping
    IF v_subtotal >= v_free_shipping_threshold THEN
        v_shipping_fee := 0;
    ELSE
        v_shipping_fee := v_std_shipping;
    END IF;

    -- Calculate GST/Tax (included or added)
    v_tax_total := ROUND((v_subtotal * (v_tax_percent / 100.0)), 2);
    v_total_amount := v_subtotal + v_shipping_fee;

    -- Insert into orders table
    INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, billing_address, subtotal, discount_total, shipping_fee,
        tax_total, total_amount, order_status, payment_status, payment_method, notes
    ) VALUES (
        v_order_id, v_order_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
        p_shipping_address, p_billing_address, v_subtotal, 0, v_shipping_fee,
        v_tax_total, v_total_amount, 'confirmed', v_payment_status, p_payment_method, p_notes
    );

    -- Insert order items and deduct stock
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT p.*, (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
        INTO v_prod FROM products p WHERE p.id = v_item.product_id;

        INSERT INTO order_items (
            order_id, product_id, product_name, sku, image_url,
            unit_price, discount_amount, final_unit_price, quantity, total_price
        ) VALUES (
            v_order_id, v_prod.id, v_prod.name, v_prod.sku, v_prod.primary_image,
            v_prod.original_price, (v_prod.original_price - v_prod.final_price), v_prod.final_price,
            v_item.quantity, (v_prod.final_price * v_item.quantity)
        );

        -- Decrement product stock
        UPDATE products 
        SET stock_quantity = stock_quantity - v_item.quantity
        WHERE id = v_prod.id;

        -- Record inventory log
        INSERT INTO inventory_logs (
            product_id, change_quantity, previous_quantity, new_quantity, change_reason
        ) VALUES (
            v_prod.id, -v_item.quantity, v_prod.stock_quantity, v_prod.stock_quantity - v_item.quantity,
            'Customer order ' || v_order_number
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_number', v_order_number,
        'total_amount', v_total_amount,
        'shipping_fee', v_shipping_fee,
        'payment_status', v_payment_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. AUDIT LOGGING HELPER
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
    SELECT email INTO v_admin_email FROM profiles WHERE id = auth.uid();
    INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, details)
    VALUES (auth.uid(), v_admin_email, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
