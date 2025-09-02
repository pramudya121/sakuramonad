import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { Wallet, ChevronDown } from 'lucide-react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const { isConnected, address, isConnecting, connectWallet: connect, disconnect: disconnectWallet } = useWalletConnection();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'okx') => {
    try {
      const connectedAddress = await connect(walletType);
      if (connectedAddress) {
        setIsDialogOpen(false);
        onConnect?.(connectedAddress);
        toast.success(`${walletType} wallet connected successfully!`, {
          description: `Address: ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`
        });
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(`Failed to connect ${walletType}`, {
        description: error.message || 'Please try again'
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Card className="bg-gradient-card border-border/50 shadow-soft">
          <CardContent className="px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
              <span className="text-sm font-medium text-foreground">
                {formatAddress(address)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="border-primary/20 hover:border-primary/40 transition-smooth"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:shadow-glow transition-smooth group">
          <Wallet className="w-4 h-4 mr-2 group-hover:animate-float" />
          Connect Wallet
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your preferred wallet to connect to Monad Blossom Market
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="flex items-center justify-center gap-3 h-12 bg-gradient-card hover:bg-gradient-primary hover:text-primary-foreground border border-border/50 hover:border-primary/50 transition-smooth group"
            variant="outline"
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-medium">MetaMask</span>
            {isConnecting && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
          </Button>
          
          <Button
            onClick={() => handleConnect('okx')}
            disabled={isConnecting}
            className="flex items-center justify-center gap-3 h-12 bg-gradient-card hover:bg-gradient-primary hover:text-primary-foreground border border-border/50 hover:border-primary/50 transition-smooth group"
            variant="outline"
          >
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">OKX</span>
            </div>
            <span className="font-medium">OKX Wallet</span>
            {isConnecting && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
};