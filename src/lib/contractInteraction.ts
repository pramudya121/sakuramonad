import { ethers } from 'ethers';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Marketplace Contract Configuration
export const MARKETPLACE_CONFIG = {
  address: '0x4c045b5936841361ed4EDbA1ADd80fce4363dE8B',
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        }
      ],
      "name": "acceptOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_feeRecipient",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "reserve",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "start",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "end",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "is1155",
          "type": "bool"
        }
      ],
      "name": "AuctionCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "AuctionSettled",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "bid",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "bidder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "BidPlaced",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "buy",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        }
      ],
      "name": "cancelOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        },
        {
          "internalType": "uint64",
          "name": "startTime",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "endTime",
          "type": "uint64"
        },
        {
          "internalType": "uint256",
          "name": "reservePrice",
          "type": "uint256"
        }
      ],
      "name": "createAuction",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "feeBps",
          "type": "uint96"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "feeRecipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "maxRoyaltyBps",
          "type": "uint96"
        }
      ],
      "name": "FeeConfigUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerUnit",
          "type": "uint256"
        }
      ],
      "name": "list1155",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "list721",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "is1155",
          "type": "bool"
        }
      ],
      "name": "Listed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "ListingUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "expiry",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        }
      ],
      "name": "makeOffer",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalPaid",
          "type": "uint256"
        }
      ],
      "name": "OfferAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        }
      ],
      "name": "OfferCancelled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "offerId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "expiry",
          "type": "uint64"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "is1155",
          "type": "bool"
        }
      ],
      "name": "OfferMade",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "settle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "unlist",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "Unlisted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "updateListingPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    // View functions
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "auctions",
      "outputs": [
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        },
        {
          "internalType": "uint64",
          "name": "startTime",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "endTime",
          "type": "uint64"
        },
        {
          "internalType": "uint256",
          "name": "reservePrice",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "highestBidder",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "highestBid",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "settled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "listings",
      "outputs": [
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "nft",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "active",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "offers",
      "outputs": [
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "expiry",
          "type": "uint64"
        },
        {
          "internalType": "bool",
          "name": "isERC1155",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

export class MarketplaceContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize() {
    if (!(window as any).ethereum) {
      throw new Error('No wallet provider found');
    }

    this.provider = new ethers.BrowserProvider((window as any).ethereum);
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      MARKETPLACE_CONFIG.address,
      MARKETPLACE_CONFIG.abi,
      this.signer
    );
  }

  async listNFT721(nftAddress: string, tokenId: string, price: string) {
    if (!this.contract) await this.initialize();
    
    try {
      const priceWei = ethers.parseEther(price);
      const tx = await this.contract!.list721(nftAddress, tokenId, priceWei);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      // Store transaction in database
      await this.storeTransaction(receipt, 'listing', price);
      
      toast.success('NFT listed successfully!');
      return receipt;
    } catch (error: any) {
      console.error('List NFT error:', error);
      toast.error('Failed to list NFT: ' + error.message);
      throw error;
    }
  }

  async listNFT1155(nftAddress: string, tokenId: string, amount: number, pricePerUnit: string) {
    if (!this.contract) await this.initialize();
    
    try {
      const priceWei = ethers.parseEther(pricePerUnit);
      const tx = await this.contract!.list1155(nftAddress, tokenId, amount, priceWei);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'listing', pricePerUnit);
      
      toast.success('NFT listed successfully!');
      return receipt;
    } catch (error: any) {
      console.error('List NFT 1155 error:', error);
      toast.error('Failed to list NFT: ' + error.message);
      throw error;
    }
  }

  async buyNFT(listingId: number, amount: number, totalPrice: string) {
    if (!this.contract) await this.initialize();
    
    try {
      const priceWei = ethers.parseEther(totalPrice);
      const tx = await this.contract!.buy(listingId, amount, { value: priceWei });
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'purchase', totalPrice);
      
      toast.success('NFT purchased successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Buy NFT error:', error);
      toast.error('Failed to buy NFT: ' + error.message);
      throw error;
    }
  }

  async makeOffer(nftAddress: string, tokenId: string, amount: number, offerPrice: string, expiry: number, isERC1155: boolean) {
    if (!this.contract) await this.initialize();
    
    try {
      const priceWei = ethers.parseEther(offerPrice);
      const tx = await this.contract!.makeOffer(
        nftAddress,
        tokenId,
        amount,
        expiry,
        isERC1155,
        { value: priceWei }
      );
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'offer', offerPrice);
      
      toast.success('Offer submitted successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Make offer error:', error);
      toast.error('Failed to make offer: ' + error.message);
      throw error;
    }
  }

  async acceptOffer(nftAddress: string, tokenId: string, offerId: number, amount: number, isERC1155: boolean) {
    if (!this.contract) await this.initialize();
    
    try {
      const tx = await this.contract!.acceptOffer(nftAddress, tokenId, offerId, amount, isERC1155);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'offer_accepted');
      
      toast.success('Offer accepted successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Accept offer error:', error);
      toast.error('Failed to accept offer: ' + error.message);
      throw error;
    }
  }

  async createAuction(
    nftAddress: string,
    tokenId: string,
    amount: number,
    isERC1155: boolean,
    startTime: number,
    endTime: number,
    reservePrice: string
  ) {
    if (!this.contract) await this.initialize();
    
    try {
      const reservePriceWei = ethers.parseEther(reservePrice);
      const tx = await this.contract!.createAuction(
        nftAddress,
        tokenId,
        amount,
        isERC1155,
        startTime,
        endTime,
        reservePriceWei
      );
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'auction_created', reservePrice);
      
      toast.success('Auction created successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Create auction error:', error);
      toast.error('Failed to create auction: ' + error.message);
      throw error;
    }
  }

  async placeBid(auctionId: number, bidAmount: string) {
    if (!this.contract) await this.initialize();
    
    try {
      const bidWei = ethers.parseEther(bidAmount);
      const tx = await this.contract!.bid(auctionId, { value: bidWei });
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'bid', bidAmount);
      
      toast.success('Bid placed successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Place bid error:', error);
      toast.error('Failed to place bid: ' + error.message);
      throw error;
    }
  }

  async cancelListing(listingId: number) {
    if (!this.contract) await this.initialize();
    
    try {
      const tx = await this.contract!.unlist(listingId);
      
      toast.info('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();
      
      await this.storeTransaction(receipt, 'listing_cancelled');
      
      toast.success('Listing cancelled successfully!');
      return receipt;
    } catch (error: any) {
      console.error('Cancel listing error:', error);
      toast.error('Failed to cancel listing: ' + error.message);
      throw error;
    }
  }

  // View functions
  async getListing(listingId: number) {
    if (!this.contract) await this.initialize();
    return await this.contract!.listings(listingId);
  }

  async getAuction(auctionId: number) {
    if (!this.contract) await this.initialize();
    return await this.contract!.auctions(auctionId);
  }

  async getOffer(nftAddress: string, tokenId: string, offerId: number) {
    if (!this.contract) await this.initialize();
    return await this.contract!.offers(nftAddress, tokenId, offerId);
  }

  private async storeTransaction(receipt: any, type: string, amount?: string) {
    try {
      const userAddress = await this.signer?.getAddress();
      
      await supabase.from('marketplace_transactions').insert({
        transaction_hash: receipt.hash,
        block_number: receipt.blockNumber,
        from_address: userAddress || '',
        to_address: MARKETPLACE_CONFIG.address,
        transaction_type: type,
        price: amount ? parseFloat(amount) : null,
        gas_used: receipt.gasUsed?.toString(),
        gas_price: receipt.gasPrice?.toString(),
        status: 'confirmed'
      });
      
      console.log('Transaction stored in database:', receipt.hash);
    } catch (error) {
      console.error('Failed to store transaction:', error);
    }
  }
}

// Export singleton instance
export const marketplaceContract = new MarketplaceContract();