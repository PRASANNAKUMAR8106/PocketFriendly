-- ====================================================================
-- POCKETFRIENDLY SAREES - SEED DATA (MIGRATION 004)
-- ====================================================================

-- 1. INSERT DEFAULT SITE SETTINGS (Singleton id = 1)
INSERT INTO site_settings (
    id, store_name, store_email, store_phone, store_address,
    currency_symbol, announcement_text, announcement_enabled,
    hero_title, hero_subtitle, hero_image_url, hero_cta_text, hero_cta_link,
    free_shipping_threshold, standard_shipping_fee, cod_enabled, cod_fee, tax_percentage,
    social_links, footer_about
) VALUES (
    1,
    'PocketFriendly Sarees',
    'care@pocketfriendlysarees.com',
    '+91 98765 43210',
    '402, Royal Weaver Market, Ring Road, Surat, Gujarat 395002, India',
    '₹',
    '✨ Grand Festive Launch: Flat 20%-40% OFF on Banarasi & Kanjeevaram Silks | Free All-India Shipping on ₹999+ ✨',
    true,
    'Elegance That Fits Your Style & Budget',
    'Discover genuine handloom-inspired Banarasi, Kanjeevaram, and breezy Chanderi sarees crafted for every Indian celebration at direct-from-weaver prices.',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    'Shop Latest Collection',
    '/collections/latest',
    999.00,
    99.00,
    true,
    49.00,
    5.00,
    '{"instagram": "https://instagram.com/pocketfriendlysarees", "facebook": "https://facebook.com/pocketfriendlysarees", "whatsapp": "+919876543210"}'::jsonb,
    'PocketFriendly Sarees is dedicated to bringing authentic Indian textiles, regal bridal drapes, and breathable everyday cottons straight to your doorstep without inflated boutique markups.'
) ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    announcement_text = EXCLUDED.announcement_text,
    hero_title = EXCLUDED.hero_title;

-- 2. INSERT CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Banarasi Silk', 'banarasi-silk', 'Opulent zari work and rich brocades inspired by the sacred heritage of Varanasi.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', 1, true),
('c1000000-0000-0000-0000-000000000002', 'Kanjeevaram Silk', 'kanjeevaram-silk', 'Regal South Indian heritage silks woven with lustrous gold-finish zari temple borders.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80', 2, true),
('c1000000-0000-0000-0000-000000000003', 'Organza Embroidered', 'organza-embroidered', 'Featherlight sheer pastels embellished with scalloped borders and floral threadwork.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', 3, true),
('c1000000-0000-0000-0000-000000000004', 'Chanderi Cotton Silk', 'chanderi-cotton-silk', 'Airy, delicate weaves with shimmering zari buttas for sophisticated daytime elegance.', 'https://images.unsplash.com/photo-1610030469668-935a8df2a201?auto=format&fit=crop&w=800&q=80', 4, true),
('c1000000-0000-0000-0000-000000000005', 'Designer Georgette', 'designer-georgette', 'Graceful flowy silhouettes embellished with subtle sequin highlights for cocktail parties.', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80', 5, true),
('c1000000-0000-0000-0000-000000000006', 'Bandhani & Festive', 'bandhani-festive', 'Handcrafted tie-dye drapes bursting with celebration, auspicious reds, and marigolds.', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80', 6, true),
('c1000000-0000-0000-0000-000000000007', 'Pure Cotton & Mulmul', 'pure-cotton-mulmul', 'Ultra-breathable all-day comfort handblock prints perfect for home and office.', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80', 7, true),
('c1000000-0000-0000-0000-000000000008', 'Tussar & Linen Silk', 'tussar-linen-silk', 'Earthy textures and rich organic sheen woven for the connoisseur of ethnic textiles.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80', 8, true)
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT COLLECTIONS
INSERT INTO collections (id, title, slug, description, banner_image_url, is_active, is_latest, display_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'The Royal Utsav Collection', 'latest', 'Handcrafted festive sarees adorned with rich zari pallus, jewel tones, and opulent Indian motifs.', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80', true, true, 1),
('b1000000-0000-0000-0000-000000000002', 'Summer Sheer Pastels', 'summer-pastels', 'Breezy organzas and featherlight tissue silks made for warm-weather celebrations.', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80', true, false, 2),
('b1000000-0000-0000-0000-000000000003', 'PocketFriendly Bestsellers Under ₹1,999', 'bestsellers-under-1999', 'Our most celebrated affordable sarees that look like a million bucks.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80', true, false, 3)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT PRODUCTS
INSERT INTO products (
    id, name, slug, description, category_id, sku,
    original_price, discount_type, discount_value, final_price,
    stock_quantity, low_stock_threshold, product_status,
    is_featured, is_latest_collection, is_new_arrival, is_sale,
    fabric, color, pattern, occasion, saree_length, blouse_included, blouse_length,
    care_instructions, shipping_info, seo_title, seo_description
) VALUES
(
    'p1000000-0000-0000-0000-000000000001',
    'Royal Crimson Banarasi Katan Silk Saree',
    'royal-crimson-banarasi-katan-silk-saree',
    'Immerse in timeless royalty with this magnificent crimson Banarasi saree. Woven with rich antique gold zari floral jaal, heavy grand pallu, and accompanied by an unstitched brocade blouse piece. Perfect for brides, festive gatherings, and reception evenings.',
    'c1000000-0000-0000-0000-000000000001',
    'PFS-BAN-001',
    3499.00,
    'percentage',
    25.00,
    2624.25,
    18,
    4,
    'active',
    true,
    true,
    true,
    true,
    'Banarasi Katan Silk Blend',
    'Royal Crimson Red',
    'Floral Kadwa Jaal with Antique Zari',
    'Bridal, Wedding Reception, Festive Puja',
    '5.5 Meters',
    true,
    '0.8 Meters Brocade Blouse',
    'Dry clean only. Store wrapped in pure cotton cloth away from moisture.',
    'Ships in 24 hours. Express delivery available across India.',
    'Royal Crimson Banarasi Katan Silk Saree | PocketFriendly Sarees',
    'Buy authentic Royal Crimson Banarasi Katan Silk Saree at pocket-friendly pricing. Features rich gold zari work and unstitched blouse.'
),
(
    'p1000000-0000-0000-0000-000000000002',
    'Sage Mint Organza Embroidered Saree',
    'sage-mint-organza-embroidered-saree',
    'Experience ethereal grace with this featherlight sage mint organza saree. Decorated with intricate ivory Resham threadwork and delicate scalloped borders with fine cut-work detailing. Includes matching tone raw silk blouse.',
    'c1000000-0000-0000-0000-000000000003',
    'PFS-ORG-002',
    2999.00,
    'fixed',
    700.00,
    2299.00,
    14,
    3,
    'active',
    true,
    true,
    true,
    false,
    'Pure Sheer Organza',
    'Sage Mint Green',
    'Delicate Floral Resham Embroidery & Cut-work',
    'Cocktail Parties, Day Weddings, Ring Ceremony',
    '5.5 Meters',
    true,
    '0.8 Meters Banglori Silk Blouse',
    'Gentle dry clean only. Iron on reverse low heat.',
    'Free shipping above ₹999. Dispatched in 1-2 business days.',
    'Sage Mint Organza Embroidered Saree | PocketFriendly Sarees',
    'Shop elegant Sage Mint Organza saree with scalloped embroidered borders at an affordable price.'
),
(
    'p1000000-0000-0000-0000-000000000003',
    'Temple Border Mustard Gold Kanjeevaram Saree',
    'temple-border-mustard-gold-kanjeevaram-saree',
    'A heritage South Indian drape featuring rich korvai temple motifs in shimmering golden zari along an auspicious mustard yellow body. Woven with peacock and chakra buttas across the lavish contrast pallu.',
    'c1000000-0000-0000-0000-000000000002',
    'PFS-KAN-003',
    3999.00,
    'percentage',
    30.00,
    2799.30,
    9,
    3,
    'active',
    true,
    true,
    false,
    true,
    'Kanjeevaram Soft Silk Blend',
    'Mustard Yellow & Wine Red',
    'Temple Korvai Border with Peacock Motifs',
    'Temple Ceremonies, Griha Pravesh, Traditional Weddings',
    '5.5 Meters',
    true,
    '0.8 Meters Contrast Wine Blouse with Border',
    'Dry clean only. Roll fold periodically to prevent zari creases.',
    'Ships in 24 hours. COD available.',
    'Mustard Gold Kanjeevaram Silk Saree | PocketFriendly Sarees',
    'Drape South Indian royalty with Mustard Gold Kanjeevaram Silk Saree at an affordable price.'
),
(
    'p1000000-0000-0000-0000-000000000004',
    'Midnight Blue Sequin Glamour Georgette Saree',
    'midnight-blue-sequin-glamour-georgette-saree',
    'Turn heads effortlessly at evening celebrations. Flowing midnight blue faux-georgette highlighted with tone-on-tone 5mm micro-sequin lines that catch the ambient light with every step.',
    'c1000000-0000-0000-0000-000000000005',
    'PFS-GEO-004',
    2499.00,
    'percentage',
    20.00,
    1999.20,
    22,
    5,
    'active',
    true,
    true,
    true,
    true,
    'Poly-Georgette with Micro-Sequins',
    'Midnight Blue',
    'Vertical Linear Sequin Jaal',
    'Cocktail Soiree, Sangeet Night, Party Wear',
    '5.5 Meters',
    true,
    '0.8 Meters Heavy Sequin Satin Blouse',
    'Dry clean recommended or gentle cold hand wash.',
    'Express delivery across tier 1 & 2 cities.',
    'Midnight Blue Sequin Party Saree | PocketFriendly Sarees',
    'Glamorous Midnight Blue sequin saree for party and sangeet night. Affordable designer look.'
),
(
    'p1000000-0000-0000-0000-000000000005',
    'Peach Blossom Chanderi Zari Butta Saree',
    'peach-blossom-chanderi-zari-butta-saree',
    'Subtle sophistication for summer soirees and family pujas. Woven in crisp Chanderi cotton-silk with miniature ashrafi gold buttas and a lustrous tissue border.',
    'c1000000-0000-0000-0000-000000000004',
    'PFS-CHA-005',
    1999.00,
    'fixed',
    400.00,
    1599.00,
    19,
    4,
    'active',
    false,
    true,
    true,
    false,
    'Chanderi Cotton Silk',
    'Pastel Peach',
    'Ashrafi Gold Zari Buttas & Zari Border',
    'Day Puja, Family Gatherings, Office Festive',
    '5.5 Meters',
    true,
    '0.8 Meters Plain Chanderi with Zari Patti',
    'Hand wash with mild liquid detergent. Warm iron.',
    'Dispatches within 24 hours.',
    'Peach Chanderi Zari Saree | PocketFriendly Sarees',
    'Breathable pastel peach Chanderi saree with gold zari buttas. Unbeatable price.'
),
(
    'p1000000-0000-0000-0000-000000000006',
    'Marigold Crimson Bandhani Gharchola Saree',
    'marigold-crimson-bandhani-gharchola-saree',
    'Celebrate deep Gujarati and Rajasthani tradition with this auspicious Gharchola grid pattern Bandhani saree, dyed with golden zari checks and traditional Rai-bandhej dots.',
    'c1000000-0000-0000-0000-000000000006',
    'PFS-BAN-006',
    2799.00,
    'percentage',
    25.00,
    2099.25,
    12,
    3,
    'active',
    true,
    true,
    false,
    true,
    'Art Silk Bandhej with Zari Grid',
    'Auspicious Crimson & Marigold Yellow',
    'Gharchola Zari Check with Rai Bandhani',
    'Karwa Chauth, Navratri, Wedding Rituals',
    '5.5 Meters',
    true,
    '0.8 Meters Running Bandhani Blouse',
    'Dry clean only to maintain crisp Bandhej crinkles.',
    'Ready to ship across India.',
    'Marigold Crimson Bandhani Saree | PocketFriendly Sarees',
    'Auspicious Bandhani Gharchola saree for weddings and Karwa Chauth at pocket-friendly pricing.'
),
(
    'p1000000-0000-0000-0000-000000000007',
    'Indigo Dabu Handblock Mulmul Cotton Saree',
    'indigo-dabu-handblock-mulmul-cotton-saree',
    'Pure natural comfort. Woven in 100-count soft Mulmul cotton, block-printed by rural artisans using mud-resist Dabu craft and organic vegetable indigo dyes with pom-pom tasselled pallu.',
    'c1000000-0000-0000-0000-000000000007',
    'PFS-COT-007',
    1499.00,
    'percentage',
    20.00,
    1199.20,
    30,
    6,
    'active',
    false,
    false,
    true,
    false,
    '100% Pure Mulmul Cotton',
    'Indigo Blue & Ivory',
    'Traditional Floral Dabu Handblock Print',
    'Daily Wear, Workwear, Summer Casual',
    '5.5 Meters',
    true,
    '0.8 Meters Contrast Handblock Printed Blouse',
    'Machine wash gentle cycle or hand wash cold.',
    'Same-day dispatch.',
    'Indigo Dabu Handblock Cotton Saree | PocketFriendly Sarees',
    'Ultra-soft 100% pure Mulmul cotton saree in organic indigo prints for daily effortless wear.'
),
(
    'p1000000-0000-0000-0000-000000000008',
    'Emerald Green Paithani Silk Saree',
    'emerald-green-paithani-silk-saree',
    'A jewel in Maharashtra weaving heritage. Rich emerald green base framed with a resplendent gold zari pallu adorned with multi-colored hand-woven Asavali peacock motifs.',
    'c1000000-0000-0000-0000-000000000001',
    'PFS-PAI-008',
    3799.00,
    'percentage',
    25.00,
    2849.25,
    8,
    3,
    'active',
    true,
    true,
    false,
    true,
    'Paithani Soft Silk Blend',
    'Emerald Green & Fuchsia Border',
    'Peacock Muniya Border with Grand Zari Pallu',
    'Maharashtrian Wedding, Diwali, Baby Shower',
    '5.5 Meters',
    true,
    '0.8 Meters Contrast Fuchsia Blouse with Border',
    'Dry clean only. Roll in muslin cloth.',
    'Free express shipping with tracking.',
    'Emerald Green Paithani Silk Saree | PocketFriendly Sarees',
    'Handloom-feel Emerald Green Paithani Silk Saree with authentic peacock pallu at an affordable rate.'
)
ON CONFLICT (id) DO NOTHING;

-- 5. INSERT PRODUCT IMAGES
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- Product 1
('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', 'Royal Crimson Banarasi Katan Silk Saree Full Drape', true, 1),
('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', 'Banarasi Zari Pallu and Brocade Detail', false, 2),
-- Product 2
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', 'Sage Mint Organza Embroidered Saree', true, 1),
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1610030469668-935a8df2a201?auto=format&fit=crop&w=1000&q=80', 'Scalloped Border Embroidery Close-up', false, 2),
-- Product 3
('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80', 'Temple Border Mustard Gold Kanjeevaram Saree', true, 1),
('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80', 'Kanjeevaram Gold Zari Pallu Work', false, 2),
-- Product 4
('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80', 'Midnight Blue Sequin Glamour Georgette Saree', true, 1),
('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80', 'Sequin Georgette Fabric Texture and Sparkle', false, 2),
-- Product 5
('p1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1610030469668-935a8df2a201?auto=format&fit=crop&w=1000&q=80', 'Peach Blossom Chanderi Zari Butta Saree', true, 1),
-- Product 6
('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80', 'Marigold Crimson Bandhani Gharchola Saree', true, 1),
-- Product 7
('p1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1000&q=80', 'Indigo Dabu Handblock Mulmul Cotton Saree', true, 1),
-- Product 8
('p1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 'Emerald Green Paithani Silk Saree', true, 1);

-- 6. LINK PRODUCTS TO LATEST COLLECTION
INSERT INTO collection_products (collection_id, product_id, display_order) VALUES
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 1),
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 2),
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000003', 3),
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000004', 4),
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000005', 5),
('b1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000006', 6)
ON CONFLICT DO NOTHING;

-- 7. DEFAULT COUPONS / DISCOUNTS
INSERT INTO discounts (id, name, code, discount_type, discount_value, min_order_value, is_active, usage_limit) VALUES
('d1000000-0000-0000-0000-000000000001', 'Welcome Festive 10%', 'WELCOME10', 'percentage', 10.00, 1499.00, true, 500),
('d1000000-0000-0000-0000-000000000002', 'Flat ₹300 OFF on Banarasi & Kanjeevaram', 'ROYAL300', 'fixed', 300.00, 2499.00, true, 200)
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL REVIEWS
INSERT INTO reviews (product_id, customer_name, rating, review_title, review_text) VALUES
('p1000000-0000-0000-0000-000000000001', 'Ananya Sharma', 5, 'Unbelievable quality for this price!', 'I was genuinely skeptical ordering a Banarasi silk saree at under ₹3000, but when it arrived, the zari shine and rich crimson weight blew me away! Wore it to my cousin wedding and received endless compliments.'),
('p1000000-0000-0000-0000-000000000002', 'Pooja Iyer', 5, 'So light and elegant for summer parties', 'The sage mint color is exactly as pictured. Scalloped embroidery is clean without any loose threads. Very soft against the skin, unlike cheap rough organzas.'),
('p1000000-0000-0000-0000-000000000003', 'Meenakshi Sundaram', 5, 'Traditional temple border perfection', 'The mustard and wine contrast is so auspicious for temple pujas. Blouse piece is ample 0.8m with heavy border. Will definitely purchase again from PocketFriendly!');
