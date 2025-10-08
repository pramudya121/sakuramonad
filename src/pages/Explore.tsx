import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { NFTMarketplace } from '@/components/NFTMarketplace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Clock, Heart, Home } from 'lucide-react';

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

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

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Explore NFTs
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover unique digital assets from creators around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gradient-card border border-border/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search NFTs, collections, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="most-liked">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Most Liked
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All NFTs</SelectItem>
                <SelectItem value="for-sale">For Sale</SelectItem>
                <SelectItem value="auction">On Auction</SelectItem>
                <SelectItem value="new">New Listings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              Art
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              Gaming
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              Music
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              Photography
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              Virtual Worlds
            </Badge>
          </div>
        </div>

        {/* NFT Grid */}
        <NFTMarketplace />
      </main>
    </div>
  );
}