-- Create NFT collections table
CREATE TABLE public.nft_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  floor_price DECIMAL,
  total_volume DECIMAL DEFAULT 0,
  total_supply INTEGER,
  creator_address TEXT NOT NULL,
  royalty_percentage DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create NFT tokens table
CREATE TABLE public.nft_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.nft_collections(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  metadata_url TEXT,
  attributes JSONB,
  rarity_rank INTEGER,
  rarity_score DECIMAL,
  owner_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, token_id)
);

-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id INTEGER NOT NULL UNIQUE, -- from smart contract
  token_id UUID NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  seller_address TEXT NOT NULL,
  price DECIMAL NOT NULL,
  amount INTEGER DEFAULT 1,
  is_erc1155 BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offers table
CREATE TABLE public.marketplace_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id INTEGER NOT NULL,
  token_id UUID NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  buyer_address TEXT NOT NULL,
  price DECIMAL NOT NULL,
  amount INTEGER DEFAULT 1,
  expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  is_erc1155 BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(token_id, offer_id)
);

-- Create auctions table
CREATE TABLE public.marketplace_auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id INTEGER NOT NULL UNIQUE,
  token_id UUID NOT NULL REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  seller_address TEXT NOT NULL,
  reserve_price DECIMAL NOT NULL,
  highest_bid DECIMAL DEFAULT 0,
  highest_bidder_address TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  amount INTEGER DEFAULT 1,
  is_erc1155 BOOLEAN DEFAULT false,
  is_settled BOOLEAN DEFAULT false,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.marketplace_auctions(id) ON DELETE CASCADE,
  bidder_address TEXT NOT NULL,
  bid_amount DECIMAL NOT NULL,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.marketplace_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL UNIQUE,
  block_number INTEGER NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  token_id UUID REFERENCES public.nft_tokens(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'offer_accepted', 'auction_settled', 'listing', 'bid'
  price DECIMAL,
  amount INTEGER DEFAULT 1,
  gas_used INTEGER,
  gas_price DECIMAL,
  status TEXT DEFAULT 'confirmed', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user watchlists table
CREATE TABLE public.user_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  collection_id UUID REFERENCES public.nft_collections(id) ON DELETE CASCADE,
  token_id UUID REFERENCES public.nft_tokens(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_address, collection_id, token_id)
);

-- Create analytics data table
CREATE TABLE public.marketplace_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  collection_id UUID REFERENCES public.nft_collections(id) ON DELETE CASCADE,
  daily_volume DECIMAL DEFAULT 0,
  daily_sales INTEGER DEFAULT 0,
  unique_buyers INTEGER DEFAULT 0,
  unique_sellers INTEGER DEFAULT 0,
  average_price DECIMAL DEFAULT 0,
  floor_price DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, collection_id)
);

-- Enable Row Level Security
ALTER TABLE public.nft_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (marketplace is public)
CREATE POLICY "Collections are viewable by everyone" ON public.nft_collections FOR SELECT USING (true);
CREATE POLICY "Tokens are viewable by everyone" ON public.nft_tokens FOR SELECT USING (true);
CREATE POLICY "Listings are viewable by everyone" ON public.marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Offers are viewable by everyone" ON public.marketplace_offers FOR SELECT USING (true);
CREATE POLICY "Auctions are viewable by everyone" ON public.marketplace_auctions FOR SELECT USING (true);
CREATE POLICY "Bids are viewable by everyone" ON public.auction_bids FOR SELECT USING (true);
CREATE POLICY "Transactions are viewable by everyone" ON public.marketplace_transactions FOR SELECT USING (true);
CREATE POLICY "Analytics are viewable by everyone" ON public.marketplace_analytics FOR SELECT USING (true);

-- Watchlist policies (user-specific)
CREATE POLICY "Users can view their own watchlist" ON public.user_watchlists FOR SELECT USING (true);
CREATE POLICY "Users can manage their own watchlist" ON public.user_watchlists FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_nft_tokens_collection_id ON public.nft_tokens(collection_id);
CREATE INDEX idx_nft_tokens_owner_address ON public.nft_tokens(owner_address);
CREATE INDEX idx_marketplace_listings_active ON public.marketplace_listings(is_active) WHERE is_active = true;
CREATE INDEX idx_marketplace_offers_active ON public.marketplace_offers(is_active) WHERE is_active = true;
CREATE INDEX idx_marketplace_auctions_active ON public.marketplace_auctions(is_settled) WHERE is_settled = false;
CREATE INDEX idx_transactions_hash ON public.marketplace_transactions(transaction_hash);
CREATE INDEX idx_transactions_type ON public.marketplace_transactions(transaction_type);
CREATE INDEX idx_analytics_date ON public.marketplace_analytics(date);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_nft_collections_updated_at BEFORE UPDATE ON public.nft_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nft_tokens_updated_at BEFORE UPDATE ON public.nft_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_auctions_updated_at BEFORE UPDATE ON public.marketplace_auctions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();