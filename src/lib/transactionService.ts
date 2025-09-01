import { ethers } from 'ethers';
import { toast } from 'sonner';
import { MARKETPLACE_CONFIG, MONAD_TESTNET } from './web3';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: string;
}

export interface NFTListing {
  tokenId: string;
  contractAddress: string;
  price: string;
  isERC1155: boolean;
}

export interface AuctionParams {
  tokenId: string;
  contractAddress: string;
  reservePrice: string;
  duration: number; // in hours
  isERC1155: boolean;
}

class TransactionService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  // Connect to wallet and switch to Monad testnet
  async connectWallet(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask or another Web3 wallet');
        return null;
      }

      // Request wallet connection
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        toast.error('No accounts found in wallet');
        return null;
      }

      // Switch to Monad testnet
      await this.switchToMonadTestnet();

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();
      
      toast.success('Wallet connected!', {
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`
      });

      return address;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: error.message
      });
      return null;
    }
  }

  // Switch to Monad testnet
  private async switchToMonadTestnet() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          });
        } catch (addError) {
          console.error('Error adding Monad testnet:', addError);
          throw new Error('Failed to add Monad testnet to wallet');
        }
      } else {
        throw switchError;
      }
    }
  }

  // List NFT for fixed price sale
  async listNFT(listing: NFTListing): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Preparing transaction...', { id: 'list-nft' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const priceWei = ethers.parseEther(listing.price);

      let tx;
      if (listing.isERC1155) {
        // For ERC1155 tokens
        tx = await contract.list1155(
          listing.contractAddress,
          listing.tokenId,
          1, // amount
          priceWei
        );
      } else {
        // For ERC721 tokens
        tx = await contract.list721(
          listing.contractAddress,
          listing.tokenId,
          priceWei
        );
      }

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'list-nft',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('NFT listed successfully!', { 
          id: 'list-nft',
          description: `Listed for ${listing.price} MON`
        });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT', { 
        id: 'list-nft',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Cancel NFT listing
  async cancelListing(listingId: number): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Preparing cancellation...', { id: 'cancel-listing' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const tx = await contract.unlist(listingId);

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'cancel-listing',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('Listing cancelled successfully!', { id: 'cancel-listing' });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error cancelling listing:', error);
      toast.error('Failed to cancel listing', { 
        id: 'cancel-listing',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Buy NFT
  async buyNFT(listingId: number, price: string): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Preparing purchase...', { id: 'buy-nft' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const priceWei = ethers.parseEther(price);

      const tx = await contract.buy(listingId, 1, { 
        value: priceWei 
      });

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'buy-nft',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('NFT purchased successfully!', { 
          id: 'buy-nft',
          description: `Bought for ${price} MON`
        });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error buying NFT:', error);
      toast.error('Failed to purchase NFT', { 
        id: 'buy-nft',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Create auction
  async createAuction(auction: AuctionParams): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Creating auction...', { id: 'create-auction' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const reservePriceWei = ethers.parseEther(auction.reservePrice);
      const startTime = Math.floor(Date.now() / 1000);
      const endTime = startTime + (auction.duration * 3600); // Convert hours to seconds

      const tx = await contract.createAuction(
        auction.contractAddress,
        auction.tokenId,
        1, // amount
        auction.isERC1155,
        startTime,
        endTime,
        reservePriceWei
      );

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'create-auction',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('Auction created successfully!', { 
          id: 'create-auction',
          description: `Reserve price: ${auction.reservePrice} MON`
        });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction', { 
        id: 'create-auction',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Place bid on auction
  async placeBid(auctionId: number, bidAmount: string): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Placing bid...', { id: 'place-bid' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const bidWei = ethers.parseEther(bidAmount);

      const tx = await contract.bid(auctionId, { value: bidWei });

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'place-bid',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('Bid placed successfully!', { 
          id: 'place-bid',
          description: `Bid amount: ${bidAmount} MON`
        });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid', { 
        id: 'place-bid',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Make offer on NFT
  async makeOffer(
    contractAddress: string,
    tokenId: string,
    offerAmount: string,
    expiryHours: number = 24,
    isERC1155: boolean = false
  ): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Making offer...', { id: 'make-offer' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const offerWei = ethers.parseEther(offerAmount);
      const expiry = Math.floor(Date.now() / 1000) + (expiryHours * 3600);

      const tx = await contract.makeOffer(
        contractAddress,
        tokenId,
        1, // amount
        expiry,
        isERC1155,
        { value: offerWei }
      );

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'make-offer',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('Offer made successfully!', { 
          id: 'make-offer',
          description: `Offer: ${offerAmount} MON`
        });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error making offer:', error);
      toast.error('Failed to make offer', { 
        id: 'make-offer',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Accept offer
  async acceptOffer(
    contractAddress: string,
    tokenId: string,
    offerId: number,
    isERC1155: boolean = false
  ): Promise<TransactionStatus> {
    if (!this.signer) {
      return { status: 'error', error: 'Wallet not connected' };
    }

    try {
      toast.loading('Accepting offer...', { id: 'accept-offer' });

      const contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      const tx = await contract.acceptOffer(
        contractAddress,
        tokenId,
        offerId,
        1, // amount
        isERC1155
      );

      toast.loading('Transaction submitted, waiting for confirmation...', { 
        id: 'accept-offer',
        description: `Transaction hash: ${tx.hash}` 
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success('Offer accepted successfully!', { id: 'accept-offer' });
        return { status: 'success', hash: tx.hash };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer', { 
        id: 'accept-offer',
        description: error.reason || error.message 
      });
      return { status: 'error', error: error.message };
    }
  }

  // Get transaction status by hash
  async getTransactionStatus(hash: string): Promise<string> {
    if (!this.provider) return 'unknown';

    try {
      const receipt = await this.provider.getTransactionReceipt(hash);
      if (!receipt) return 'pending';
      return receipt.status === 1 ? 'success' : 'failed';
    } catch (error) {
      return 'unknown';
    }
  }

  // Get current wallet address
  async getWalletAddress(): Promise<string | null> {
    if (!this.signer) return null;
    try {
      return await this.signer.getAddress();
    } catch {
      return null;
    }
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return this.signer !== null;
  }
}

// Export singleton instance
export const transactionService = new TransactionService();

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}