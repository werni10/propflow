-- ============================================
-- PropFlow Seed Data
-- Run in Supabase SQL Editor
-- ============================================

-- NOTE: Supabase auth creates users in auth.users automatically.
-- These inserts go into the public.users table (our app profile table).
-- For testing, create accounts via the UI first, then run the item seeds below.
-- OR use the demo data below with placeholder UUIDs.

-- Step 1: Create test user profiles
-- (Replace UUIDs with real ones from auth.users after signup, or use these for demo)

INSERT INTO users (id, email, name, phone, role, status, avatar_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'hiba@propflow.ma',  'Hiba Berrada',   '+212 6 11 22 33 44', 'decorator', 'verified', null),
  ('22222222-2222-2222-2222-222222222222', 'amine@propflow.ma', 'Amine Tazi',     '+212 6 55 66 77 88', 'decorator', 'verified', null),
  ('33333333-3333-3333-3333-333333333333', 'renter1@test.com',  'Karim El Fassi', '+212 6 99 88 77 66', 'renter',    'verified', null),
  ('44444444-4444-4444-4444-444444444444', 'renter2@test.com',  'Sara Alaoui',    '+212 6 12 34 56 78', 'renter',    'verified', null),
  ('00000000-0000-0000-0000-000000000000', 'admin@propflow.ma', 'Sami Admin',     '+212 6 00 00 00 00', 'decorator', 'verified', null)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create decorator profiles
INSERT INTO decorators (id, bio, portfolio_verified, average_rating, total_listings, subscription_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Set decorator with 8 years experience in Moroccan cinema. Specialized in traditional and contemporary Moroccan interiors.', true, 4.8, 0, true),
  ('22222222-2222-2222-2222-222222222222', 'Professional prop stylist working on international productions in Morocco. Expert in vintage and period pieces.', true, 4.6, 0, true)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert props (items)
INSERT INTO items (id, decorator_id, title, description, category, price_per_day, deposit_required, deposit_amount, condition, location, photos, availability_dates) VALUES

-- Hiba's props
('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Vintage Moroccan Cedar Table',
 'Hand-carved cedar table from Fes medina, circa 1960s. Intricate geometric patterns on the legs and border. Perfect for traditional interior scenes. Dimensions: 180cm × 80cm × 75cm.',
 'Furniture', 350.00, true, 1000.00, 'Excellent', 'Casablanca',
 '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
 '{}'),

('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Brass Moroccan Lanterns (Set of 6)',
 'Authentic hand-punched brass lanterns in varying sizes. Create dramatic lighting effects ideal for desert or riad scenes. Largest lantern: 45cm height.',
 'Lighting', 180.00, false, null, 'Good', 'Casablanca',
 '["https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800"]',
 '{}'),

('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Traditional Berber Carpet — Large',
 'Authentic handwoven Berber carpet from the Atlas mountains. Rich earthy tones of red, orange and cream. Size: 300cm × 200cm. Excellent condition, rarely used.',
 'Textiles', 220.00, true, 500.00, 'Excellent', 'Casablanca',
 '["https://images.unsplash.com/photo-1600166898405-da9535204843?w=800"]',
 '{}'),

('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Art Deco Writing Desk',
 'Elegant 1930s-style writing desk in dark walnut finish. Single drawer with brass hardware. Perfect for period films or contemporary office scenes. 120cm × 60cm.',
 'Furniture', 280.00, true, 800.00, 'Good', 'Casablanca',
 '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
 '{}'),

('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa',
 '11111111-1111-1111-1111-111111111111',
 'Ornate Mirror — Moorish Arch Frame',
 'Large floor mirror with hand-painted Moorish arch frame. Gold and ivory detailing. Stunning focal piece for luxury or traditional settings. 200cm × 90cm.',
 'Decor', 160.00, false, null, 'Excellent', 'Casablanca',
 '["https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800"]',
 '{}'),

-- Amine's props
('bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Industrial Loft Sofa — Leather',
 'Dark brown leather sofa with aged patina. Industrial design with exposed rivets and raw metal legs. Seats 3 comfortably. Ideal for urban contemporary scenes.',
 'Furniture', 400.00, true, 1200.00, 'Good', 'Marrakech',
 '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"]',
 '{}'),

('bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Vintage Film Camera — Arriflex 16mm',
 'Non-functional Arriflex 16mm camera, perfect for props in film-within-film productions. Authentic 1970s unit with original leather carrying case and accessories.',
 'Props', 250.00, true, 2000.00, 'Good', 'Marrakech',
 '["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"]',
 '{}'),

('bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Copper Pendant Lights (Set of 3)',
 'Hammered copper pendant lights in graduated sizes. Warm amber glow effect. Includes 3m adjustable cables. Ideal for kitchen, restaurant or café scenes.',
 'Lighting', 140.00, false, null, 'Excellent', 'Marrakech',
 '["https://images.unsplash.com/photo-1513506003901-1e6a35c2d5b5?w=800"]',
 '{}'),

('bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Antique Typewriter — Olivetti',
 'Original 1960s Olivetti Lettera 32 typewriter in sage green. Fully functional. Iconic prop for period pieces, literary scenes, or journalist characters.',
 'Props', 120.00, false, null, 'Good', 'Fes',
 '["https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?w=800"]',
 '{}'),

('bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Silk Drapes — Emerald Green (Pair)',
 'Luxurious floor-to-ceiling silk drapes in deep emerald. 300cm drop × 140cm wide each. Lined for fullness. Perfect for period drama or luxury interiors.',
 'Textiles', 190.00, false, null, 'Excellent', 'Fes',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]',
 '{}'),

('bbbbbbbb-0006-0006-0006-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222',
 'Rustic Wooden Bookshelf — Double',
 'Double-sided bookshelf in reclaimed olive wood. 180cm × 90cm × 35cm per unit. Can be arranged in multiple configurations. Includes styling books and objects.',
 'Furniture', 200.00, true, 600.00, 'Good', 'Rabat',
 '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"]',
 '{}')

ON CONFLICT (id) DO NOTHING;

-- Step 4: Update decorator listing counts
UPDATE decorators SET total_listings = (
  SELECT COUNT(*) FROM items WHERE items.decorator_id = decorators.id
);

-- Step 5: Verification queue entries (for testing admin dashboard)
INSERT INTO verification_queue (id, user_id, user_type, status) VALUES
  ('vvvvvvvv-0001-0001-0001-vvvvvvvvvvvv', '33333333-3333-3333-3333-333333333333', 'renter', 'pending'),
  ('vvvvvvvv-0002-0002-0002-vvvvvvvvvvvv', '44444444-4444-4444-4444-444444444444', 'renter', 'pending')
ON CONFLICT (id) DO NOTHING;

-- Done! Check your data:
-- SELECT * FROM users;
-- SELECT * FROM items;
-- SELECT * FROM decorators;
