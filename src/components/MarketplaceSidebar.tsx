import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Rocket,
  Gavel,
  Zap,
  BarChart3,
  Star,
  Wallet,
  Eye,
  Gamepad2,
  Coins,
  Bitcoin,
  Palette,
  Users,
  Sparkles,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';

interface MarketplaceSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose?: () => void;
}

const sidebarSections = [
  {
    title: 'Marketplace & Trading',
    items: [
      { id: 'marketplace', label: 'Buy & Sell', icon: Store, badge: 'Hot' },
      { id: 'launchpad', label: 'Launchpad', icon: Rocket, badge: 'New' },
      { id: 'bidding', label: 'Bidding', icon: Gavel },
      { id: 'sweep', label: 'Sweep Tool', icon: Zap },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'NFT Management',
    items: [
      { id: 'rarity', label: 'Rarity Tools', icon: Star },
      { id: 'portfolio', label: 'Portfolio', icon: Wallet },
      { id: 'watchlist', label: 'Watchlist', icon: Eye },
    ]
  },
  {
    title: 'Web3 Gaming',
    items: [
      { id: 'games', label: 'Game Portal', icon: Gamepad2, badge: 'Gaming' },
      { id: 'game-launchpad', label: 'Game Launch', icon: Sparkles },
      { id: 'items', label: 'Game Items', icon: Coins },
    ]
  },
  {
    title: 'Ordinals & Bitcoin',
    items: [
      { id: 'ordinals', label: 'Bitcoin NFTs', icon: Bitcoin, badge: 'BTC' },
      { id: 'brc20', label: 'BRC-20 Tokens', icon: Coins },
    ]
  },
  {
    title: 'Creator Tools',
    items: [
      { id: 'create', label: 'Mint NFTs', icon: Palette },
      { id: 'royalties', label: 'Royalties', icon: Users },
      { id: 'community', label: 'Community', icon: Users },
    ]
  }
];

export const MarketplaceSidebar: React.FC<MarketplaceSidebarProps> = ({
  activeSection,
  onSectionChange,
  isOpen,
  onClose
}) => {
  const sidebarClass = `
    fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card/80 backdrop-blur-md border-r border-border/50 z-40 transform transition-transform duration-300 overflow-y-auto
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass}>
        <div className="p-4 space-y-6">
          {/* View Toggle */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">View</span>
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 border-primary/20"
                >
                  <Grid3X3 className="w-3 h-3 mr-1" />
                  Grid
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 h-8"
                >
                  <List className="w-3 h-3 mr-1" />
                  List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Sections */}
          {sidebarSections.map((section, index) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={`
                        w-full justify-start h-9 transition-smooth group
                        ${isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-soft' 
                          : 'hover:bg-primary/5 hover:text-primary'
                        }
                      `}
                      onClick={() => {
                        onSectionChange(item.id);
                        onClose?.();
                      }}
                    >
                      <Icon className={`w-4 h-4 mr-3 transition-smooth ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                      }`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ml-2 ${
                            item.badge === 'Hot' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            item.badge === 'New' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            item.badge === 'Gaming' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            item.badge === 'BTC' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
              {index < sidebarSections.length - 1 && (
                <Separator className="my-4 bg-border/30" />
              )}
            </div>
          ))}

          {/* Featured Collection */}
          <Card className="bg-gradient-card border-border/50 shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-primary animate-pulse-glow" />
                <span className="text-sm font-semibold text-foreground">Featured</span>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Collection of the Day</div>
                <div className="text-sm font-medium text-foreground">Sakura Spirits</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Floor</span>
                  <span className="text-primary font-medium">0.15 MON</span>
                </div>
                <Button
                  size="sm"
                  className="w-full h-7 bg-gradient-primary hover:shadow-glow transition-smooth"
                >
                  View Collection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </>
  );
};