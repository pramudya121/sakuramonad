import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { MARKETPLACE_CONFIG, MONAD_TESTNET } from './web3';
import { toast } from 'sonner';

// ERC721 and ERC1155 standard ABIs for NFT contracts
const ERC721_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

const ERC1155_ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
  "function uri(uint256 id) view returns (string)",
  "function balanceOf(address account, uint256 id) view returns (uint256)"
];

class BlockchainSyncService {
  private provider: ethers.JsonRpcProvider;
  private marketplaceContract: ethers.Contract;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrls[0]);
    this.marketplaceContract = new ethers.Contract(
      MARKETPLACE_CONFIG.address,
      MARKETPLACE_CONFIG.abi,
      this.provider
    );
  }

  // Start syncing blockchain events
  async startSync() {
    console.log('Starting blockchain synchronization...');
    
    // Initial sync
    await this.syncMarketplaceEvents();
    
    // Set up periodic sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncMarketplaceEvents();
    }, 30000);

    // Set up real-time event listeners
    this.setupEventListeners();
  }

  // Stop syncing
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Remove all listeners
    this.marketplaceContract.removeAllListeners();
  }

  // Set up real-time event listeners for instant updates
  private setupEventListeners() {
    // Listen for new listings
    this.marketplaceContract.on('Listed', async (id, seller, nft, tokenId, amount, price, is1155, event) => {
      console.log('New listing detected:', { id: id.toString(), seller, nft, tokenId: tokenId.toString(), price: ethers.formatEther(price) });
      
      await this.syncNFTMetadata(nft, tokenId.toString(), is1155);
      await this.syncListing(id, seller, nft, tokenId, amount, price, is1155, event.transactionHash);
      
      toast.success('New NFT listed!', {
        description: `Token #${tokenId} listed for ${ethers.formatEther(price)} MON`
      });
    });

    // Listen for purchases
    this.marketplaceContract.on('Purchased', async (id, buyer, nft, tokenId, amount, price, event) => {
      console.log('Purchase detected:', { id: id.toString(), buyer, nft, tokenId: tokenId.toString(), price: ethers.formatEther(price) });
      
      await this.updateListingStatus(id, false);
      await this.recordTransaction(buyer, nft, tokenId, price, 'purchase', event.transactionHash);
      
      toast.success('NFT purchased!', {
        description: `Token #${tokenId} sold for ${ethers.formatEther(price)} MON`
      });
    });

    // Listen for auction events
    this.marketplaceContract.on('AuctionCreated', async (id, seller, nft, tokenId, amount, reserve, start, end, is1155, event) => {
      console.log('New auction:', { id: id.toString(), seller, nft, tokenId: tokenId.toString() });
      
      await this.syncNFTMetadata(nft, tokenId.toString(), is1155);
      await this.syncAuction(id, seller, nft, tokenId, amount, reserve, start, end, is1155, event.transactionHash);
      
      toast.success('New auction started!', {
        description: `Token #${tokenId} auction started`
      });
    });

    // Listen for bids
    this.marketplaceContract.on('BidPlaced', async (id, bidder, amount, event) => {
      console.log('New bid:', { id: id.toString(), bidder, amount: ethers.formatEther(amount) });
      
      await this.recordBid(id, bidder, amount, event.transactionHash);
      
      toast.success('New bid placed!', {
        description: `Bid of ${ethers.formatEther(amount)} MON placed`
      });
    });
  }

  // Sync marketplace events from blockchain
  private async syncMarketplaceEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber();
      
      // Get last processed block from database
      const { data: syncState } = await supabase
        .from('blockchain_sync_state')
        .select('last_processed_block')
        .eq('contract_address', MARKETPLACE_CONFIG.address)
        .eq('event_type', 'marketplace')
        .single();

      const fromBlock = syncState?.last_processed_block || currentBlock - 1000; // Start from 1000 blocks ago if no state
      const toBlock = currentBlock;

      console.log(`Syncing marketplace events from block ${fromBlock} to ${toBlock}`);

      // Get all marketplace events
      const filter = {
        address: MARKETPLACE_CONFIG.address,
        fromBlock,
        toBlock
      };

      const logs = await this.provider.getLogs(filter);
      
      for (const log of logs) {
        await this.processMarketplaceEvent(log);
      }

      // Update sync state
      await supabase
        .from('blockchain_sync_state')
        .upsert({
          contract_address: MARKETPLACE_CONFIG.address,
          event_type: 'marketplace',
          last_processed_block: toBlock
        })
        .select();

    } catch (error) {
      console.error('Error syncing marketplace events:', error);
    }
  }

  // Process individual marketplace events
  private async processMarketplaceEvent(log: ethers.Log) {
    try {
      const parsedLog = this.marketplaceContract.interface.parseLog(log);
      if (!parsedLog) return;

      const { name, args } = parsedLog;

      switch (name) {
        case 'Listed':
          await this.syncListing(
            args.id,
            args.seller,
            args.nft,
            args.tokenId,
            args.amount,
            args.price,
            args.is1155,
            log.transactionHash
          );
          break;

        case 'Purchased':
          await this.updateListingStatus(args.id, false);
          await this.recordTransaction(
            args.buyer,
            args.nft,
            args.tokenId,
            args.price,
            'purchase',
            log.transactionHash
          );
          break;

        case 'AuctionCreated':
          await this.syncAuction(
            args.id,
            args.seller,
            args.nft,
            args.tokenId,
            args.amount,
            args.reserve,
            args.start,
            args.end,
            args.is1155,
            log.transactionHash
          );
          break;

        case 'BidPlaced':
          await this.recordBid(args.id, args.bidder, args.amount, log.transactionHash);
          break;
      }
    } catch (error) {
      console.error('Error processing marketplace event:', error);
    }
  }

  // Sync NFT metadata from contract
  private async syncNFTMetadata(contractAddress: string, tokenId: string, isERC1155: boolean = false) {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        isERC1155 ? ERC1155_ABI : ERC721_ABI,
        this.provider
      );

      // Get basic contract info
      let name = 'Unknown Collection';
      let symbol = '';
      
      try {
        if (!isERC1155) {
          name = await contract.name();
          symbol = await contract.symbol();
        }
      } catch (e) {
        console.warn('Could not fetch contract name/symbol');
      }

      // Check if collection exists
      let { data: collection } = await supabase
        .from('nft_collections')
        .select('*')
        .eq('contract_address', contractAddress)
        .single();

      if (!collection) {
        // Create new collection
        const { data: newCollection } = await supabase
          .from('nft_collections')
          .insert({
            contract_address: contractAddress,
            name,
            symbol,
            creator_address: contractAddress, // Placeholder
            contract_type: isERC1155 ? 'ERC1155' : 'ERC721'
          })
          .select()
          .single();
        
        collection = newCollection;
      }

      if (!collection) return;

      // Get token metadata
      let metadataUri = '';
      let owner = '';
      
      try {
        if (isERC1155) {
          metadataUri = await contract.uri(tokenId);
        } else {
          metadataUri = await contract.tokenURI(tokenId);
          owner = await contract.ownerOf(tokenId);
        }
      } catch (e) {
        console.warn('Could not fetch token metadata');
      }

      // Fetch metadata from URI
      let metadata = {};
      if (metadataUri) {
        try {
          // Handle IPFS URIs
          const httpUri = metadataUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
          const response = await fetch(httpUri);
          metadata = await response.json();
        } catch (e) {
          console.warn('Could not fetch metadata from URI');
        }
      }

      // Check if token exists
      const { data: existingToken } = await supabase
        .from('nft_tokens')
        .select('*')
        .eq('collection_id', collection.id)
        .eq('token_id', tokenId)
        .single();

      const tokenData = {
        collection_id: collection.id,
        token_id: tokenId,
        name: (metadata as any)?.name || `${name} #${tokenId}`,
        description: (metadata as any)?.description || '',
        image_url: (metadata as any)?.image || '',
        metadata_url: metadataUri,
        attributes: (metadata as any)?.attributes || null,
        owner_address: owner || '',
        last_sync_block: await this.provider.getBlockNumber()
      };

      if (existingToken) {
        // Update existing token
        await supabase
          .from('nft_tokens')
          .update(tokenData)
          .eq('id', existingToken.id);
      } else {
        // Create new token
        await supabase
          .from('nft_tokens')
          .insert(tokenData);
      }

    } catch (error) {
      console.error('Error syncing NFT metadata:', error);
    }
  }

  // Sync listing data
  private async syncListing(
    listingId: bigint,
    seller: string,
    nftContract: string,
    tokenId: bigint,
    amount: bigint,
    price: bigint,
    isERC1155: boolean,
    transactionHash: string
  ) {
    try {
      // Get NFT token info
      const { data: nftToken } = await supabase
        .from('nft_tokens')
        .select('id, collection_id')
        .eq('token_id', tokenId.toString())
        .limit(1)
        .single();

      if (!nftToken) {
        // Sync NFT metadata first
        await this.syncNFTMetadata(nftContract, tokenId.toString(), isERC1155);
        return this.syncListing(listingId, seller, nftContract, tokenId, amount, price, isERC1155, transactionHash);
      }

      const listingData = {
        listing_id: Number(listingId),
        token_id: nftToken.id,
        price: parseFloat(ethers.formatEther(price)),
        amount: Number(amount),
        is_erc1155: isERC1155,
        seller_address: seller,
        transaction_hash: transactionHash,
        contract_address: nftContract,
        listing_type: 'fixed_price',
        is_active: true
      };

      await supabase
        .from('marketplace_listings')
        .upsert(listingData)
        .select();

    } catch (error) {
      console.error('Error syncing listing:', error);
    }
  }

  // Update listing status (e.g., when sold)
  private async updateListingStatus(listingId: bigint, isActive: boolean) {
    try {
      await supabase
        .from('marketplace_listings')
        .update({ is_active: isActive })
        .eq('listing_id', Number(listingId));
    } catch (error) {
      console.error('Error updating listing status:', error);
    }
  }

  // Record transaction
  private async recordTransaction(
    buyer: string,
    nftContract: string,
    tokenId: bigint,
    price: bigint,
    type: string,
    transactionHash: string
  ) {
    try {
      const { data: nftToken } = await supabase
        .from('nft_tokens')
        .select('id')
        .eq('token_id', tokenId.toString())
        .single();

      if (!nftToken) return;

      const txData = {
        transaction_hash: transactionHash,
        from_address: '', // Will be filled by indexer
        to_address: buyer,
        token_id: nftToken.id,
        price: parseFloat(ethers.formatEther(price)),
        amount: 1,
        transaction_type: type,
        status: 'confirmed',
        block_number: await this.provider.getBlockNumber()
      };

      await supabase
        .from('marketplace_transactions')
        .insert(txData);

      // Update token owner
      await supabase
        .from('nft_tokens')
        .update({ owner_address: buyer })
        .eq('id', nftToken.id);

    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  // Sync auction data
  private async syncAuction(
    auctionId: bigint,
    seller: string,
    nftContract: string,
    tokenId: bigint,
    amount: bigint,
    reservePrice: bigint,
    startTime: bigint,
    endTime: bigint,
    isERC1155: boolean,
    transactionHash: string
  ) {
    try {
      const { data: nftToken } = await supabase
        .from('nft_tokens')
        .select('id')
        .eq('token_id', tokenId.toString())
        .single();

      if (!nftToken) {
        await this.syncNFTMetadata(nftContract, tokenId.toString(), isERC1155);
        return this.syncAuction(auctionId, seller, nftContract, tokenId, amount, reservePrice, startTime, endTime, isERC1155, transactionHash);
      }

      const auctionData = {
        auction_id: Number(auctionId),
        token_id: nftToken.id,
        seller_address: seller,
        reserve_price: parseFloat(ethers.formatEther(reservePrice)),
        start_time: new Date(Number(startTime) * 1000).toISOString(),
        end_time: new Date(Number(endTime) * 1000).toISOString(),
        amount: Number(amount),
        is_erc1155: isERC1155,
        transaction_hash: transactionHash,
        highest_bid: 0,
        is_settled: false
      };

      await supabase
        .from('marketplace_auctions')
        .upsert(auctionData)
        .select();

    } catch (error) {
      console.error('Error syncing auction:', error);
    }
  }

  // Record bid
  private async recordBid(
    auctionId: bigint,
    bidder: string,
    amount: bigint,
    transactionHash: string
  ) {
    try {
      const bidData = {
        auction_id: '', // Will be set by UUID lookup
        bidder_address: bidder,
        bid_amount: parseFloat(ethers.formatEther(amount)),
        transaction_hash: transactionHash
      };

      // Get auction UUID
      const { data: auction } = await supabase
        .from('marketplace_auctions')
        .select('id, highest_bid')
        .eq('auction_id', Number(auctionId))
        .single();

      if (!auction) return;

      bidData.auction_id = auction.id;

      await supabase
        .from('auction_bids')
        .insert(bidData);

      // Update highest bid
      const bidAmount = parseFloat(ethers.formatEther(amount));
      if (bidAmount > parseFloat(auction.highest_bid.toString())) {
        await supabase
          .from('marketplace_auctions')
          .update({
            highest_bid: bidAmount,
            highest_bidder_address: bidder
          })
          .eq('id', auction.id);
      }

    } catch (error) {
      console.error('Error recording bid:', error);
    }
  }
}

// Export singleton instance
export const blockchainSync = new BlockchainSyncService();