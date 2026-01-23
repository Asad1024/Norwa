-- Complete Database Schema for Norwa E-Commerce Platform
-- This file contains all tables, columns, indexes, RLS policies, and triggers
-- Run this file in your Supabase SQL Editor to set up the complete database

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- Legacy field, kept for backward compatibility
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  technical_data_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT stock_non_negative CHECK (stock >= 0)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  shipping_address TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Product user assignments table
CREATE TABLE IF NOT EXISTS product_user_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, user_id)
);

-- Navigation links settings table
CREATE TABLE IF NOT EXISTS nav_links_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_key TEXT UNIQUE NOT NULL,
  href TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Page content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL, -- 'about', 'contact', 'how-to-use'
  title TEXT NOT NULL,
  subtitle TEXT,
  title_translations JSONB DEFAULT '{"en": "", "no": ""}',
  subtitle_translations JSONB DEFAULT '{"en": "", "no": ""}',
  content JSONB NOT NULL, -- Store all page content as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- TRANSLATION COLUMNS
-- ============================================================================

-- Add translation columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "no": ""}',
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "no": ""}';

-- Add translation columns to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS name_translations JSONB DEFAULT '{"en": "", "no": ""}',
ADD COLUMN IF NOT EXISTS description_translations JSONB DEFAULT '{"en": "", "no": ""}';

-- Migrate existing products data to translations
UPDATE products 
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'no', COALESCE(name, '')),
  description_translations = jsonb_build_object('en', COALESCE(description, ''), 'no', COALESCE(description, ''))
WHERE name_translations IS NULL OR name_translations = '{"en": "", "no": ""}'::jsonb;

-- Migrate existing categories data to translations
UPDATE categories
SET 
  name_translations = jsonb_build_object('en', COALESCE(name, ''), 'no', COALESCE(name, '')),
  description_translations = jsonb_build_object('en', COALESCE(description, ''), 'no', COALESCE(description, ''))
WHERE name_translations IS NULL OR name_translations = '{"en": "", "no": ""}'::jsonb;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_name_translations ON products USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_products_description_translations ON products USING GIN (description_translations);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_name_translations ON categories USING GIN (name_translations);
CREATE INDEX IF NOT EXISTS idx_categories_description_translations ON categories USING GIN (description_translations);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Product user assignments indexes
CREATE INDEX IF NOT EXISTS idx_product_user_assignments_product_id ON product_user_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_user_assignments_user_id ON product_user_assignments(user_id);

-- Navigation links indexes
CREATE INDEX IF NOT EXISTS idx_nav_links_settings_enabled ON nav_links_settings(is_enabled);
CREATE INDEX IF NOT EXISTS idx_nav_links_settings_sort_order ON nav_links_settings(sort_order);

-- Page content indexes
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);
CREATE INDEX IF NOT EXISTS idx_page_content_title_translations ON page_content USING GIN (title_translations);
CREATE INDEX IF NOT EXISTS idx_page_content_subtitle_translations ON page_content USING GIN (subtitle_translations);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_links_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products are editable by admins" ON products;
CREATE POLICY "Products are editable by admins" ON products
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;
CREATE POLICY "Categories are editable by admins" ON categories
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
      )
    )
  );

-- Product user assignments policies
DROP POLICY IF EXISTS "Admins can manage product assignments" ON product_user_assignments;
CREATE POLICY "Admins can manage product assignments" ON product_user_assignments
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Users can view own assignments" ON product_user_assignments;
CREATE POLICY "Users can view own assignments" ON product_user_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- Navigation links policies
DROP POLICY IF EXISTS "Everyone can view enabled nav links" ON nav_links_settings;
CREATE POLICY "Everyone can view enabled nav links" ON nav_links_settings
  FOR SELECT USING (is_enabled = true);

DROP POLICY IF EXISTS "Admins can manage nav links" ON nav_links_settings;
CREATE POLICY "Admins can manage nav links" ON nav_links_settings
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Page content policies
DROP POLICY IF EXISTS "Everyone can view page content" ON page_content;
CREATE POLICY "Everyone can view page content" ON page_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage page content" ON page_content;
CREATE POLICY "Admins can manage page content" ON page_content
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default navigation links
INSERT INTO nav_links_settings (link_key, href, is_enabled, sort_order) VALUES
  ('products', '/products', true, 1),
  ('about', '/about', true, 2),
  ('how-to-use', '/how-to-use', true, 3),
  ('contact', '/contact', true, 4)
ON CONFLICT (link_key) DO NOTHING;

-- Insert default page content for about page (English)
INSERT INTO page_content (page_key, title, subtitle, content, title_translations, subtitle_translations) VALUES
  ('about', 'About Greenex', NULL, '{
    "en": {
      "sections": [
        {
          "type": "overview",
          "title": "About Greenex",
          "descriptions": [
            "Greenex is a Norwegian manufacturing and product development company. We develop and manufacture the most environmentally and ecologically preferable technologies, materials, and equipment with efficiency and reliability.",
            "Our main business activity is to produce and sell products based on electrochemically activated water.",
            "We produce two basic solutions: Greenolyte, the world''s most powerful disinfectant, and Greetholyte, a nonfoaming detergent.",
            "Greenex consists of a dedicated and experienced team of professionals who provide an efficient and reliable service to our customers."
          ],
          "feature": {
            "icon": "Droplets",
            "title": "Electrochemically Activated Water",
            "description": "Innovative technology for sustainable solutions"
          }
        },
        {
          "type": "mission",
          "title": "Our Mission",
          "subtitle": "Solving future challenges through innovation and sustainable technology",
          "cards": [
            {
              "icon": "TrendingUp",
              "title": "Growth & Innovation",
              "description": "A fast-growing company promoting environment-friendly solutions. In the spring of 2020, we successfully introduced the Greenolyte brand to customers in Norway and other European countries, providing us with a strong platform for reinforcing the growth and development of our business."
            },
            {
              "icon": "Leaf",
              "title": "NORWA Cleaning Range",
              "description": "In 2023, we introduced the NORWA cleaning range to our customers, expanding our commitment to providing nature-friendly cleaning solutions for everyday use."
            }
          ],
          "vision": {
            "title": "Our Vision",
            "description": "Our mission is to solve future challenges by connecting people, knowledge, and unique technology to create better, greener, and safer solutions – while still running a profitable business for our customers and us."
          }
        },
        {
          "type": "values",
          "title": "Our Core Values",
          "subtitle": "What drives us forward",
          "values": [
            {
              "icon": "Leaf",
              "title": "Sustainability",
              "description": "Committed to environmentally responsible practices and products"
            },
            {
              "icon": "Zap",
              "title": "Innovation",
              "description": "Pioneering new technologies for better solutions"
            },
            {
              "icon": "Shield",
              "title": "Reliability",
              "description": "Delivering consistent quality and dependable service"
            }
          ]
        }
      ]
    },
    "no": {
      "sections": [
        {
          "type": "overview",
          "title": "Om Greenex",
          "descriptions": [
            "Greenex er et norsk produksjons- og produktutviklingsselskap. Vi utvikler og produserer de mest miljø- og økologisk foretrukne teknologiene, materialene og utstyret med effektivitet og pålitelighet.",
            "Vår hovedforretningsaktivitet er å produsere og selge produkter basert på elektrokjemisk aktivert vann.",
            "Vi produserer to grunnleggende løsninger: Greenolyte, verdens kraftigste desinfeksjonsmiddel, og Greetholyte, et skumfritt vaskemiddel.",
            "Greenex består av et dedikert og erfarne team av fagfolk som gir en effektiv og pålitelig tjeneste til våre kunder."
          ],
          "feature": {
            "icon": "Droplets",
            "title": "Elektrokjemisk Aktivert Vann",
            "description": "Innovativ teknologi for bærekraftige løsninger"
          }
        }
      ]
    }
  }'::jsonb, '{"en": "About Greenex", "no": "Om Greenex"}'::jsonb, '{"en": "", "no": ""}'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Insert default page content for contact page (English)
INSERT INTO page_content (page_key, title, subtitle, content, title_translations, subtitle_translations) VALUES
  ('contact', 'Contact Us', 'Get in touch with Greenex Norway', '{
    "en": {
      "companyName": "Greenex Norway",
      "address": "Industriveien 31\n1337 Sandvika, Norway",
      "email": "post@greenex.no",
      "website": "https://www.greenolyte.no",
      "websiteLabel": "www.greenolyte.no",
      "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.3456789!2d10.513!3d59.938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4641%3A0x0!2sIndustriveien%2031%2C%201337%20Sandvika!5e0!3m2!1sen!2sno!4v1234567890123!5m2!1sen!2sno"
    },
    "no": {
      "companyName": "Greenex Norway",
      "address": "Industriveien 31\n1337 Sandvika, Norge",
      "email": "post@greenex.no",
      "website": "https://www.greenolyte.no",
      "websiteLabel": "www.greenolyte.no",
      "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.3456789!2d10.513!3d59.938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4641%3A0x0!2sIndustriveien%2031%2C%201337%20Sandvika!5e0!3m2!1sen!2sno!4v1234567890123!5m2!1sen!2sno"
    }
  }'::jsonb, '{"en": "Contact Us", "no": "Kontakt Oss"}'::jsonb, '{"en": "Get in touch with Greenex Norway", "no": "Ta kontakt med Greenex Norway"}'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Insert default page content for how-to-use page (English)
INSERT INTO page_content (page_key, title, subtitle, content, title_translations, subtitle_translations) VALUES
  ('how-to-use', 'How to Use NORWA Products', 'NORWA products are very effective and easy to use. Below are videos and methods about the use of products.', '{
    "en": {
      "sections": [
        {
          "title": "NORWA Fettfjerner",
          "description": "Video presentation about the effectiveness of the product and how to use it.",
          "videos": [
            {
              "title": "Introduction to NORWA Products",
              "description": "Learn about the benefits and features of our nature-friendly cleaning solutions",
              "url": "https://video.wixstatic.com/video/01bed9_e15acfaf3db649cd890cfb7e920fb016/720p/mp4/file.mp4"
            },
            {
              "title": "Quick Start Guide",
              "description": "Get started quickly with our step-by-step tutorial",
              "url": "https://video.wixstatic.com/video/01bed9_bb35b5284c2141a7b05437d2eabb0105/1080p/mp4/file.mp4"
            }
          ]
        },
        {
          "title": "NORWA Grill Renser",
          "description": "Video presentation about the effectiveness of the product and how to use it.",
          "videos": [
            {
              "title": "Fettfjerner Effectiveness Demo",
              "description": "See how NORWA Fettfjerner removes tough grease and fat stains",
              "url": "https://video.wixstatic.com/video/01bed9_9e51ecc36ca946b291214f5c80df029f/720p/mp4/file.mp4"
            },
            {
              "title": "How to Use Fettfjerner",
              "description": "Step-by-step guide on proper application and usage techniques",
              "url": "https://video.wixstatic.com/video/01bed9_7e6cc7dfb63b432d915e826083ce960e/1080p/mp4/file.mp4"
            }
          ]
        }
      ]
    },
    "no": {
      "sections": [
        {
          "title": "NORWA Fettfjerner",
          "description": "Video presentasjon om produktets effektivitet og hvordan det brukes.",
          "videos": [
            {
              "title": "Introduksjon til NORWA Produkter",
              "description": "Lær om fordelene og funksjonene til våre naturvennlige rengjøringsløsninger",
              "url": "https://video.wixstatic.com/video/01bed9_e15acfaf3db649cd890cfb7e920fb016/720p/mp4/file.mp4"
            }
          ]
        }
      ]
    }
  }'::jsonb, '{"en": "How to Use NORWA Products", "no": "Hvordan Bruke NORWA Produkter"}'::jsonb, '{"en": "NORWA products are very effective and easy to use. Below are videos and methods about the use of products.", "no": "NORWA produkter er svært effektive og enkle å bruke. Nedenfor er videoer og metoder om bruken av produktene."}'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to send order notification via Edge Function
CREATE OR REPLACE FUNCTION notify_admin_on_new_order()
RETURNS TRIGGER AS $$
DECLARE
  order_items_data JSONB;
  user_data JSONB;
  edge_function_url TEXT;
BEGIN
  -- Get the Supabase project URL from environment or use a default
  edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-email';
  
  -- If not set, construct from the current database
  IF edge_function_url IS NULL OR edge_function_url = '/functions/v1/send-email' THEN
    -- Extract project ref from the database name or use a placeholder
    -- You'll need to set this in your Supabase project settings
    edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email';
  END IF;

  -- Fetch order items with product details
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', oi.id,
      'order_id', oi.order_id,
      'product_id', oi.product_id,
      'quantity', oi.quantity,
      'price', oi.price,
      'products', jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'name_translations', p.name_translations,
        'description', p.description,
        'description_translations', p.description_translations,
        'image_url', p.image_url
      )
    )
  )
  INTO order_items_data
  FROM order_items oi
  LEFT JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = NEW.id;

  -- Get user email
  SELECT jsonb_build_object(
    'email', au.email,
    'user_metadata', au.raw_user_meta_data
  )
  INTO user_data
  FROM auth.users au
  WHERE au.id = NEW.user_id;

  -- Call the Edge Function via HTTP
  PERFORM
    net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', 'order_notification',
        'data', jsonb_build_object(
          'order', jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'total', NEW.total,
            'status', NEW.status,
            'shipping_address', NEW.shipping_address,
            'phone_number', NEW.phone_number,
            'created_at', NEW.created_at
          ),
          'orderItems', COALESCE(order_items_data, '[]'::jsonb),
          'userEmail', user_data->>'email',
          'userName', COALESCE(user_data->'user_metadata'->>'full_name', user_data->>'email')
        )
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the order creation
    RAISE WARNING 'Failed to send order notification email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function when a new order is inserted
DROP TRIGGER IF EXISTS trigger_notify_admin_on_new_order ON orders;
CREATE TRIGGER trigger_notify_admin_on_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_order();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Database schema setup completed successfully!';
  RAISE NOTICE 'All tables, indexes, RLS policies, and triggers have been created.';
  RAISE NOTICE 'Remember to:';
  RAISE NOTICE '1. Configure Google OAuth provider in Supabase Dashboard';
  RAISE NOTICE '2. Set up email service (SMTP or Edge Function)';
  RAISE NOTICE '3. Create an admin user by updating user metadata:';
  RAISE NOTICE '   UPDATE auth.users SET raw_user_meta_data = ''{"role": "admin"}''::jsonb WHERE email = ''your-email@example.com'';';
END $$;
