import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { OffersManager } from '@/components/OffersManager';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { NFTCard } from '@/components/NFTCard';
import {
  Wallet,
  Tag,
  Home,
  Grid3X3,
  ShoppingBag,
  Activity,
  Copy,
  Check,
  Edit,
  Share2,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected, address } = useWalletConnection();
  const [copied, setCopied] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [listedNFTs, setListedNFTs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalListed: 0,
    totalSold: 0,
    totalEarned: 0,
    floorValue: 0
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchProfileData();
    }
  }, [isConnected, address]);

  const fetchProfileData = async () => {
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
            image_url
          )
        `)
        .eq('owner_address', address);

      // Fetch listed NFTs
      const { data: listed } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          nft_tokens (
            *,
            nft_collections (
              name,
              image_url
            )
          )
        `)
        .eq('seller_address', address)
        .eq('is_active', true);

      // Fetch transactions
      const { data: txs } = await supabase
        .from('marketplace_transactions')
        .select('*')
        .or(`from_address.eq.${address},to_address.eq.${address}`)
        .order('created_at', { ascending: false })
        .limit(20);

      setOwnedNFTs(owned || []);
      setListedNFTs(listed || []);
      setTransactions(txs || []);

      // Calculate stats
      const totalSold = txs?.filter(tx => tx.from_address === address && tx.status === 'confirmed').length || 0;
      const totalEarned = txs
        ?.filter(tx => tx.from_address === address && tx.status === 'confirmed')
        .reduce((sum, tx) => sum + (tx.price || 0), 0) || 0;
      const floorValue = 0; // Placeholder - can be calculated from marketplace data if needed

      setStats({
        totalNFTs: owned?.length || 0,
        totalListed: listed?.length || 0,
        totalSold,
        totalEarned,
        floorValue
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatMON = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K MON`;
    }
    return `${value.toFixed(3)} MON`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background relative">
        <SakuraBackground />
        <MarketplaceHeader />
        
        <main className="container mx-auto px-4 py-8 relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-6 border-border/50 hover:border-primary/50"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to view your profile
            </p>
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
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 border-border/50 hover:border-primary/50"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                  {address ? address.slice(2, 4).toUpperCase() : 'MB'}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    Verified
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
                    {formatAddress(address || '')}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center">
                <Grid3X3 className="w-3 h-3 mr-1" />
                Owned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{stats.totalNFTs}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Listed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{stats.totalListed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{stats.totalSold}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center">
                <BarChart3 className="w-3 h-3 mr-1" />
                Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-500">{formatMON(stats.totalEarned)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground flex items-center">
                <Wallet className="w-3 h-3 mr-1" />
                Floor Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{formatMON(stats.floorValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="owned" className="flex items-center">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Owned ({ownedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="listed" className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Listed ({listedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Activity ({transactions.length})
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
                    price={nft.nft_collections?.floor_price || '0'}
                    collection={nft.nft_collections?.name || 'Unknown'}
                    currency="MON"
                    rarity="Common"
                    likes={0}
                    lastSale={nft.nft_collections?.floor_price || '0'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No NFTs Owned</h3>
                <p className="text-muted-foreground">Start collecting NFTs from the marketplace</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="listed">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gradient-card border border-border/50 rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-3" />
                    <div className="h-5 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : listedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listedNFTs.map((listing) => (
                  <NFTCard 
                    key={listing.id}
                    id={listing.nft_tokens.id}
                    name={listing.nft_tokens.name}
                    image={listing.nft_tokens.image_url || '/placeholder.svg'}
                    price={listing.price}
                    collection={listing.nft_tokens.nft_collections?.name || 'Unknown'}
                    currency="MON"
                    rarity="Common"
                    likes={0}
                    lastSale={listing.price}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Listings</h3>
                <p className="text-muted-foreground">List your NFTs to start selling</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers">
            <OffersManager />
          </TabsContent>

          <TabsContent value="activity">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-gradient-card border border-border/50 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2 w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <Card key={tx.id} className="bg-gradient-card border-border/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                              {tx.transaction_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            {tx.from_address === address ? 'Sold to' : 'Bought from'}{' '}
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {formatAddress(tx.from_address === address ? tx.to_address : tx.from_address)}
                            </code>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{formatMON(tx.price || 0)}</div>
                          <Badge variant="outline" className={
                            tx.status === 'confirmed' ? 'border-green-500 text-green-500' : 
                            tx.status === 'failed' ? 'border-red-500 text-red-500' : ''
                          }>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground">Your transaction history will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
