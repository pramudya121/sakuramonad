-- Add missing image_url column to nft_collections
ALTER TABLE nft_collections 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create marketplace_analytics table for analytics data
CREATE TABLE IF NOT EXISTS marketplace_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES nft_collections(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_volume NUMERIC DEFAULT 0,
  daily_sales INTEGER DEFAULT 0,
  unique_buyers INTEGER DEFAULT 0,
  unique_sellers INTEGER DEFAULT 0,
  average_price NUMERIC DEFAULT 0,
  floor_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_watchlists table for portfolio watchlist feature
CREATE TABLE IF NOT EXISTS user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  token_id UUID NOT NULL REFERENCES nft_tokens(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE marketplace_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_analytics (public read)
CREATE POLICY "Public read analytics"
ON marketplace_analytics FOR SELECT
USING (true);

CREATE POLICY "Public write analytics"
ON marketplace_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update analytics"
ON marketplace_analytics FOR UPDATE
USING (true);

-- RLS policies for user_watchlists
CREATE POLICY "Users can read all watchlists"
ON user_watchlists FOR SELECT
USING (true);

CREATE POLICY "Users can add to watchlist"
ON user_watchlists FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete from watchlist"
ON user_watchlists FOR DELETE
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_marketplace_analytics_updated_at
BEFORE UPDATE ON marketplace_analytics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_collection ON marketplace_analytics(collection_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_analytics_date ON marketplace_analytics(date);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_user ON user_watchlists(user_address);
CREATE INDEX IF NOT EXISTS idx_user_watchlists_token ON user_watchlists(token_id);