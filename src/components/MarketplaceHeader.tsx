import React from 'react';
import { WalletConnect } from './WalletConnect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Gamepad2, 
  TrendingUp, 
  Palette, 
  Zap,
  Menu
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MarketplaceHeaderProps {
  onConnect?: (address: string) => void;
  onMenuToggle?: () => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({ 
  onConnect,
  onMenuToggle 
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onMenuToggle}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-sm">MB</span>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Monad Blossom
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  NFT Marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search NFTs, collections, creators..."
                className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 transition-smooth"
              />
            </div>
          </div>

          {/* Navigation and Wallet */}
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Analytics
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
              >
                <Palette className="w-4 h-4 mr-1" />
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
              >
                <Gamepad2 className="w-4 h-4 mr-1" />
                Games
              </Button>
            </div>

            {/* Wallet Connection */}
            <WalletConnect onConnect={onConnect} />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search NFTs, collections..."
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="border-t border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
                <span className="text-muted-foreground">Monad Testnet</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Floor: 0.05 MON</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">24h Vol: 150 MON</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              Live NFTs: <span className="text-primary font-medium">1,234</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};