import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import {
  Gamepad2,
  Search,
  Filter,
  Star,
  Users,
  Calendar,
  ExternalLink,
  Play,
  Trophy,
  Coins,
  Sparkles
} from 'lucide-react';

interface GameData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  banner_url: string;
  category: string;
  status: string; // 'live', 'coming_soon', 'beta'
  player_count: number;
  token_reward: string;
  launch_date: string;
  developer: string;
  website_url?: string;
  social_links: {
    discord?: string;
    twitter?: string;
    telegram?: string;
  };
}

export default function Games() {
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'rpg', name: 'RPG' },
    { id: 'strategy', name: 'Strategy' },
    { id: 'trading', name: 'Trading Cards' },
    { id: 'racing', name: 'Racing' },
    { id: 'shooter', name: 'Shooter' },
    { id: 'puzzle', name: 'Puzzle' }
  ];

  // Sample game data - in real implementation, this would come from Supabase
  const sampleGames: GameData[] = [
    {
      id: '1',
      name: 'Monad Legends',
      description: 'Epic fantasy RPG with NFT heroes and rare equipment. Battle monsters, collect treasures, and build your legend.',
      image_url: '/placeholder.svg',
      banner_url: '/placeholder.svg',
      category: 'rpg',
      status: 'live',
      player_count: 15420,
      token_reward: 'MON',
      launch_date: '2024-01-15',
      developer: 'Sakura Studios',
      website_url: 'https://monadlegends.com',
      social_links: {
        discord: 'https://discord.gg/monadlegends',
        twitter: 'https://twitter.com/monadlegends'
      }
    },
    {
      id: '2',
      name: 'Crypto Racers',
      description: 'High-speed racing with customizable NFT cars. Compete in tournaments and earn MON tokens.',
      image_url: '/placeholder.svg',
      banner_url: '/placeholder.svg',
      category: 'racing',
      status: 'live',
      player_count: 8932,
      token_reward: 'MON',
      launch_date: '2024-02-01',
      developer: 'Speed Labs',
      website_url: 'https://cryptoracers.game',
      social_links: {
        discord: 'https://discord.gg/cryptoracers',
        twitter: 'https://twitter.com/cryptoracers'
      }
    },
    {
      id: '3',
      name: 'Battle Realm',
      description: 'Strategic warfare game with collectible NFT armies. Build your empire and conquer the realm.',
      image_url: '/placeholder.svg',
      banner_url: '/placeholder.svg',
      category: 'strategy',
      status: 'beta',
      player_count: 3245,
      token_reward: 'MON',
      launch_date: '2024-03-15',
      developer: 'War Games Inc',
      social_links: {
        discord: 'https://discord.gg/battlerealm'
      }
    },
    {
      id: '4',
      name: 'Sakura Spirits',
      description: 'Mystical adventure game set in ancient Japan. Collect spirit NFTs and unlock magical powers.',
      image_url: '/placeholder.svg',
      banner_url: '/placeholder.svg',
      category: 'rpg',
      status: 'coming_soon',
      player_count: 0,
      token_reward: 'MON',
      launch_date: '2024-04-20',
      developer: 'Blossom Games',
      social_links: {
        discord: 'https://discord.gg/sakuraspirits',
        twitter: 'https://twitter.com/sakuraspirits'
      }
    }
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      // In a real implementation, fetch from Supabase
      // For now, use sample data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setGames(sampleGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Live</Badge>;
      case 'beta':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Beta</Badge>;
      case 'coming_soon':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Web3 Gaming Portal
          </h1>
          <p className="text-muted-foreground">
            Discover and play blockchain games on Monad network
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-gradient-primary" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Game */}
        {filteredGames.length > 0 && (
          <Card className="mb-8 bg-gradient-card border-border/50 overflow-hidden">
            <div className="relative h-64 bg-gradient-primary/20">
              <img
                src={filteredGames[0].banner_url}
                alt={filteredGames[0].name}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
                  <span className="text-sm font-medium text-primary">Featured Game</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{filteredGames[0].name}</h2>
                <p className="text-muted-foreground mb-4 max-w-md">{filteredGames[0].description}</p>
                <div className="flex items-center gap-4">
                  {getStatusBadge(filteredGames[0].status)}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {filteredGames[0].player_count.toLocaleString()} players
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Coins className="w-4 h-4 mr-1" />
                    Earn {filteredGames[0].token_reward}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50 animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16" />
                    <div className="h-6 bg-muted rounded w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game.id} className="bg-gradient-card border-border/50 hover:shadow-soft transition-smooth group">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(game.status)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-primary hover:shadow-glow"
                        disabled={game.status === 'coming_soon'}
                      >
                        {game.status === 'coming_soon' ? (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {game.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Developer</span>
                      <span className="text-foreground font-medium">{game.developer}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Players</span>
                      <span className="text-foreground font-medium">
                        {game.player_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rewards</span>
                      <div className="flex items-center">
                        <Coins className="w-3 h-3 mr-1 text-primary" />
                        <span className="text-primary font-medium">{game.token_reward}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex gap-2">
                      {game.social_links.discord && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={game.social_links.discord} target="_blank" rel="noopener noreferrer">
                            <Users className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {game.social_links.twitter && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={game.social_links.twitter} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    {game.website_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={game.website_url} target="_blank" rel="noopener noreferrer">
                          Learn More
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No games found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Games will appear here as they become available'
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}