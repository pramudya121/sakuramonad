-- Enable RLS policies for marketplace operations
-- Users should be able to create their own NFTs and listings

-- Allow users to create NFT collections
DROP POLICY IF EXISTS "Collections are viewable by everyone" ON public.nft_collections;
CREATE POLICY "Collections are viewable by everyone" ON public.nft_collections FOR SELECT USING (true);

CREATE POLICY "Users can create collections" ON public.nft_collections 
FOR INSERT WITH CHECK (creator_address = get_current_user_wallet_address());

CREATE POLICY "Creators can update their collections" ON public.nft_collections 
FOR UPDATE USING (creator_address = get_current_user_wallet_address());

-- Allow users to create NFT tokens
DROP POLICY IF EXISTS "Tokens are viewable by everyone" ON public.nft_tokens;
CREATE POLICY "Tokens are viewable by everyone" ON public.nft_tokens FOR SELECT USING (true);

CREATE POLICY "Users can create tokens" ON public.nft_tokens 
FOR INSERT WITH CHECK (owner_address = get_current_user_wallet_address());

CREATE POLICY "Owners can update their tokens" ON public.nft_tokens 
FOR UPDATE USING (owner_address = get_current_user_wallet_address());

-- Allow users to create marketplace listings
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.marketplace_listings;
CREATE POLICY "Listings are viewable by everyone" ON public.marketplace_listings FOR SELECT USING (true);

CREATE POLICY "Users can create listings" ON public.marketplace_listings 
FOR INSERT WITH CHECK (seller_address = get_current_user_wallet_address());

CREATE POLICY "Sellers can update their listings" ON public.marketplace_listings 
FOR UPDATE USING (seller_address = get_current_user_wallet_address());

-- Allow users to create offers
DROP POLICY IF EXISTS "Offers are viewable by everyone" ON public.marketplace_offers;
CREATE POLICY "Offers are viewable by everyone" ON public.marketplace_offers FOR SELECT USING (true);

CREATE POLICY "Users can create offers" ON public.marketplace_offers 
FOR INSERT WITH CHECK (buyer_address = get_current_user_wallet_address());

CREATE POLICY "Buyers can update their offers" ON public.marketplace_offers 
FOR UPDATE USING (buyer_address = get_current_user_wallet_address());

-- Create likes table for NFTs
CREATE TABLE IF NOT EXISTS public.nft_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id UUID NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(token_id, user_address)
);

ALTER TABLE public.nft_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON public.nft_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.nft_likes FOR INSERT WITH CHECK (user_address = get_current_user_wallet_address());
CREATE POLICY "Users can delete their likes" ON public.nft_likes FOR DELETE USING (user_address = get_current_user_wallet_address());

-- Enable realtime for key tables
ALTER TABLE public.nft_tokens REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_listings REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace_offers REPLICA IDENTITY FULL;
ALTER TABLE public.nft_likes REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.nft_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nft_likes;