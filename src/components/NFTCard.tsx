import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Eye, 
  Timer, 
  Zap, 
  Star,
  TrendingUp,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { toast } from 'sonner';

interface NFTCardProps {
  id: string;
  image: string;
  name: string;
  collection: string;
  price: string;
  currency: string;
  rarity?: string;
  likes?: number;
  views?: number;
  isAuction?: boolean;
  timeLeft?: string;
  lastSale?: string;
  isLiked?: boolean;
  onBuy?: (id: string) => void;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  id,
  image,
  name,
  collection,
  price,
  currency,
  rarity,
  likes = 0,
  views = 0,
  isAuction = false,
  timeLeft,
  lastSale,
  isLiked = false,
  onBuy,
  onLike,
  onView
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(id);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuy?.(id);
  };

  const handleView = () => {
    onView?.(id);
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'epic': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'rare': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'uncommon': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted/50 text-muted-foreground border-border/50';
    }
  };

  return (
    <Card
      className={`
        group cursor-pointer bg-gradient-card border-border/50 shadow-soft hover:shadow-elegant 
        transition-all duration-500 hover:scale-[1.02] hover:border-primary/30
        ${isHovered ? 'animate-float' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-lg aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform"
              onClick={handleLike}
            >
              <Heart 
                className={`w-4 h-4 transition-colors ${
                  liked ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                }`} 
              />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div className="flex gap-2">
              {rarity && (
                <Badge className={`text-xs ${getRarityColor(rarity)}`}>
                  <Star className="w-3 h-3 mr-1" />
                  {rarity}
                </Badge>
              )}
              {isAuction && (
                <Badge className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <Timer className="w-3 h-3 mr-1" />
                  Auction
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Collection and Stats */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground font-medium">
            {collection}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {likes}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {views}
            </div>
          </div>
        </div>

        {/* NFT Name */}
        <h3 className="font-semibold text-foreground mb-3 truncate group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price and Auction Info */}
        <div className="space-y-2">
          {isAuction && timeLeft ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Ends in
              </div>
              <div className="text-xs font-medium text-orange-500">
                {timeLeft}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                {isAuction ? 'Current Bid' : 'Price'}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-primary">
                  {price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>
            {lastSale && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground mb-1">
                  Last Sale
                </div>
                <div className="text-sm font-medium text-foreground">
                  {lastSale}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-smooth"
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Make offer feature coming soon!');
            }}
          >
            <Zap className="w-4 h-4 mr-1" />
            Offer
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-primary hover:shadow-glow transition-smooth group"
            onClick={handleBuy}
          >
            <ShoppingCart className="w-4 h-4 mr-1 group-hover:animate-float" />
            {isAuction ? 'Bid' : 'Buy'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};