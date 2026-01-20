# Norwa - Nature-Friendly E-Commerce

A modern, full-stack e-commerce platform built with Next.js 14, Supabase, and Tailwind CSS. Features a beautiful nature-themed UI with green and blue colors.

## Features

### User Features
- Browse products with beautiful product listings
- View detailed product pages
- Add products to shopping cart
- Place orders
- View order history
- User authentication (email/password)

### Admin Features
- Add, edit, and delete products
- Manage product descriptions and prices
- View all orders placed by users
- Admin dashboard with statistics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS with custom nature theme
- **State Management**: Zustand for cart state
- **Authentication**: Supabase Auth

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Tables

Run these SQL queries in your Supabase SQL Editor:

```sql
-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Products: Only admins can modify
CREATE POLICY "Products are editable by admins" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Orders: Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: Users can view their order items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order items: Users can create their own order items
CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

### 4. Create an Admin User

1. Register a new user through the app's registration page
2. Go to Supabase Dashboard > Authentication > Users
3. Find your user and edit their metadata
4. Add: `{"role": "admin"}` to the `raw_user_meta_data` field

Or use SQL:

```sql
UPDATE auth.users
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
norwa/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (user)/            # User-facing pages
│   │   ├── products/      # Product listing & detail
│   │   ├── cart/          # Shopping cart
│   │   └── orders/        # User orders
│   ├── admin/             # Admin dashboard
│   │   ├── products/      # Product management
│   │   └── orders/        # Order viewing
│   └── api/               # API routes (if needed)
├── components/            # Reusable React components
├── lib/                   # Utilities & Supabase config
│   └── supabase/          # Supabase client setup
├── store/                 # Zustand state stores
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features in Detail

### Product Management
- Admins can add products with name, description, price, and image URL
- Products can be edited or deleted
- Image URLs are optional (default nature icon is shown if not provided)

### Shopping Cart
- Persistent cart using Zustand with localStorage
- Add/remove items, update quantities
- Cart persists across page refreshes

### Order System
- Users can checkout from cart to create orders
- Orders include all items with quantities and prices
- Order history available in user's account

### Authentication
- Simple email/password authentication via Supabase
- Role-based access control (user/admin)
- Protected admin routes

## Deployment

1. Build the project: `npm run build`
2. Deploy to Vercel (recommended) or any Next.js hosting platform
3. Add environment variables in your hosting platform's dashboard
4. Ensure your Supabase project allows connections from your domain

## License

MIT
