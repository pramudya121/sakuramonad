-- Enable required extension
create extension if not exists pgcrypto;

-- Timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

-- Validation: auction times
create or replace function public.validate_auction_times()
returns trigger as $$
begin
  if new.end_time <= new.start_time then
    raise exception 'end_time must be after start_time';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

-- Enum for contract type
do $$ begin
  if not exists (select 1 from pg_type where typname = 'contract_type') then
    create type public.contract_type as enum ('ERC721','ERC1155');
  end if;
end $$;

-- Tables
create table if not exists public.nft_collections (
  id uuid primary key default gen_random_uuid(),
  contract_address text unique not null,
  name text,
  symbol text,
  creator_address text,
  royalty_percentage int default 0,
  contract_type public.contract_type default 'ERC721'::public.contract_type,
  description text,
  total_supply int,
  last_sync_block bigint default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nft_tokens (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.nft_collections(id) on delete cascade,
  token_id text not null,
  name text,
  description text,
  image_url text,
  metadata_url text,
  attributes jsonb,
  owner_address text,
  last_sync_block bigint default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, token_id)
);

create table if not exists public.nft_likes (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references public.nft_tokens(id) on delete cascade not null,
  user_address text not null,
  created_at timestamptz not null default now(),
  unique (token_id, user_address)
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  listing_id bigint unique not null,
  token_id uuid references public.nft_tokens(id) on delete cascade not null,
  price numeric(78,18) not null default 0,
  amount int not null default 1,
  is_erc1155 boolean not null default false,
  seller_address text not null,
  transaction_hash text,
  contract_address text,
  listing_type text not null default 'fixed_price',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_offers (
  id uuid primary key default gen_random_uuid(),
  offer_id bigint unique not null,
  token_id uuid references public.nft_tokens(id) on delete cascade not null,
  buyer_address text not null,
  price numeric(78,18) not null,
  amount int not null default 1,
  expiry timestamptz not null,
  is_erc1155 boolean not null default false,
  transaction_hash text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_hash text unique not null,
  from_address text,
  to_address text,
  token_id uuid references public.nft_tokens(id) on delete set null,
  price numeric(78,18),
  amount int default 1,
  transaction_type text not null,
  status text not null default 'pending',
  block_number bigint default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_auctions (
  id uuid primary key default gen_random_uuid(),
  auction_id bigint unique not null,
  token_id uuid references public.nft_tokens(id) on delete cascade not null,
  seller_address text not null,
  reserve_price numeric(78,18) not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  amount int not null default 1,
  is_erc1155 boolean not null default false,
  transaction_hash text,
  highest_bid numeric(78,18) not null default 0,
  is_settled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid references public.marketplace_auctions(id) on delete cascade not null,
  bidder_address text not null,
  bid_amount numeric(78,18) not null,
  transaction_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.blockchain_sync_state (
  id uuid primary key default gen_random_uuid(),
  contract_address text not null,
  event_type text not null,
  last_processed_block bigint not null default 0,
  updated_at timestamptz not null default now(),
  unique (contract_address, event_type)
);

-- Triggers for updated_at
drop trigger if exists trg_nft_collections_updated on public.nft_collections;
create trigger trg_nft_collections_updated
before update on public.nft_collections
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_nft_tokens_updated on public.nft_tokens;
create trigger trg_nft_tokens_updated
before update on public.nft_tokens
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_marketplace_listings_updated on public.marketplace_listings;
create trigger trg_marketplace_listings_updated
before update on public.marketplace_listings
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_marketplace_offers_updated on public.marketplace_offers;
create trigger trg_marketplace_offers_updated
before update on public.marketplace_offers
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_marketplace_auctions_updated on public.marketplace_auctions;
create trigger trg_marketplace_auctions_updated
before update on public.marketplace_auctions
for each row execute function public.update_updated_at_column();

-- Validation trigger for auctions
drop trigger if exists trg_validate_auction_times on public.marketplace_auctions;
create trigger trg_validate_auction_times
before insert or update on public.marketplace_auctions
for each row execute function public.validate_auction_times();

-- Indexes
create index if not exists idx_tokens_collection_token on public.nft_tokens(collection_id, token_id);
create index if not exists idx_listings_token on public.marketplace_listings(token_id);
create index if not exists idx_offers_token on public.marketplace_offers(token_id);
create index if not exists idx_tx_token on public.marketplace_transactions(token_id);
create index if not exists idx_auctions_token on public.marketplace_auctions(token_id);

-- Enable RLS
alter table public.nft_collections enable row level security;
alter table public.nft_tokens enable row level security;
alter table public.nft_likes enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_offers enable row level security;
alter table public.marketplace_transactions enable row level security;
alter table public.marketplace_auctions enable row level security;
alter table public.auction_bids enable row level security;
alter table public.blockchain_sync_state enable row level security;

-- Drop old policies to avoid duplicates
drop policy if exists "Public read collections" on public.nft_collections;
drop policy if exists "Public write collections" on public.nft_collections;
drop policy if exists "Public update collections" on public.nft_collections;
drop policy if exists "Public read tokens" on public.nft_tokens;
drop policy if exists "Public write tokens" on public.nft_tokens;
drop policy if exists "Public update tokens" on public.nft_tokens;
drop policy if exists "Public read likes" on public.nft_likes;
drop policy if exists "Public write likes" on public.nft_likes;
drop policy if exists "Public delete likes" on public.nft_likes;
drop policy if exists "Public read listings" on public.marketplace_listings;
drop policy if exists "Public write listings" on public.marketplace_listings;
drop policy if exists "Public update listings" on public.marketplace_listings;
drop policy if exists "Public read offers" on public.marketplace_offers;
drop policy if exists "Public write offers" on public.marketplace_offers;
drop policy if exists "Public update offers" on public.marketplace_offers;
drop policy if exists "Public read transactions" on public.marketplace_transactions;
drop policy if exists "Public write transactions" on public.marketplace_transactions;
drop policy if exists "Public read auctions" on public.marketplace_auctions;
drop policy if exists "Public write auctions" on public.marketplace_auctions;
drop policy if exists "Public update auctions" on public.marketplace_auctions;
drop policy if exists "Public read bids" on public.auction_bids;
drop policy if exists "Public write bids" on public.auction_bids;
drop policy if exists "Public read sync" on public.blockchain_sync_state;
drop policy if exists "Public upsert sync" on public.blockchain_sync_state;
drop policy if exists "Public update sync" on public.blockchain_sync_state;

-- Permissive policies (temporary). NOTE: tighten with auth later.
create policy "Public read collections" on public.nft_collections for select using (true);
create policy "Public write collections" on public.nft_collections for insert with check (true);
create policy "Public update collections" on public.nft_collections for update using (true);

create policy "Public read tokens" on public.nft_tokens for select using (true);
create policy "Public write tokens" on public.nft_tokens for insert with check (true);
create policy "Public update tokens" on public.nft_tokens for update using (true);

create policy "Public read likes" on public.nft_likes for select using (true);
create policy "Public write likes" on public.nft_likes for insert with check (true);
create policy "Public delete likes" on public.nft_likes for delete using (true);

create policy "Public read listings" on public.marketplace_listings for select using (true);
create policy "Public write listings" on public.marketplace_listings for insert with check (true);
create policy "Public update listings" on public.marketplace_listings for update using (true);

create policy "Public read offers" on public.marketplace_offers for select using (true);
create policy "Public write offers" on public.marketplace_offers for insert with check (true);
create policy "Public update offers" on public.marketplace_offers for update using (true);

create policy "Public read transactions" on public.marketplace_transactions for select using (true);
create policy "Public write transactions" on public.marketplace_transactions for insert with check (true);

create policy "Public read auctions" on public.marketplace_auctions for select using (true);
create policy "Public write auctions" on public.marketplace_auctions for insert with check (true);
create policy "Public update auctions" on public.marketplace_auctions for update using (true);

create policy "Public read bids" on public.auction_bids for select using (true);
create policy "Public write bids" on public.auction_bids for insert with check (true);

create policy "Public read sync" on public.blockchain_sync_state for select using (true);
create policy "Public upsert sync" on public.blockchain_sync_state for insert with check (true);
create policy "Public update sync" on public.blockchain_sync_state for update using (true);

-- Realtime configuration
alter table public.nft_tokens replica identity full;
alter table public.marketplace_listings replica identity full;
alter table public.marketplace_auctions replica identity full;
alter table public.marketplace_transactions replica identity full;