import { useEffect, useState } from 'react';
import { blockchainSync } from '@/lib/blockchainSync';
import { transactionService } from '@/lib/transactionService';

export function useBlockchainSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (transactionService.isWalletConnected()) {
        const address = await transactionService.getWalletAddress();
        setWalletAddress(address);
        setIsConnected(true);
      }
    };

    checkConnection();

    // Start blockchain sync
    const startSync = async () => {
      setIsSyncing(true);
      try {
        await blockchainSync.startSync();
        console.log('Blockchain sync started successfully');
      } catch (error) {
        console.error('Failed to start blockchain sync:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    startSync();

    // Cleanup on unmount
    return () => {
      blockchainSync.stopSync();
    };
  }, []);

  const connectWallet = async () => {
    try {
      const address = await transactionService.connectWallet();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
        return address;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  };

  return {
    isConnected,
    walletAddress,
    isSyncing,
    connectWallet
  };
}