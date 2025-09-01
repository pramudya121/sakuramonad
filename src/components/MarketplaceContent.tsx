import React, { useState, useEffect } from 'react';
import { NFTCard } from './NFTCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Filter,
  SortDesc,
  Grid3X3,
  Sparkles,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useMarketplaceData } from '@/hooks/useMarketplaceData';
import { transactionService } from '@/lib/transactionService';

interface MarketplaceContentProps {
  activeSection: string;
  connectedAddress?: string;
}

// Remove mock NFT data as we're now using real blockchain data

const sectionContent = {
  marketplace: {
    title: 'NFT Marketplace',
    subtitle: 'Discover, collect, and trade unique NFTs on Monad',
    icon: TrendingUp
  },
  launchpad: {
    title: 'NFT Launchpad',
    subtitle: 'Launch your collection and mint new NFTs',
    icon: Sparkles
  },
  bidding: {
    title: 'Live Auctions',
    subtitle: 'Place bids on exclusive NFT auctions',
    icon: Clock
  },
  games: {
    title: 'Gaming Portal',
    subtitle: 'Explore Web3 games and gaming NFTs',
    icon: Zap
  }
};

export const MarketplaceContent: React.FC<MarketplaceContentProps> = ({
  activeSection,
  connectedAddress
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  
  // Use real marketplace data instead of mock data
  const { nfts, stats, loading, error, refresh } = useMarketplaceData(
    activeSection === 'bidding' ? 'auction' : 
    activeSection === 'marketplace' ? filter : 
    'all'
  );

  const currentSection = sectionContent[activeSection as keyof typeof sectionContent] || sectionContent.marketplace;
  const SectionIcon = currentSection.icon;

  const handleBuyNFT = async (nftId: string) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const nft = nfts.find(n => n.id === nftId);
    if (!nft || !nft.listingId) {
      toast.error('NFT not available for purchase');
      return;
    }

    // Use real transaction service for onchain purchase
    const result = await transactionService.buyNFT(nft.listingId, nft.price);
    
    if (result.status === 'success') {
      // Refresh data after successful purchase
      refresh();
    }
  };

  const handleLikeNFT = (nftId: string) => {
    // TODO: Implement likes system with Supabase
    toast.info('Likes system coming soon!');
  };

  const handleViewNFT = (nftId: string) => {
    const nft = nfts.find(n => n.id === nftId);
    if (nft) {
      toast.info(`Viewing ${nft.name}`, {
        description: 'Full NFT details coming soon!'
      });
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'all') return true;
    if (filter === 'auction') return nft.isAuction;
    if (filter === 'buy-now') return !nft.isAuction;
    return true;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'recent':
        return parseInt(b.tokenId) - parseInt(a.tokenId);
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  if (activeSection === 'launchpad') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <SectionIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentSection.title}</h1>
            <p className="text-muted-foreground">{currentSection.subtitle}</p>
          </div>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">NFT Launchpad Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              Create and launch your own NFT collections with our powerful minting tools.
            </p>
            <Button className="bg-gradient-primary hover:shadow-glow transition-smooth">
              <Star className="w-4 h-4 mr-2" />
              Get Notified
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <SectionIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentSection.title}</h1>
            <p className="text-muted-foreground">{currentSection.subtitle}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-smooth"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.totalNFTs.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total NFTs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.floorPrice.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Floor Price (MON)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.volume24h.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">24h Volume (MON)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.liveAuctions}</div>
                <div className="text-xs text-muted-foreground">Live Auctions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter:</span>
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'buy-now', label: 'Buy Now' },
                  { key: 'auction', label: 'Auction' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.key}
                    size="sm"
                    variant={filter === filterOption.key ? "secondary" : "ghost"}
                    className={filter === filterOption.key ? 'bg-primary/10 text-primary border border-primary/20' : ''}
                    onClick={() => setFilter(filterOption.key)}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SortDesc className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Sort:</span>
              <div className="flex gap-2">
                {[
                  { key: 'trending', label: 'Trending' },
                  { key: 'price-low', label: 'Price ↑' },
                  { key: 'price-high', label: 'Price ↓' },
                  { key: 'recent', label: 'Recent' }
                ].map((sortOption) => (
                  <Button
                    key={sortOption.key}
                    size="sm"
                    variant={sortBy === sortOption.key ? "secondary" : "ghost"}
                    className={sortBy === sortOption.key ? 'bg-primary/10 text-primary border border-primary/20' : ''}
                    onClick={() => setSortBy(sortOption.key)}
                  >
                    {sortOption.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-gradient-card border-border/50 animate-pulse">
              <div className="aspect-square bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Failed to load NFTs: {error}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : sortedNFTs.length === 0 ? (
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No NFTs found matching your criteria</p>
            <Button onClick={() => setFilter('all')} variant="outline">
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              id={nft.id}
              image={nft.image}
              name={nft.name}
              collection={nft.collection}
              price={nft.price}
              currency={nft.currency}
              rarity={nft.rarity}
              likes={nft.likes}
              views={nft.views}
              lastSale={nft.lastSale}
              isLiked={nft.isLiked}
              isAuction={nft.isAuction}
              timeLeft={nft.timeLeft}
              onBuy={handleBuyNFT}
              onLike={handleLikeNFT}
              onView={handleViewNFT}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {sortedNFTs.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={refresh}
            className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-smooth"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
};