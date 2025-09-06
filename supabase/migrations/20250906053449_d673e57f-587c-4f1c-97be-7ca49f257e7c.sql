-- Fix RLS policies for NFT minting

-- Update RLS policies for nft_tokens to allow minting
DROP POLICY IF EXISTS "Users can create tokens" ON public.nft_tokens;

CREATE POLICY "Users can create tokens" ON public.nft_tokens
FOR INSERT 
WITH CHECK (true);

-- Update RLS policies for nft_collections to allow creating collections
DROP POLICY IF EXISTS "Users can create collections" ON public.nft_collections;

CREATE POLICY "Users can create collections" ON public.nft_collections
FOR INSERT 
WITH CHECK (true);