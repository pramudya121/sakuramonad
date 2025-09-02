import { useEffect, useState } from 'react';
import { blockchainSync } from '@/lib/blockchainSync';
import { useWalletConnection } from '@/hooks/useWalletConnection';

export function useBlockchainSync() {
  const { isConnected, address, connectWallet } = useWalletConnection();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Start blockchain sync when wallet is connected
    if (isConnected) {
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
    }

    // Cleanup on unmount or when wallet disconnects
    return () => {
      blockchainSync.stopSync();
    };
  }, [isConnected]);

  return {
    isConnected,
    walletAddress: address,
    isSyncing,
    connectWallet
  };
}