import { useState, useEffect, useCallback } from 'react';
import { web3Manager } from '@/lib/web3';

interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
}

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    address: null,
    isConnecting: false
  });

  // Check connection status on mount and when wallet changes
  const checkConnection = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          // If we have accounts but web3Manager is not connected, connect it
          if (!web3Manager.isConnected) {
            try {
              await web3Manager.connectWallet('metamask');
            } catch (error) {
              console.error('Failed to initialize web3Manager:', error);
            }
          }
          
          setState({
            isConnected: true,
            address: accounts[0],
            isConnecting: false
          });
        } else {
          setState({
            isConnected: false,
            address: null,
            isConnecting: false
          });
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setState({
        isConnected: false,
        address: null,
        isConnecting: false
      });
    }
  }, []);

  // Connect wallet function
  const connectWallet = async (walletType: 'metamask' | 'okx' = 'metamask') => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const address = await web3Manager.connectWallet(walletType);
      if (address) {
        setState({
          isConnected: true,
          address,
          isConnecting: false
        });
        return address;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
    
    setState(prev => ({ ...prev, isConnecting: false }));
    return null;
  };

  // Disconnect wallet function
  const disconnect = () => {
    setState({
      isConnected: false,
      address: null,
      isConnecting: false
    });
  };

  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          checkConnection();
        }
      };

      const handleChainChanged = () => {
        checkConnection();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  return {
    ...state,
    connectWallet,
    disconnect,
    checkConnection
  };
}