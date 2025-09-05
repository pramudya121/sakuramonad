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
      setState({ status: 'submitted', hash });
      
      // Wait for confirmation using web3Manager's getProvider method
      const provider = web3Manager.getProvider();
      if (provider) {
        await provider.waitForTransaction(hash);
        setState({ status: 'confirmed', hash });
        onSuccess?.(hash);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
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