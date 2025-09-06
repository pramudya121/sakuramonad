import { ethers } from 'ethers';
import { web3Manager } from './web3';

// NFT Collection Contract ABI (ERC721)
export const NFT_COLLECTION_ABI = [
  // Constructor
  "constructor(string memory name, string memory symbol, address owner)",
  
  // Minting functions
  "function mint(address to, uint256 tokenId, string memory tokenURI) external",
  "function safeMint(address to, string memory tokenURI) external returns (uint256)",
  
  // Standard ERC721 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

// Marketplace Contract ABI
export const MARKETPLACE_ABI = [
  // Marketplace functions
  "function createListing(address nftContract, uint256 tokenId, uint256 price) external",
  "function buyItem(address nftContract, uint256 tokenId) external payable",
  "function cancelListing(address nftContract, uint256 tokenId) external",
  
  // Offer functions
  "function makeOffer(address nftContract, uint256 tokenId) external payable",
  "function acceptOffer(address nftContract, uint256 tokenId, address buyer) external",
  "function cancelOffer(address nftContract, uint256 tokenId) external",
  
  // View functions
  "function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price, bool active))",
  "function getOffer(address nftContract, uint256 tokenId, address buyer) view returns (uint256)",
  
  // Events
  "event ItemListed(address indexed nftContract, uint256 indexed tokenId, address indexed seller, uint256 price)",
  "event ItemBought(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 price)",
  "event OfferMade(address indexed nftContract, uint256 indexed tokenId, address indexed buyer, uint256 amount)",
  "event OfferAccepted(address indexed nftContract, uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount)"
];

// Factory Contract for deploying NFT collections
export const NFT_FACTORY_ABI = [
  "function deployNFTCollection(string memory name, string memory symbol) external returns (address)",
  "function deployedCollections(address owner, uint256 index) view returns (address)",
  "function getDeployedCollectionsCount(address owner) view returns (uint256)",
  "event CollectionDeployed(address indexed owner, address indexed collection, string name, string symbol)"
];

// Default contract addresses on Monad testnet
export const CONTRACT_ADDRESSES = {
  MARKETPLACE: '0x' + '1'.repeat(40), // Placeholder - should be deployed contract
  NFT_FACTORY: '0x' + '2'.repeat(40), // Placeholder - should be deployed contract
};

export class SmartContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize() {
    const provider = web3Manager.getProvider();
    if (!provider) {
      throw new Error('Web3 provider not available');
    }
    this.provider = provider;
    this.signer = await provider.getSigner();
  }

  async deployNFTCollection(name: string, symbol: string): Promise<string> {
    if (!this.signer) await this.initialize();
    
    // For demo purposes, we'll use a simple contract deployment
    // In a real implementation, you would deploy the actual NFT contract
    const contractFactory = new ethers.ContractFactory(
      NFT_COLLECTION_ABI,
      "0x608060405234801561001057600080fd5b50604051610c38380380610c388339818101604052810190610032919061017a565b8181816040518060400160405280600181526020017f31000000000000000000000000000000000000000000000000000000000000008152506040518060400160405280600181526020017f3100000000000000000000000000000000000000000000000000000000000000815250816000908051906020019061009c9291906100d7565b5080600190805190602001906100b39291906100d7565b5050506100d48160026100c660201b6101021760201c565b61012760201b60201c565b50505050610278565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061011857805160ff1916838001178555610146565b82800160010185558215610146579182015b8281111561014557825182559160200191906001019061012a565b5b5090506101539190610157565b5090565b61017991905b8082111561017557600081600090555060010161015d565b5090565b90565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008151905081356020840160208501011115610199576101986101a4565b5b92915050565b6000819050919050565b60006101b46101aa565b905090565b6000602082840312156101cf576101ce61017f565b5b60006101dd84828501610189565b91505092915050565b6000602082840312156101fc576101fb61017f565b5b600061020a84828501610189565b91505092915050565b610a208061022860003960006000f3fe",
      this.signer
    );

    const deployTransaction = await contractFactory.deploy(name, symbol, await this.signer.getAddress());
    await deployTransaction.waitForDeployment();
    
    const contractAddress = await deployTransaction.getAddress();
    return contractAddress;
  }

  async mintNFT(collectionAddress: string, tokenURI: string): Promise<{ hash: string; tokenId: string }> {
    if (!this.signer) await this.initialize();
    
    const nftContract = new ethers.Contract(collectionAddress, NFT_COLLECTION_ABI, this.signer);
    const signerAddress = await this.signer.getAddress();
    
    // Call safeMint function which returns the token ID
    const transaction = await nftContract.safeMint(signerAddress, tokenURI);
    const receipt = await transaction.wait();
    
    // Extract token ID from Transfer event
    const transferEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = nftContract.interface.parseLog(log);
        return parsed?.name === 'Transfer';
      } catch {
        return false;
      }
    });
    
    let tokenId = '1'; // Default fallback
    if (transferEvent) {
      const parsed = nftContract.interface.parseLog(transferEvent);
      tokenId = parsed?.args?.tokenId?.toString() || '1';
    }
    
    return {
      hash: transaction.hash,
      tokenId
    };
  }

  async createListing(nftContractAddress: string, tokenId: string, price: string): Promise<string> {
    if (!this.signer) await this.initialize();
    
    const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, this.signer);
    const priceWei = ethers.parseEther(price);
    
    const transaction = await marketplace.createListing(nftContractAddress, tokenId, priceWei);
    await transaction.wait();
    
    return transaction.hash;
  }

  async buyNFT(nftContractAddress: string, tokenId: string, price: string): Promise<string> {
    if (!this.signer) await this.initialize();
    
    const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, this.signer);
    const priceWei = ethers.parseEther(price);
    
    const transaction = await marketplace.buyItem(nftContractAddress, tokenId, { value: priceWei });
    await transaction.wait();
    
    return transaction.hash;
  }

  async makeOffer(nftContractAddress: string, tokenId: string, offerAmount: string): Promise<string> {
    if (!this.signer) await this.initialize();
    
    const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.MARKETPLACE, MARKETPLACE_ABI, this.signer);
    const offerWei = ethers.parseEther(offerAmount);
    
    const transaction = await marketplace.makeOffer(nftContractAddress, tokenId, { value: offerWei });
    await transaction.wait();
    
    return transaction.hash;
  }

  async approveNFT(nftContractAddress: string, tokenId: string, spenderAddress: string): Promise<string> {
    if (!this.signer) await this.initialize();
    
    const nftContract = new ethers.Contract(nftContractAddress, NFT_COLLECTION_ABI, this.signer);
    const transaction = await nftContract.approve(spenderAddress, tokenId);
    await transaction.wait();
    
    return transaction.hash;
  }
}

export const smartContractService = new SmartContractService();