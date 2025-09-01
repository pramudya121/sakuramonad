-- Fix RLS policies for user_watchlists table to prevent privacy violations

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.user_watchlists;
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.user_watchlists;

-- Create secure policies that restrict access to user's own data only
-- Note: This assumes users authenticate with wallet addresses stored in user_address

-- Policy for viewing own watchlist items only
CREATE POLICY "Users can view their own watchlist items" 
ON public.user_watchlists 
FOR SELECT 
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address' OR user_address = auth.uid()::text);

-- Policy for inserting own watchlist items only
CREATE POLICY "Users can create their own watchlist items" 
ON public.user_watchlists 
FOR INSERT 
TO authenticated
WITH CHECK (user_address = auth.jwt() ->> 'wallet_address' OR user_address = auth.uid()::text);

-- Policy for updating own watchlist items only
CREATE POLICY "Users can update their own watchlist items" 
ON public.user_watchlists 
FOR UPDATE 
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address' OR user_address = auth.uid()::text)
WITH CHECK (user_address = auth.jwt() ->> 'wallet_address' OR user_address = auth.uid()::text);

-- Policy for deleting own watchlist items only
CREATE POLICY "Users can delete their own watchlist items" 
ON public.user_watchlists 
FOR DELETE 
TO authenticated
USING (user_address = auth.jwt() ->> 'wallet_address' OR user_address = auth.uid()::text);

-- Create a helper function to get current user's wallet address
CREATE OR REPLACE FUNCTION public.get_current_user_wallet_address()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() ->> 'wallet_address',
    auth.uid()::text
  );
$$;

-- Update policies to use the helper function for better maintainability
DROP POLICY IF EXISTS "Users can view their own watchlist items" ON public.user_watchlists;
DROP POLICY IF EXISTS "Users can create their own watchlist items" ON public.user_watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlist items" ON public.user_watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlist items" ON public.user_watchlists;

-- Create final secure policies using the helper function
CREATE POLICY "Users can view their own watchlist items" 
ON public.user_watchlists 
FOR SELECT 
TO authenticated
USING (user_address = public.get_current_user_wallet_address());

CREATE POLICY "Users can create their own watchlist items" 
ON public.user_watchlists 
FOR INSERT 
TO authenticated
WITH CHECK (user_address = public.get_current_user_wallet_address());

CREATE POLICY "Users can update their own watchlist items" 
ON public.user_watchlists 
FOR UPDATE 
TO authenticated
USING (user_address = public.get_current_user_wallet_address())
WITH CHECK (user_address = public.get_current_user_wallet_address());

CREATE POLICY "Users can delete their own watchlist items" 
ON public.user_watchlists 
FOR DELETE 
TO authenticated
USING (user_address = public.get_current_user_wallet_address());