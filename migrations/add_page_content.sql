-- Migration: Add page content table for dynamic page management
-- This allows admins to manage content for about, contact, and how-to-use pages

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL, -- 'about', 'contact', 'how-to-use'
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL, -- Store all page content as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default content for about page (English)
INSERT INTO page_content (page_key, title, subtitle, content) VALUES
  ('about', 'About Greenex', NULL, '{
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
  }'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Insert default content for contact page (English)
INSERT INTO page_content (page_key, title, subtitle, content) VALUES
  ('contact', 'Contact Us', 'Get in touch with Greenex Norway', '{
    "companyName": "Greenex Norway",
    "address": "Industriveien 31\n1337 Sandvika, Norway",
    "email": "post@greenex.no",
    "website": "https://www.greenolyte.no",
    "websiteLabel": "www.greenolyte.no",
    "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1997.3456789!2d10.513!3d59.938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4641%3A0x0!2sIndustriveien%2031%2C%201337%20Sandvika!5e0!3m2!1sen!2sno!4v1234567890123!5m2!1sen!2sno"
  }'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Insert default content for how-to-use page (English)
INSERT INTO page_content (page_key, title, subtitle, content) VALUES
  ('how-to-use', 'How to Use NORWA Products', 'NORWA products are very effective and easy to use. Below are videos and methods about the use of products.', '{
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
  }'::jsonb)
ON CONFLICT (page_key) DO NOTHING;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);

-- Enable Row Level Security
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read page content
CREATE POLICY "Everyone can view page content" ON page_content
  FOR SELECT USING (true);

-- Policy: Only admins can manage page content
CREATE POLICY "Admins can manage page content" ON page_content
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
