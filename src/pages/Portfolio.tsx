import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { NFTCard } from '@/components/NFTCard';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Grid3X3,
  List,
  Filter
} from 'lucide-react';

export default function Portfolio() {
  const { isConnected, address } = useWalletConnection();
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalItems: 0,
    totalReturn: 0,
    returnPercentage: 0
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData();
    }
  }, [isConnected, address]);

  const fetchPortfolioData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // Fetch owned NFTs
      const { data: owned } = await supabase
        .from('nft_tokens')
        .select(`
          *,
          nft_collections (
            name,
            image_url,
            floor_price
          ),
          marketplace_listings (
            price,
            is_active
          )
        `)
        .eq('owner_address', address);

      // Fetch watchlist
      const { data: watchlistData } = await supabase
        .from('user_watchlists')
        .select(`
          *,
          nft_tokens (
            *,
            nft_collections (
              name,
              image_url,
              floor_price
            ),
            marketplace_listings (
              price,
              is_active
            )
          )
        `)
        .eq('user_address', address);

      setOwnedNFTs(owned || []);
      setWatchlist(watchlistData?.map(item => item.nft_tokens) || []);

      // Calculate portfolio stats
      const totalValue = (owned || []).reduce((sum, nft) => {
        return sum + (nft.nft_collections?.floor_price || 0);
      }, 0);

      setPortfolioStats({
        totalValue,
        totalItems: owned?.length || 0,
        totalReturn: Math.random() * 1000 - 500, // Placeholder
        returnPercentage: Math.random() * 40 - 20 // Placeholder
      });

    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMON = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K MON`;
    }
    return `${value.toFixed(3)} MON`;
  };

  const addToWatchlist = async (tokenId: string) => {
    if (!address) return;

    try {
      await supabase.from('user_watchlists').insert({
        user_address: address,
        token_id: tokenId
      });
      
      fetchPortfolioData(); // Refresh data
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (tokenId: string) => {
    if (!address) return;

    try {
      await supabase
        .from('user_watchlists')
        .delete()
        .eq('user_address', address)
        .eq('token_id', tokenId);
      
      fetchPortfolioData(); // Refresh data
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background relative">
        <SakuraBackground />
        <MarketplaceHeader />
        
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your NFT portfolio and watchlist
            </p>
            <Button className="bg-gradient-primary hover:shadow-glow">
              Connect Wallet
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            My Portfolio
          </h1>
          <p className="text-muted-foreground">
            Track your NFT investments and watchlist
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatMON(portfolioStats.totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {portfolioStats.totalItems}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Total Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                portfolioStats.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {portfolioStats.totalReturn >= 0 ? '+' : ''}{formatMON(portfolioStats.totalReturn)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                {portfolioStats.returnPercentage >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-2" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-2" />
                )}
                Return %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                portfolioStats.returnPercentage >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {portfolioStats.returnPercentage >= 0 ? '+' : ''}{portfolioStats.returnPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="owned" className="flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Owned ({ownedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gradient-card border border-border/50 rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-3" />
                    <div className="h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {ownedNFTs.map((nft) => (
                   <NFTCard 
                     key={nft.id}
                     id={nft.id}
                     name={nft.name}
                     image={nft.image_url || '/placeholder.svg'}
                     price={nft.marketplace_listings?.[0]?.price || nft.nft_collections?.floor_price || '0'}
                     collection={nft.nft_collections?.name || 'Unknown'}
                     currency="MON"
                     rarity={nft.rarity_rank ? `#${nft.rarity_rank}` : 'Common'}
                     likes={Math.floor(Math.random() * 100)}
                     lastSale={nft.nft_collections?.floor_price || '0'}
                   />
                 ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No NFTs Owned</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your collection by browsing the marketplace
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="watchlist">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gradient-card border border-border/50 rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-3" />
                    <div className="h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : watchlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchlist.map((nft) => (
                  <div key={nft.id} className="relative">
                     <NFTCard 
                       id={nft.id}
                       name={nft.name}
                       image={nft.image_url || '/placeholder.svg'}
                       price={nft.marketplace_listings?.[0]?.price || nft.nft_collections?.floor_price || '0'}
                       collection={nft.nft_collections?.name || 'Unknown'}
                       currency="MON"
                       rarity={nft.rarity_rank ? `#${nft.rarity_rank}` : 'Common'}
                       likes={Math.floor(Math.random() * 100)}
                       lastSale={nft.nft_collections?.floor_price || '0'}
                     />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                      onClick={() => removeFromWatchlist(nft.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Items in Watchlist</h3>
                <p className="text-muted-foreground mb-6">
                  Add NFTs to your watchlist to track their prices and activity
                </p>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}