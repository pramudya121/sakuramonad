import React, { useState } from 'react';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { NFTMarketplace } from '@/components/NFTMarketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Crown, Award, Star, Flame } from 'lucide-react';

const trendingCollections = [
  {
    rank: 1,
    name: "Cosmic Dreamscapes",
    floor: "4.2",
    volume: "847.3",
    change: "+45.7%",
    changeType: "up" as const,
    items: "10,000"
  },
  {
    rank: 2,
    name: "Digital Beings",
    floor: "2.8",
    volume: "632.1", 
    change: "+32.4%",
    changeType: "up" as const,
    items: "5,555"
  },
  {
    rank: 3,
    name: "Abstract Worlds",
    floor: "3.9",
    volume: "598.7",
    change: "+28.9%",
    changeType: "up" as const,
    items: "8,888"
  },
  {
    rank: 4,
    name: "Pixel Legends", 
    floor: "1.5",
    volume: "445.2",
    change: "+18.3%",
    changeType: "up" as const,
    items: "7,777"
  },
  {
    rank: 5,
    name: "Neon Knights",
    floor: "2.1",
    volume: "387.9",
    change: "-5.2%",
    changeType: "down" as const,
    items: "4,444"
  }
];

export default function Trending() {
  const [timeframe, setTimeframe] = useState('24h');

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Award className="w-5 h-5 text-gray-400" />;
      case 3: return <Star className="w-5 h-5 text-amber-600" />;
      default: return <Flame className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Trending Collections
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the hottest NFT collections based on sales volume, floor price changes, and community activity
          </p>
        </div>

        {/* Time Frame Tabs */}
        <div className="flex justify-center mb-8">
          <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
            <TabsList className="bg-gradient-card border border-border/50">
              <TabsTrigger value="24h" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                24 Hours
              </TabsTrigger>
              <TabsTrigger value="7d" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                7 Days
              </TabsTrigger>
              <TabsTrigger value="30d" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                30 Days
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Collections Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/50 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Collections ({timeframe})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trendingCollections.map((collection) => (
                  <div 
                    key={collection.rank}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-subtle border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 h-8">
                      {collection.rank <= 3 ? (
                        getRankIcon(collection.rank)
                      ) : (
                        <span className="font-bold text-muted-foreground">#{collection.rank}</span>
                      )}
                    </div>

                    {/* Collection Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {collection.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {collection.items} items
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {collection.floor} ETH
                      </div>
                      <div className={`text-xs flex items-center ${
                        collection.changeType === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {collection.changeType === 'up' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {collection.change}
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4">
                  View Full Rankings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trending NFTs Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Trending NFTs</h2>
              <p className="text-muted-foreground">
                Individual NFTs with the highest activity and engagement
              </p>
            </div>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="bg-gradient-card border border-border/50 mb-6">
                <TabsTrigger value="sales" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                  Top Sales
                </TabsTrigger>
                <TabsTrigger value="liked" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                  Most Liked
                </TabsTrigger>
                <TabsTrigger value="viewed" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
                  Most Viewed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sales" className="space-y-6">
                <NFTMarketplace showTrending={true} limit={6} />
              </TabsContent>

              <TabsContent value="liked" className="space-y-6">
                <NFTMarketplace showTrending={true} limit={6} />
              </TabsContent>

              <TabsContent value="viewed" className="space-y-6">
                <NFTMarketplace showTrending={true} limit={6} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Featured Trending Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 bg-gradient-primary/10 text-primary">
              <Flame className="w-4 h-4 mr-1" />
              Hot Right Now
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Breakout Collections</h2>
            <p className="text-muted-foreground text-lg">
              Rising stars and collections gaining momentum
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Future Punks", growth: "+156%", volume: "45.2 ETH", floor: "0.8 ETH" },
              { name: "Meta Worlds", growth: "+98%", volume: "78.9 ETH", floor: "1.2 ETH" },
              { name: "Cyber Cats", growth: "+87%", volume: "34.7 ETH", floor: "0.6 ETH" }
            ].map((collection, i) => (
              <Card key={i} className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{collection.name}</span>
                    <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                      {collection.growth}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Volume (24h)</div>
                      <div className="font-bold text-primary">{collection.volume}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Floor Price</div>
                      <div className="font-bold text-primary">{collection.floor}</div>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-primary hover:shadow-glow">
                    Explore Collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}