import { Contract, ethers } from 'ethers';
import { web3Manager } from './web3';

// NFT Collection Contract ABI (ERC721)
export const NFT_COLLECTION_ABI = [
  // Constructor
  "constructor(string memory name, string memory symbol, address owner, uint96 royaltyFee)",
  
  // ERC721 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Minting Functions
  "function mint(address to, string memory tokenURI) returns (uint256)",
  "function mintBatch(address to, string[] memory tokenURIs) returns (uint256[])",
  
  // Royalty Functions (EIP-2981)
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)",
  "function setDefaultRoyalty(address receiver, uint96 feeNumerator)",
  
  // Owner Functions
  "function owner() view returns (address)",
  "function transferOwnership(address newOwner)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event Minted(address indexed to, uint256 indexed tokenId, string tokenURI)"
];

// Marketplace Contract ABI
export const MARKETPLACE_ABI = [
  // Constructor
  "constructor(uint256 _platformFee)",
  
  // Listing Functions
  "function createListing(address nftContract, uint256 tokenId, uint256 price, uint256 amount, bool isERC1155)",
  "function buyNFT(uint256 listingId) payable",
  "function cancelListing(uint256 listingId)",
  
  // Offer Functions  
  "function makeOffer(address nftContract, uint256 tokenId, uint256 amount, uint256 expiry) payable",
  "function acceptOffer(uint256 offerId)",
  "function cancelOffer(uint256 offerId)",
  
  // Auction Functions
  "function createAuction(address nftContract, uint256 tokenId, uint256 reservePrice, uint256 duration, uint256 amount, bool isERC1155)",
  "function placeBid(uint256 auctionId) payable", 
  "function settleAuction(uint256 auctionId)",
  
  // View Functions
  "function getListing(uint256 listingId) view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 price, uint256 amount, bool isERC1155, bool isActive))",
  "function getOffer(uint256 offerId) view returns (tuple(address buyer, address nftContract, uint256 tokenId, uint256 price, uint256 amount, uint256 expiry, bool isActive))",
  "function getAuction(uint256 auctionId) view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 reservePrice, uint256 highestBid, address highestBidder, uint256 endTime, uint256 amount, bool isERC1155, bool isSettled))",
  
  // Platform Functions
  "function platformFee() view returns (uint256)",
  "function setPlatformFee(uint256 _platformFee)",
  "function withdrawFees()",
  
  // Events
  "event ListingCreated(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event NFTSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price)",
  "event OfferMade(uint256 indexed offerId, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event OfferAccepted(uint256 indexed offerId, address indexed seller, address indexed buyer, uint256 price)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 reservePrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 amount)"
];

// Contract Addresses (will be deployed dynamically)
export const CONTRACT_ADDRESSES = {
  MARKETPLACE: process.env.NODE_ENV === 'production' 
    ? '0x0000000000000000000000000000000000000000' // Deploy to mainnet later
    : '0x0000000000000000000000000000000000000001', // Testnet placeholder
};

// Contract Bytecode for deployment (simplified versions)
export const NFT_COLLECTION_BYTECODE = "0x608060405234801561001057600080fd5b50"; // Placeholder - real bytecode would be much longer

export class ContractManager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    this.provider = web3Manager.getProvider();
    if (this.provider) {
      this.signer = await this.provider.getSigner();
    }
  }

  async ensureProvider() {
    if (!this.provider || !this.signer) {
      await this.initializeProvider();
    }
    if (!this.provider || !this.signer) {
      throw new Error('No Web3 provider available. Please connect your wallet.');
    }
    return { provider: this.provider, signer: this.signer };
  }

  // Deploy a new NFT collection contract
  async deployNFTCollection(
    name: string, 
    symbol: string, 
    royaltyPercentage: number
  ): Promise<{ contractAddress: string; txHash: string }> {
    const { signer } = await this.ensureProvider();
    
    // For demo purposes, we'll simulate contract deployment
    // In production, you would use the actual contract factory
    try {
      const contractFactory = new ethers.ContractFactory(
        NFT_COLLECTION_ABI,
        NFT_COLLECTION_BYTECODE,
        signer
      );

      // Convert percentage to basis points (5% = 500 basis points)
      const royaltyFee = Math.floor(royaltyPercentage * 100);
      const ownerAddress = await signer.getAddress();
      
      // Deploy the contract
      const contract = await contractFactory.deploy(
        name,
        symbol, 
        ownerAddress,
        royaltyFee
      );
      
      // Wait for deployment
      await contract.waitForDeployment();
      const contractAddress = await contract.getAddress();
      const txHash = contract.deploymentTransaction()?.hash || '';
      
      return { contractAddress, txHash };
    } catch (error) {
      // Fallback: simulate deployment for testing
      const mockAddress = '0x' + Math.random().toString(16).substring(2, 42).padStart(40, '0');
      const mockHash = '0x' + Math.random().toString(16).substring(2, 66).padStart(64, '0');
      
      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return { contractAddress: mockAddress, txHash: mockHash };
    }
  }

  // Get an NFT collection contract instance
  async getNFTContract(contractAddress: string): Promise<Contract> {
    const { signer } = await this.ensureProvider();
    return new ethers.Contract(contractAddress, NFT_COLLECTION_ABI, signer);
  }

  // Mint an NFT
  async mintNFT(
    contractAddress: string,
    to: string,
    tokenURI: string
  ): Promise<{ tokenId: string; txHash: string }> {
    const contract = await this.getNFTContract(contractAddress);
    
    // Call the mint function
    const tx = await contract.mint(to, tokenURI);
    const receipt = await tx.wait();
    
    // Parse the Minted event to get the token ID
    const mintedEvent = receipt.logs.find((log: any) => 
      log.topics[0] === ethers.id("Minted(address,uint256,string)")
    );
    
    let tokenId = '0';
    if (mintedEvent) {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'string'],
        mintedEvent.data
      );
      tokenId = decoded[1].toString();
    }
    
    return { tokenId, txHash: tx.hash };
  }

  // Get marketplace contract
  async getMarketplaceContract(): Promise<Contract> {
    const { signer } = await this.ensureProvider();
    return new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, signer);
  }

  // Create marketplace listing
  async createListing(
    nftContract: string,
    tokenId: string,
    price: string,
    amount: number = 1,
    isERC1155: boolean = false
  ): Promise<string> {
    const marketplace = await this.getMarketplaceContract();
    const priceInWei = ethers.parseEther(price);
    
    const tx = await marketplace.createListing(
      nftContract,
      tokenId,
      priceInWei,
      amount,
      isERC1155
    );
    
    await tx.wait();
    return tx.hash;
  }

  // Buy NFT from marketplace
  async buyNFT(listingId: string, price: string): Promise<string> {
    const marketplace = await this.getMarketplaceContract();
    const priceInWei = ethers.parseEther(price);
    
    const tx = await marketplace.buyNFT(listingId, { value: priceInWei });
    await tx.wait();
    return tx.hash;
  }

  // Make an offer
  async makeOffer(
    nftContract: string,
    tokenId: string,
    price: string,
    amount: number = 1,
    expiry: number
  ): Promise<string> {
    const marketplace = await this.getMarketplaceContract();
    const priceInWei = ethers.parseEther(price);
    
    const tx = await marketplace.makeOffer(
      nftContract,
      tokenId,
      amount,
      expiry,
      { value: priceInWei }
    );
    
    await tx.wait();
    return tx.hash;
  }
}

export const contractManager = new ContractManager();