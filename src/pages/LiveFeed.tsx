import React, { useState, useEffect } from 'react';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { NFTMarketplace } from '@/components/NFTMarketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

interface LiveActivity {
  id: string;
  type: 'mint' | 'sale' | 'listing' | 'offer';
  nft_name: string;
  collection_name: string;
  user_address: string;
  price?: number;
  created_at: string;
}

export default function LiveFeed() {
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeListings: 0,
    totalUsers: 0
  });

  const fetchLiveActivities = async () => {
    try {
      // Fetch recent transactions and activities
      const { data: transactions } = await supabase
        .from('marketplace_transactions')
        .select(`
          id,
          transaction_type,
          price,
          from_address,
          to_address,
          created_at,
          nft_tokens (
            name,
            nft_collections (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: listings } = await supabase
        .from('marketplace_listings')
        .select(`
          id,
          price,
          seller_address,
          created_at,
          nft_tokens (
            name,
            nft_collections (name)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: LiveActivity[] = [];

      // Add transactions
      transactions?.forEach(tx => {
        activities.push({
          id: tx.id,
          type: tx.transaction_type === 'purchase' ? 'sale' : 'mint',
          nft_name: tx.nft_tokens?.name || 'Unknown NFT',
          collection_name: tx.nft_tokens?.nft_collections?.name || 'Unknown Collection',
          user_address: tx.to_address,
          price: tx.price,
          created_at: tx.created_at
        });
      });

      // Add listings
      listings?.forEach(listing => {
        activities.push({
          id: listing.id,
          type: 'listing',
          nft_name: listing.nft_tokens?.name || 'Unknown NFT',
          collection_name: listing.nft_tokens?.nft_collections?.name || 'Unknown Collection',
          user_address: listing.seller_address,
          price: listing.price,
          created_at: listing.created_at
        });
      });

      // Sort by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLiveActivities(activities.slice(0, 15));

    } catch (error) {
      console.error('Error fetching live activities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total volume from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: volumeData } = await supabase
        .from('marketplace_transactions')
        .select('price')
        .eq('transaction_type', 'purchase')
        .gte('created_at', yesterday.toISOString());

      const totalVolume = volumeData?.reduce((sum, tx) => sum + (tx.price || 0), 0) || 0;

      // Get active listings count
      const { count: activeListings } = await supabase
        .from('marketplace_listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get unique users count (approximation)
      const { data: uniqueUsers } = await supabase
        .from('nft_tokens')
        .select('owner_address');
      
      const totalUsers = new Set(uniqueUsers?.map(u => u.owner_address)).size;

      setStats({
        totalVolume,
        activeListings: activeListings || 0,
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLiveActivities();
    fetchStats();

    // Set up real-time updates
    const channel = supabase
      .channel('live-feed-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_transactions'
      }, () => {
        fetchLiveActivities();
        fetchStats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_listings'
      }, () => {
        fetchLiveActivities();
        fetchStats();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nft_tokens'
      }, () => {
        fetchLiveActivities();
        fetchStats();
      })
      .subscribe();

    const interval = setInterval(() => {
      fetchLiveActivities();
      fetchStats();
    }, 30000); // Refresh every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint': return <Zap className="w-4 h-4 text-green-500" />;
      case 'sale': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'listing': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'offer': return <Users className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity: LiveActivity) => {
    switch (activity.type) {
      case 'mint':
        return `minted "${activity.nft_name}"`;
      case 'sale':
        return `bought "${activity.nft_name}" for ${activity.price} ETH`;
      case 'listing':
        return `listed "${activity.nft_name}" for ${activity.price} ETH`;
      case 'offer':
        return `made an offer on "${activity.nft_name}"`;
      default:
        return `interacted with "${activity.nft_name}"`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Live Feed
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time marketplace activity and trending NFTs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.totalVolume.toFixed(2)} ETH
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.activeListings}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.totalUsers}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Activity
                  <Badge variant="secondary" className="ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {liveActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-subtle border border-border/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {activity.user_address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">
                          {activity.user_address.slice(0, 6)}...{activity.user_address.slice(-4)}
                        </span>{' '}
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        from {activity.collection_name}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Latest NFTs */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Latest NFTs</h2>
              <p className="text-muted-foreground">Recently minted and listed NFTs</p>
            </div>
            <NFTMarketplace showLiveFeed={true} limit={6} />
          </div>
        </div>
      </main>
    </div>
  );
}