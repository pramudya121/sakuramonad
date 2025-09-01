-- Clean all fake/mock data from the database
DELETE FROM marketplace_transactions;
DELETE FROM auction_bids;
DELETE FROM marketplace_offers;
DELETE FROM marketplace_auctions;
DELETE FROM marketplace_listings;
DELETE FROM nft_tokens;
DELETE FROM nft_collections;
DELETE FROM marketplace_analytics;
DELETE FROM user_watchlists;

-- Add indexes for better performance with blockchain sync
CREATE INDEX IF NOT EXISTS idx_nft_tokens_contract_tokenid ON nft_tokens(collection_id, token_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_auctions_active ON marketplace_auctions(is_settled, end_time);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_hash ON marketplace_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_nft_collections_contract ON nft_collections(contract_address);

-- Add columns needed for blockchain synchronization
ALTER TABLE nft_collections ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'ERC721';
ALTER TABLE nft_collections ADD COLUMN IF NOT EXISTS last_sync_block BIGINT DEFAULT 0;
ALTER TABLE nft_tokens ADD COLUMN IF NOT EXISTS last_sync_block BIGINT DEFAULT 0;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'fixed_price';
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS contract_address TEXT;

-- Create table for blockchain sync state
CREATE TABLE IF NOT EXISTS blockchain_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_processed_block BIGINT NOT NULL DEFAULT 0,
  contract_address TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(contract_address, event_type)
);

-- Enable RLS for sync state
ALTER TABLE blockchain_sync_state ENABLE ROW LEVEL SECURITY;

-- Create policy for sync state (read-only for now)
CREATE POLICY "Sync state is viewable by everyone" 
ON blockchain_sync_state 
FOR SELECT 
USING (true);

-- Create trigger for updated_at on sync state
CREATE TRIGGER update_blockchain_sync_state_updated_at
BEFORE UPDATE ON blockchain_sync_state
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();