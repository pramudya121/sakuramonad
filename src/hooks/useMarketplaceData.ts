import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NFTItem {
  id: string;
  tokenId: string;
  name: string;
  image: string;
  collection: string;
  price: string;
  currency: string;
  rarity?: string;
  likes: number;
  views: number;
  lastSale?: string;
  isLiked: boolean;
  isAuction: boolean;
  timeLeft?: string;
  owner: string;
  contractAddress: string;
  isERC1155: boolean;
  listingId?: number;
  auctionId?: number;
}

export interface MarketplaceStats {
  totalNFTs: number;
  floorPrice: number;
  volume24h: number;
  liveAuctions: number;
}

export function useMarketplaceData(section: string = 'all') {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalNFTs: 0,
    floorPrice: 0,
    volume24h: 0,
    liveAuctions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch NFTs from database
  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('nft_tokens')
        .select(`
          id,
          token_id,
          name,
          image_url,
          owner_address,
          nft_collections (
            name,
            contract_address,
            contract_type
          ),
          marketplace_listings (
            listing_id,
            price,
            is_active,
            listing_type
          ),
          marketplace_auctions (
            auction_id,
            reserve_price,
            highest_bid,
            end_time,
            is_settled
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter based on section
      if (section === 'auction') {
        query = query.not('marketplace_auctions', 'is', null);
      } else if (section === 'buy-now') {
        query = query.not('marketplace_listings', 'is', null);
      }

      const { data: nftData, error: nftError } = await query;

      if (nftError) throw nftError;

      // Transform data to NFTItem format
      const transformedNFTs: NFTItem[] = (nftData || []).map(nft => {
        const collection = nft.nft_collections as any;
        const listing = (nft.marketplace_listings as any)?.[0];
        const auction = (nft.marketplace_auctions as any)?.[0];
        
        const isAuction = auction && !auction.is_settled && new Date(auction.end_time) > new Date();
        
        return {
          id: nft.id,
          tokenId: nft.token_id,
          name: nft.name,
          image: nft.image_url || '/placeholder.svg',
          collection: collection?.name || 'Unknown Collection',
          price: isAuction ? auction.reserve_price || '0' : listing?.price || '0',
          currency: 'MON',
          rarity: 'Common', // TODO: Calculate from attributes
          likes: Math.floor(Math.random() * 50), // TODO: Implement likes system
          views: Math.floor(Math.random() * 200), // TODO: Implement views tracking
          isLiked: false, // TODO: Check user's likes
          isAuction,
          timeLeft: isAuction ? calculateTimeLeft(auction.end_time) : undefined,
          owner: nft.owner_address,
          contractAddress: collection?.contract_address || '',
          isERC1155: collection?.contract_type === 'ERC1155',
          listingId: listing?.listing_id,
          auctionId: auction?.auction_id
        };
      });

      setNfts(transformedNFTs);

    } catch (err: any) {
      console.error('Error fetching NFTs:', err);
      setError(err.message);
      toast.error('Failed to load NFTs', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch marketplace statistics
  const fetchStats = async () => {
    try {
      // Get total NFTs count
      const { count: totalNFTs } = await supabase
        .from('nft_tokens')
        .select('*', { count: 'exact', head: true });

      // Get floor price
      const { data: floorPriceData } = await supabase
        .from('marketplace_listings')
        .select('price')
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(1)
        .single();

      // Get 24h volume
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: volumeData } = await supabase
        .from('marketplace_transactions')
        .select('price')
        .gte('created_at', yesterday.toISOString())
        .eq('transaction_type', 'purchase');

      const volume24h = volumeData?.reduce((sum, tx) => sum + (parseFloat(tx.price?.toString() || '0')), 0) || 0;

      // Get live auctions count
      const { count: liveAuctions } = await supabase
        .from('marketplace_auctions')
        .select('*', { count: 'exact', head: true })
        .eq('is_settled', false)
        .gt('end_time', new Date().toISOString());

      setStats({
        totalNFTs: totalNFTs || 0,
        floorPrice: parseFloat(floorPriceData?.price?.toString() || '0'),
        volume24h,
        liveAuctions: liveAuctions || 0
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Calculate time left for auctions
  const calculateTimeLeft = (endTime: string): string => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Refresh data
  const refresh = () => {
    fetchNFTs();
    fetchStats();
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchNFTs();
    fetchStats();

    // Subscribe to real-time updates
    const nftSubscription = supabase
      .channel('nft_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'nft_tokens' },
        () => fetchNFTs()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_listings' },
        () => fetchNFTs()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_auctions' },
        () => fetchNFTs()
      )
      .subscribe();

    const statsSubscription = supabase
      .channel('stats_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_transactions' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      nftSubscription.unsubscribe();
      statsSubscription.unsubscribe();
    };
  }, [section]);

  return {
    nfts,
    stats,
    loading,
    error,
    refresh
  };
}