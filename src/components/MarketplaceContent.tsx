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
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceContentProps {
  activeSection: string;
  connectedAddress?: string;
}

// Mock NFT data - replace with real data from contract
const mockNFTs = [
  {
    id: '1',
    image: 'https://via.placeholder.com/400x400/ff69b4/fff?text=Sakura+1',
    name: 'Sakura Spirit #001',
    collection: 'Sakura Spirits',
    price: '0.15',
    currency: 'MON',
    rarity: 'Legendary',
    likes: 24,
    views: 156,
    lastSale: '0.12 MON',
    isLiked: false
  },
  {
    id: '2',
    image: 'https://via.placeholder.com/400x400/87ceeb/fff?text=Winter+2',
    name: 'Winter Bloom #047',
    collection: 'Winter Collection',
    price: '0.08',
    currency: 'MON',
    rarity: 'Epic',
    likes: 18,
    views: 98,
    isAuction: true,
    timeLeft: '2h 15m',
    isLiked: false
  },
  {
    id: '3',
    image: 'https://via.placeholder.com/400x400/dda0dd/fff?text=Petal+3',
    name: 'Falling Petal #123',
    collection: 'Sakura Spirits',
    price: '0.25',
    currency: 'MON',
    rarity: 'Rare',
    likes: 31,
    views: 201,
    lastSale: '0.20 MON',
    isLiked: true
  },
  {
    id: '4',
    image: 'https://via.placeholder.com/400x400/ffc0cb/fff?text=Blossom+4',
    name: 'Cherry Blossom Dreams',
    collection: 'Dream Series',
    price: '0.12',
    currency: 'MON',
    rarity: 'Uncommon',
    likes: 12,
    views: 76,
    isAuction: true,
    timeLeft: '1d 3h',
    isLiked: false
  },
  {
    id: '5',
    image: 'https://via.placeholder.com/400x400/e6e6fa/fff?text=Snow+5',
    name: 'Snow Garden #056',
    collection: 'Winter Collection',
    price: '0.18',
    currency: 'MON',
    rarity: 'Epic',
    likes: 27,
    views: 143,
    isLiked: false
  },
  {
    id: '6',
    image: 'https://via.placeholder.com/400x400/ffb6c1/fff?text=Spirit+6',
    name: 'Ethereal Spirit #789',
    collection: 'Sakura Spirits',
    price: '0.35',
    currency: 'MON',
    rarity: 'Legendary',
    likes: 45,
    views: 289,
    lastSale: '0.28 MON',
    isLiked: true
  }
];

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
  const [nfts, setNfts] = useState(mockNFTs);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const currentSection = sectionContent[activeSection as keyof typeof sectionContent] || sectionContent.marketplace;
  const SectionIcon = currentSection.icon;

  const handleBuyNFT = async (nftId: string) => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    const nft = nfts.find(n => n.id === nftId);
    if (!nft) return;

    toast.loading('Processing purchase...', { id: 'buy-nft' });
    
    try {
      // Simulate transaction - replace with actual contract call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully purchased ${nft.name}!`, { 
        id: 'buy-nft',
        description: `You paid ${nft.price} ${nft.currency}`
      });
    } catch (error) {
      toast.error('Purchase failed', { 
        id: 'buy-nft',
        description: 'Please try again'
      });
    }
  };

  const handleLikeNFT = (nftId: string) => {
    setNfts(prev => prev.map(nft => 
      nft.id === nftId 
        ? { ...nft, likes: nft.likes + (nft.isLiked ? -1 : 1), isLiked: !nft.isLiked }
        : nft
    ));
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
        return parseInt(b.id) - parseInt(a.id);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
          <SectionIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{currentSection.title}</h1>
          <p className="text-muted-foreground">{currentSection.subtitle}</p>
        </div>
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
                <div className="text-2xl font-bold text-foreground">1,234</div>
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
                <div className="text-2xl font-bold text-foreground">0.15</div>
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
                <div className="text-2xl font-bold text-foreground">150</div>
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
                <div className="text-2xl font-bold text-foreground">45</div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedNFTs.map((nft) => (
          <NFTCard
            key={nft.id}
            {...nft}
            onBuy={handleBuyNFT}
            onLike={handleLikeNFT}
            onView={handleViewNFT}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          size="lg"
          className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-smooth"
        >
          <Grid3X3 className="w-4 h-4 mr-2" />
          Load More NFTs
        </Button>
      </div>
    </div>
  );
};