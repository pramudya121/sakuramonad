import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Coins,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalVolume: number;
  totalSales: number;
  uniqueTraders: number;
  averagePrice: number;
  floorPrice: number;
  volumeChange: number;
  salesChange: number;
}

interface CollectionAnalytics {
  id: string;
  name: string;
  image_url: string;
  daily_volume: number;
  daily_sales: number;
  unique_buyers: number;
  unique_sellers: number;
  average_price: number;
  floor_price: number;
  volume_change: number;
}

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topCollections, setTopCollections] = useState<CollectionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch overall marketplace analytics
      const { data: transactions } = await supabase
        .from('marketplace_transactions')
        .select('*')
        .eq('status', 'confirmed')
        .gte('created_at', getTimeframeDate());

      // Fetch collection analytics
      const { data: collections } = await supabase
        .from('marketplace_analytics')
        .select(`
          *,
          nft_collections (
            name,
            image_url
          )
        `)
        .gte('date', getTimeframeDate().toISOString().split('T')[0])
        .order('daily_volume', { ascending: false })
        .limit(10);

      // Calculate analytics
      if (transactions) {
        const totalVolume = transactions.reduce((sum, tx) => sum + (tx.price || 0), 0);
        const totalSales = transactions.length;
        const uniqueTraders = new Set([
          ...transactions.map(tx => tx.from_address),
          ...transactions.map(tx => tx.to_address)
        ]).size;
        const averagePrice = totalVolume / totalSales || 0;

        setAnalyticsData({
          totalVolume,
          totalSales,
          uniqueTraders,
          averagePrice,
          floorPrice: 0, // Calculate from active listings
          volumeChange: Math.random() * 20 - 10, // Placeholder
          salesChange: Math.random() * 15 - 7.5 // Placeholder
        });
      }

      if (collections) {
        const formattedCollections = collections.map(item => ({
          id: item.collection_id || '',
          name: item.nft_collections?.name || 'Unknown',
          image_url: item.nft_collections?.image_url || '',
          daily_volume: item.daily_volume || 0,
          daily_sales: item.daily_sales || 0,
          unique_buyers: item.unique_buyers || 0,
          unique_sellers: item.unique_sellers || 0,
          average_price: item.average_price || 0,
          floor_price: item.floor_price || 0,
          volume_change: Math.random() * 30 - 15 // Placeholder
        }));
        setTopCollections(formattedCollections);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeDate = () => {
    const now = new Date();
    switch (timeframe) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  };

  const formatMON = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K MON`;
    }
    return `${value.toFixed(3)} MON`;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time marketplace insights and statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="24h">24H</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalyticsData}
              disabled={loading}
              className="border-primary/20 hover:border-primary/40"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData ? formatMON(analyticsData.totalVolume) : '0 MON'}
              </div>
              {analyticsData && (
                <div className="flex items-center mt-2">
                  {analyticsData.volumeChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    analyticsData.volumeChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(analyticsData.volumeChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.totalSales.toLocaleString() || '0'}
              </div>
              {analyticsData && (
                <div className="flex items-center mt-2">
                  {analyticsData.salesChange >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    analyticsData.salesChange >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {Math.abs(analyticsData.salesChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Unique Traders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData?.uniqueTraders.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Coins className="w-4 h-4 mr-2" />
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {analyticsData ? formatMON(analyticsData.averagePrice) : '0 MON'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Per NFT</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Collections */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Top Collections ({timeframe.toUpperCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : topCollections.length > 0 ? (
              <div className="space-y-4">
                {topCollections.map((collection, index) => (
                  <div
                    key={collection.id}
                    className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg border border-border/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold">
                        {index + 1}
                      </div>
                      <img
                        src={collection.image_url || '/placeholder.svg'}
                        alt={collection.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{collection.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {collection.daily_sales} sales • Floor: {formatMON(collection.floor_price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">
                        {formatMON(collection.daily_volume)}
                      </div>
                      <div className="flex items-center">
                        {collection.volume_change >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ml-1 ${
                          collection.volume_change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {Math.abs(collection.volume_change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No analytics data available yet</p>
                <p className="text-sm">Data will appear as transactions occur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}