-- Fix function search path security issue

-- Drop and recreate the function with proper search_path setting
DROP FUNCTION IF EXISTS public.get_current_user_wallet_address();

-- Create the function with secure search_path
CREATE OR REPLACE FUNCTION public.get_current_user_wallet_address()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'wallet_address',
    auth.uid()::text
  );
$$;

-- Also fix the update_updated_at_column function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;