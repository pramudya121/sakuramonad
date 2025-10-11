import { useState, useEffect } from 'react';
import { web3Manager } from '@/lib/web3';

export type TransactionStatus = 'idle' | 'pending' | 'submitted' | 'confirmed' | 'failed';

interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

export function useTransactionStatus() {
  const [state, setState] = useState<TransactionState>({ status: 'idle' });

  const executeTransaction = async (
    transactionFn: () => Promise<string>,
    onSuccess?: (hash: string) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setState({ status: 'pending' });
      
      const hash = await transactionFn();
      
      if (!hash) {
        throw new Error('Transaction returned no hash');
      }
      
      setState({ status: 'submitted', hash });
      
      // Wait for confirmation using web3Manager's getProvider method
      const provider = web3Manager.getProvider();
      if (provider) {
        try {
          await provider.waitForTransaction(hash, 1, 300000); // Wait up to 5 minutes
          setState({ status: 'confirmed', hash });
          onSuccess?.(hash);
        } catch (waitError: any) {
          console.error('Error waiting for transaction:', waitError);
          // If waitForTransaction fails, still mark as submitted since we have the hash
          setState({ status: 'submitted', hash });
          onSuccess?.(hash);
        }
      } else {
        // No provider available, but we have the hash so consider it submitted
        setState({ status: 'submitted', hash });
        onSuccess?.(hash);
      }
    } catch (error: any) {
      console.error('Transaction execution error:', error);
      const errorMessage = error.message || 'Transaction failed';
      setState({ status: 'failed', error: errorMessage });
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  };

  const resetState = () => {
    setState({ status: 'idle' });
  };

  return {
    ...state,
    executeTransaction,
    resetState,
    isLoading: state.status === 'pending' || state.status === 'submitted'
  };
}