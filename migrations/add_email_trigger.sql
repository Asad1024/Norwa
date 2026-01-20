-- Create a function to call the Supabase Edge Function for order notifications
-- This will be triggered automatically when a new order is created

-- First, enable the pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to send order notification via Edge Function
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

-- Note: You'll need to set these settings in your Supabase project:
-- 1. Go to Project Settings > API
-- 2. Set the Supabase URL and Service Role Key as database settings
-- Or use Supabase Edge Functions directly from your Next.js app instead
