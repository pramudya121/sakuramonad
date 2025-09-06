import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceHeader } from '@/components/MarketplaceHeader';
import { SakuraBackground } from '@/components/SakuraBackground';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { contractManager } from '@/lib/contracts';
import {
  Upload,
  Palette,
  Sparkles,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  supply: number;
  price: number;
}

export default function CreateNFT() {
  const { isConnected, address } = useWalletConnection();
  const transactionStatus = useTransactionStatus();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [deployedContractAddress, setDeployedContractAddress] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collectionName: '',
    collectionSymbol: '',
    royaltyPercentage: 5,
    supply: 1,
    price: 0.01,
    tokenType: 'ERC721' // ERC721 or ERC1155
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // In a real implementation, you would upload to IPFS
    // For now, we'll simulate this
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`ipfs://QmYourHashHere/${file.name}`);
      }, 2000);
    });
  };

  const createMetadata = async (): Promise<string> => {
    if (!imageFile) throw new Error('No image file selected');

    const imageUrl = await uploadToIPFS(imageFile);
    
    const metadata: NFTMetadata = {
      name: formData.name,
      description: formData.description,
      image: imageUrl,
      supply: formData.supply,
      price: formData.price
    };

    // Upload metadata to IPFS
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    return await uploadToIPFS(metadataFile);
  };

  const handleMint = async () => {
    console.log('Mint clicked - isConnected:', isConnected, 'address:', address);
    
    // Try to connect wallet if not connected
    if (!isConnected || !address) {
      console.log('Wallet not connected, attempting to connect...');
      toast.info('Please connect your wallet to mint NFT');
      return;
    }

    try {
      // Reset any previous transaction state
      transactionStatus.resetState();
      
      await transactionStatus.executeTransaction(
        async () => {
          // Step 1: Upload to IPFS
          toast.info('Uploading to IPFS...', { id: 'mint-process' });
          const metadataUrl = await createMetadata();
          
          // Step 2: Deploy NFT Collection Contract
          toast.info('Deploying NFT collection contract...', { 
            id: 'mint-process',
            description: 'Please confirm the transaction in your wallet'
          });
          
          const { contractAddress, txHash: deployTxHash } = await contractManager.deployNFTCollection(
            formData.collectionName,
            formData.collectionSymbol,
            formData.royaltyPercentage
          );
          
          setDeployedContractAddress(contractAddress);
          
          toast.success('Collection contract deployed!', { 
            id: 'mint-process',
            description: `Contract: ${contractAddress}`
          });
          
          // Step 3: Mint NFT
          toast.info('Minting NFT...', { 
            id: 'mint-process',
            description: 'Please confirm the minting transaction in your wallet'
          });
          
          const { tokenId, txHash: mintTxHash } = await contractManager.mintNFT(
            contractAddress,
            address,
            metadataUrl
          );
          
          setMintedTokenId(tokenId);
          
          return mintTxHash; // Return the final transaction hash
        },
        async (hash: string) => {
          // On success callback - save to database
          try {
            // Save collection to database
            const { data: collection, error: collectionError } = await supabase
              .from('nft_collections')
              .upsert({
                contract_address: deployedContractAddress,
                name: formData.collectionName,
                symbol: formData.collectionSymbol,
                creator_address: address,
                royalty_percentage: formData.royaltyPercentage,
                contract_type: formData.tokenType,
                description: `Collection for ${formData.name}`,
                total_supply: formData.supply
              })
              .select()
              .single();

            if (collectionError) throw collectionError;

            if (collection) {
              // Save NFT token to database
              const { error: tokenError } = await supabase
                .from('nft_tokens')
                .insert({
                  collection_id: collection.id,
                  token_id: mintedTokenId,
                  name: formData.name,
                  description: formData.description,
                  image_url: imagePreview,
                  metadata_url: await createMetadata(),
                  attributes: null,
                  owner_address: address
                });
                
              if (tokenError) throw tokenError;

              // Record minting transaction
              const { error: txError } = await supabase
                .from('marketplace_transactions')
                .insert({
                  transaction_hash: hash,
                  from_address: '0x0000000000000000000000000000000000000000', // Zero address for minting
                  to_address: address,
                  transaction_type: 'mint',
                  block_number: Math.floor(Math.random() * 1000000),
                  amount: formData.supply,
                  status: 'confirmed'
                });
                
              if (txError) throw txError;
            }

            toast.success('NFT minted successfully on Monad testnet!', {
              description: `Transaction: ${hash}`
            });
            
            setStep(3); // Success step
          } catch (dbError: any) {
            console.error('Database error:', dbError);
            toast.error('NFT minted but failed to save to database', {
              description: dbError.message
            });
          }
        },
        (error: Error) => {
          // On error callback
          console.error('Minting error:', error);
          toast.error('Failed to mint NFT', {
            description: error.message
          });
        }
      );
      
    } catch (error: any) {
      console.error('Outer minting error:', error);
      toast.error('Failed to start minting process', {
        description: error.message
      });
    }
  };

  const renderTransactionStatus = () => {
    if (transactionStatus.status === 'idle') return null;
    
    return (
      <div className="mt-4 p-4 bg-gradient-subtle rounded-lg border border-border/50">
        <div className="flex items-center gap-2">
          {transactionStatus.status === 'pending' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Preparing transaction...</span>
            </>
          )}
          {transactionStatus.status === 'submitted' && (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm">Transaction submitted, waiting for confirmation...</span>
            </>
          )}
          {transactionStatus.status === 'confirmed' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Transaction confirmed!</span>
            </>
          )}
          {transactionStatus.status === 'failed' && (
            <>
              <X className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Transaction failed</span>
            </>
          )}
        </div>
        
        {transactionStatus.hash && (
          <div className="mt-2">
            <a 
              href={`https://testnet-explorer.monad.xyz/tx/${transactionStatus.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View on Monad Explorer: {transactionStatus.hash.slice(0, 10)}...
            </a>
          </div>
        )}
        
        {transactionStatus.error && (
          <div className="mt-2 text-xs text-red-600">
            {transactionStatus.error}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Create Your NFT
              </h2>
              <p className="text-muted-foreground mt-2">
                Upload your artwork and add details
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Artwork *</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports: JPG, PNG, GIF, SVG (Max 10MB)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* NFT Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome NFT"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your NFT..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="tokenType">Token Type</Label>
                  <Select value={formData.tokenType} onValueChange={(value) => setFormData({...formData, tokenType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ERC721">ERC-721 (Unique)</SelectItem>
                      <SelectItem value="ERC1155">ERC-1155 (Multi-Edition)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tokenType === 'ERC1155' && (
                  <div>
                    <Label htmlFor="supply">Supply</Label>
                    <Input
                      id="supply"
                      type="number"
                      min="1"
                      value={formData.supply}
                      onChange={(e) => setFormData({...formData, supply: parseInt(e.target.value)})}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NFT Supply and Price */}
            <div className="space-y-4">
              <Label>NFT Details</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nftSupply">Supply</Label>
                  <Input
                    id="nftSupply"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.supply}
                    onChange={(e) => setFormData({...formData, supply: parseInt(e.target.value) || 1})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of copies to mint
                  </p>
                </div>
                <div>
                  <Label htmlFor="nftPrice">Price (ETH)</Label>
                  <Input
                    id="nftPrice"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0.01})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Initial listing price
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !imageFile}
                className="bg-gradient-primary hover:shadow-glow"
              >
                Next: Collection Details
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Collection Settings
              </h2>
              <p className="text-muted-foreground mt-2">
                Set up your collection details and royalties
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <Label htmlFor="collectionName">Collection Name *</Label>
                <Input
                  id="collectionName"
                  placeholder="My NFT Collection"
                  value={formData.collectionName}
                  onChange={(e) => setFormData({...formData, collectionName: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="collectionSymbol">Collection Symbol *</Label>
                <Input
                  id="collectionSymbol"
                  placeholder="MNC"
                  value={formData.collectionSymbol}
                  onChange={(e) => setFormData({...formData, collectionSymbol: e.target.value.toUpperCase()})}
                />
              </div>

              <div>
                <Label htmlFor="royalty">Royalty Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="royalty"
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={formData.royaltyPercentage}
                    onChange={(e) => setFormData({...formData, royaltyPercentage: parseFloat(e.target.value)})}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll earn this percentage on all secondary sales
                </p>
              </div>
            </div>

            {renderTransactionStatus()}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleMint}
                disabled={!formData.collectionName || !formData.collectionSymbol || transactionStatus.isLoading}
                className="bg-gradient-primary hover:shadow-glow"
              >
                {transactionStatus.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mint NFT on Monad
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">NFT Minted Successfully!</h2>
              <p className="text-muted-foreground mt-2">
                Your NFT has been created and is now available on the Monad blockchain
              </p>
            </div>
            
            <div className="bg-gradient-subtle rounded-lg p-6 border border-border/50">
              <img
                src={imagePreview}
                alt={formData.name}
                className="w-32 h-32 mx-auto rounded-lg object-cover mb-4"
              />
              <h3 className="font-semibold text-foreground">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">{formData.collectionName}</p>
              {deployedContractAddress && (
                <p className="text-xs text-primary mt-2">
                  Contract: {deployedContractAddress.slice(0, 10)}...
                </p>
              )}
              {mintedTokenId && (
                <p className="text-xs text-muted-foreground">
                  Token ID: {mintedTokenId}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                View in Marketplace
              </Button>
              <Button
                onClick={() => {
                  setStep(1);
                  setFormData({
                    name: '',
                    description: '',
                    collectionName: '',
                    collectionSymbol: '',
                    royaltyPercentage: 5,
                    supply: 1,
                    price: 0.01,
                    tokenType: 'ERC721'
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setDeployedContractAddress('');
                  setMintedTokenId('');
                  transactionStatus.resetState();
                }}
                 className="bg-gradient-primary hover:shadow-glow"
              >
                Create Another NFT
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <SakuraBackground />
      <MarketplaceHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Card className="max-w-4xl mx-auto bg-gradient-card border-border/50">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}