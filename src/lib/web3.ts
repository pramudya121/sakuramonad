import { ethers } from 'ethers';

// Monad Testnet Configuration
export const MONAD_TESTNET = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://monad-testnet.rpc.org'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

// NeuraNFT Marketplace Contract Configuration
export const MARKETPLACE_CONFIG = {
  address: '0x61CDe79896EC26777EC34De209341A98CC846378',
  abi: [
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "standardFlag",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
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
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        }
      ],
      "name": "buyNFT",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalPrice",
          "type": "uint256"
        }
      ],
      "name": "Bought",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        }
      ],
      "name": "cancelListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "standardFlag",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "cancelOffer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "FeeUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "listingId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
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
          "name": "listingId",
          "type": "uint256"
        }
      ],
      "name": "ListingCancelled",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "standardFlag",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "listNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "standardFlag",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "makeOffer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "Mint1155",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Mint721",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        }
      ],
      "name": "mintNFT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
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
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "uri",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mintNFT1155",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
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
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "standard",
          "type": "uint8"
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
          "name": "totalPrice",
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
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "standard",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
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
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint8",
          "name": "standard",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "OfferMade",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnerUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bps",
          "type": "uint256"
        }
      ],
      "name": "setMarketplaceFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "updateOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "withdrawProceeds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [],
      "name": "baseURI1155",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseURI721",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
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
          "internalType": "enum NeuraNFTMarketplace.Standard",
          "name": "standard",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "seller",
          "type": "address"
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
      "inputs": [],
      "name": "marketplaceFeeBps",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextListingId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "offers",
      "outputs": [
        {
          "internalType": "enum NeuraNFTMarketplace.Standard",
          "name": "standard",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerToken",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
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
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
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
        }
      ],
      "name": "pendingWithdrawals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// Web3 Provider Management
export class Web3Manager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;
  private currentAccount: string | null = null;

  // Connect wallet
  async connectWallet(walletType: 'metamask' | 'okx' = 'metamask'): Promise<string | null> {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('Please install MetaMask or OKX Wallet!');
      }

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      this.currentAccount = accounts[0];

      // Initialize provider
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();

      // Switch to Monad Testnet
      await this.switchToMonadTestnet();

      // Initialize marketplace contract
      this.contract = new ethers.Contract(
        MARKETPLACE_CONFIG.address,
        MARKETPLACE_CONFIG.abi,
        this.signer
      );

      console.log('Connected to wallet:', this.currentAccount);
      return this.currentAccount;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  private async switchToMonadTestnet() {
    const ethereum = (window as any).ethereum;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      // Chain not added yet
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: MONAD_TESTNET.chainId,
              chainName: MONAD_TESTNET.chainName,
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
              rpcUrls: MONAD_TESTNET.rpcUrls,
              blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Mint NFT (ERC721)
  async mintNFT(to: string, uri: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.mintNFT(to, uri);
      const receipt = await tx.wait();
      
      // Listen for Mint721 event to get tokenId
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract!.interface.parseLog(log);
          return parsed?.name === 'Mint721';
        } catch {
          return false;
        }
      });
      
      console.log('NFT minted successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Mint NFT1155 (ERC1155)
  async mintNFT1155(to: string, uri: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.mintNFT1155(to, uri, amount);
      const receipt = await tx.wait();
      
      console.log('NFT1155 minted successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error minting NFT1155:', error);
      throw error;
    }
  }

  // List NFT for sale
  async listNFT(standardFlag: number, tokenId: string, quantity: string, price: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const priceInWei = ethers.parseEther(price);
      const tx = await this.contract.listNFT(standardFlag, tokenId, quantity, priceInWei);
      const receipt = await tx.wait();
      
      console.log('NFT listed successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  }

  // Buy NFT from listing
  async buyNFT(listingId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      // Get listing details to calculate price
      const listing = await this.getListing(listingId);
      const totalPrice = ethers.parseEther(listing.pricePerToken) * BigInt(listing.quantity);
      
      const tx = await this.contract.buyNFT(listingId, { value: totalPrice });
      const receipt = await tx.wait();
      
      console.log('NFT purchased successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
  }

  // Cancel listing
  async cancelListing(listingId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.cancelListing(listingId);
      const receipt = await tx.wait();
      
      console.log('Listing cancelled successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  // Withdraw proceeds from sales
  async withdrawProceeds(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.withdrawProceeds();
      const receipt = await tx.wait();
      
      console.log('Proceeds withdrawn successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error withdrawing proceeds:', error);
      throw error;
    }
  }

  // Approve NFT for marketplace
  async approveNFT(to: string, tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.approve(to, tokenId);
      const receipt = await tx.wait();
      
      console.log('NFT approved successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error approving NFT:', error);
      throw error;
    }
  }

  // Set approval for all NFTs
  async setApprovalForAll(operator: string, approved: boolean): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.setApprovalForAll(operator, approved);
      const receipt = await tx.wait();
      
      console.log('Approval for all set successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error setting approval for all:', error);
      throw error;
    }
  }

  // Get listing details
  async getListing(listingId: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const listing = await this.contract.listings(listingId);
      return {
        standard: listing.standard,
        tokenId: listing.tokenId.toString(),
        quantity: listing.quantity.toString(),
        pricePerToken: ethers.formatEther(listing.pricePerToken),
        seller: listing.seller,
        active: listing.active
      };
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  }

  // Get pending withdrawals for an address
  async getPendingWithdrawals(address: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const amount = await this.contract.pendingWithdrawals(address);
      return ethers.formatEther(amount);
    } catch (error) {
      console.error('Error getting pending withdrawals:', error);
      throw error;
    }
  }

  // Get marketplace fee
  async getMarketplaceFee(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const fee = await this.contract.marketplaceFeeBps();
      return fee.toString();
    } catch (error) {
      console.error('Error getting marketplace fee:', error);
      throw error;
    }
  }

  // Get owner of a token
  async getOwnerOf(tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting token owner:', error);
      throw error;
    }
  }

  // Get next listing ID
  async getNextListingId(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const id = await this.contract.nextListingId();
      return id.toString();
    } catch (error) {
      console.error('Error getting next listing ID:', error);
      throw error;
    }
  }

  // Legacy methods for backwards compatibility
  async listNFT721(nftContract: string, tokenId: string, price: string): Promise<string> {
    // NeuraNFT contract doesn't support external NFT contracts
    // This is a unified contract that handles both minting and marketplace
    return this.listNFT(0, tokenId, '1', price); // standardFlag 0 = ERC721
  }

  async listNFT1155(nftContract: string, tokenId: string, amount: string, pricePerUnit: string): Promise<string> {
    return this.listNFT(1, tokenId, amount, pricePerUnit); // standardFlag 1 = ERC1155
  }

  // Make offer on NFT
  async makeOffer(standardFlag: number, tokenId: string, quantity: string, offerPrice: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const priceInWei = ethers.parseEther(offerPrice);
      const totalPrice = priceInWei * BigInt(quantity);
      const tx = await this.contract.makeOffer(standardFlag, tokenId, quantity, { value: totalPrice });
      const receipt = await tx.wait();
      
      console.log('Offer made successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error making offer:', error);
      throw error;
    }
  }

  // Accept offer on NFT (seller only)
  async acceptOffer(standardFlag: number, tokenId: string, buyerAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.acceptOffer(standardFlag, tokenId, buyerAddress);
      const receipt = await tx.wait();
      
      console.log('Offer accepted successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  // Cancel offer on NFT (buyer only)
  async cancelOffer(standardFlag: number, tokenId: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.cancelOffer(standardFlag, tokenId);
      const receipt = await tx.wait();
      
      console.log('Offer cancelled successfully:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('Error cancelling offer:', error);
      throw error;
    }
  }

  // Get offer details
  async getOffer(standardFlag: number, tokenId: string, buyerAddress: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const offer = await this.contract.offers(standardFlag, tokenId, buyerAddress);
      return {
        standard: offer.standard,
        tokenId: offer.tokenId.toString(),
        quantity: offer.quantity.toString(),
        pricePerToken: ethers.formatEther(offer.pricePerToken),
        buyer: offer.buyer,
        active: offer.active
      };
    } catch (error) {
      console.error('Error getting offer:', error);
      throw error;
    }
  }

  async bidOnAuction(auctionId: string, bidAmount: string): Promise<string> {
    throw new Error('This marketplace does not support auctions yet.');
  }

  async createAuction(nftContract: string, tokenId: string, amount: string, isERC1155: boolean, startTime: number, endTime: number, reservePrice: string): Promise<string> {
    throw new Error('This marketplace does not support auctions yet.');
  }

  // Getters
  getContract(): ethers.Contract | null {
    return this.contract;
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  async getCurrentAccount(): Promise<string | null> {
    if (this.currentAccount) return this.currentAccount;
    
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) return null;
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      this.currentAccount = accounts[0] || null;
      return this.currentAccount;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  get isConnected(): boolean {
    return !!this.currentAccount && !!this.provider && !!this.signer;
  }
}

// Global instance
export const web3Manager = new Web3Manager();

// TypeScript declarations
declare global {
  interface Window {
    ethereum?: any;
  }
}
