import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { web3Manager } from '@/lib/web3';
import {
  Upload,
  Palette,
  Sparkles,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
  CheckCircle,
  Home
} from 'lucide-react';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  supply: number;
  price: number;
}

export default function CreateNFT() {
  const navigate = useNavigate();
  const { isConnected, address } = useWalletConnection();
  const transactionStatus = useTransactionStatus();
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
    if (!isConnected || !address) {
      toast.info('Please connect your wallet to mint NFT');
      return;
    }

    // Validate form data
    if (!imageFile) {
      toast.error('Please upload an image for your NFT');
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      toast.error('Please enter a name for your NFT');
      return;
    }

    try {
      transactionStatus.resetState();
      
      // Ensure wallet is connected to web3Manager
      if (!web3Manager.isConnected) {
        toast.info('Connecting to wallet...', { id: 'mint-process' });
        try {
          await web3Manager.connectWallet('metamask');
        } catch (connectError: any) {
          toast.error('Failed to connect wallet', {
            description: connectError.message || 'Please make sure your wallet is unlocked'
          });
          return;
        }
      }
      
      await transactionStatus.executeTransaction(
        async () => {
          // Upload to IPFS
          toast.info('Uploading to IPFS...', { id: 'mint-process' });
          const metadataUrl = await createMetadata();
          
          // Mint NFT using the marketplace contract
          toast.info('Minting NFT on Monad...', { 
            id: 'mint-process',
            description: 'Please confirm the transaction in your wallet'
          });
          
          let txHash: string;
          
          try {
            if (formData.tokenType === 'ERC721') {
              txHash = await web3Manager.mintNFT(address, metadataUrl);
            } else {
              txHash = await web3Manager.mintNFT1155(address, metadataUrl, formData.supply.toString());
            }
          } catch (mintError: any) {
            console.error('Minting transaction error:', mintError);
            throw new Error(
              mintError.message?.includes('user rejected') 
                ? 'Transaction was rejected by user' 
                : mintError.message || 'Failed to mint NFT. Please try again.'
            );
          }
          
          // Get token ID from transaction receipt
          try {
            const provider = web3Manager.getProvider();
            if (provider) {
              toast.info('Waiting for transaction confirmation...', { id: 'mint-process' });
              const receipt = await provider.getTransactionReceipt(txHash);
              if (receipt) {
                // Parse event logs to get tokenId
                const contract = web3Manager.getContract();
                if (contract) {
                  const eventName = formData.tokenType === 'ERC721' ? 'Mint721' : 'Mint1155';
                  for (const log of receipt.logs) {
                    try {
                      const parsed = contract.interface.parseLog({
                        topics: [...log.topics],
                        data: log.data
                      });
                      if (parsed?.name === eventName) {
                        const tokenId = parsed.args.tokenId?.toString() || parsed.args[1]?.toString();
                        if (tokenId) {
                          setMintedTokenId(tokenId);
                          console.log('Token ID extracted:', tokenId);
                        }
                        break;
                      }
                    } catch (parseError) {
                      // Skip logs that can't be parsed
                      console.log('Could not parse log, continuing...');
                    }
                  }
                }
              }
            }
          } catch (receiptError) {
            console.warn('Could not get token ID from receipt:', receiptError);
            // Don't throw error, just log warning - minting was successful
          }
          
          // Store metadata URL for later use
          (window as any).__lastMetadataUrl = metadataUrl;
          
          return txHash;
        },
        async (hash: string) => {
          // Save to database
          try {
            const contractAddress = '0x61CDe79896EC26777EC34De209341A98CC846378';
            const metadataUrl = (window as any).__lastMetadataUrl || 'ipfs://metadata';
            
            // Check if collection exists, if not create it
            let { data: collection } = await supabase
              .from('nft_collections')
              .select('*')
              .eq('contract_address', contractAddress)
              .maybeSingle();

            if (!collection) {
              console.log('Creating new collection in database...');
              const { data: newCollection, error: collectionError } = await supabase
                .from('nft_collections')
                .insert([{
                  contract_address: contractAddress,
                  name: 'NeuraNFT Marketplace',
                  symbol: 'NEURA',
                  creator_address: address,
                  contract_type: formData.tokenType as 'ERC721' | 'ERC1155',
                  description: 'Official NeuraNFT Marketplace Collection'
                }])
                .select()
                .single();

              if (collectionError) {
                console.error('Error creating collection:', collectionError);
                throw collectionError;
              }
              collection = newCollection;
              console.log('Collection created:', collection);
            }

            if (collection) {
              const tokenIdToUse = mintedTokenId || `temp_${Date.now()}`;
              
              // Save NFT token
              console.log('Saving NFT token to database...');
              const { error: tokenError } = await supabase
                .from('nft_tokens')
                .insert({
                  collection_id: collection.id,
                  token_id: tokenIdToUse,
                  name: formData.name,
                  description: formData.description,
                  image_url: imagePreview,
                  metadata_url: metadataUrl,
                  owner_address: address
                });
                
              if (tokenError) {
                console.error('Error saving token:', tokenError);
                throw tokenError;
              }
              console.log('NFT token saved successfully');

              // Record transaction
              console.log('Recording transaction...');
              const { error: txError } = await supabase
                .from('marketplace_transactions')
                .insert({
                  transaction_hash: hash,
                  from_address: '0x0000000000000000000000000000000000000000',
                  to_address: address,
                  transaction_type: 'mint',
                  amount: formData.supply,
                  status: 'confirmed'
                });
                
              if (txError) {
                console.error('Error recording transaction:', txError);
                throw txError;
              }
              console.log('Transaction recorded successfully');
            }

            toast.success('NFT minted successfully on Monad!', {
              description: mintedTokenId ? `Token ID: ${mintedTokenId}` : 'Check your wallet for the new NFT'
            });
            
            setStep(3);
          } catch (dbError: any) {
            console.error('Database error:', dbError);
            toast.error('NFT minted but failed to save to database', {
              description: dbError.message || 'The NFT was minted successfully on-chain'
            });
            setStep(3); // Still show success since blockchain mint succeeded
          }
        },
        (error: Error) => {
          console.error('Transaction error:', error);
          const errorMessage = error.message || 'Unknown error occurred';
          
          toast.error('Failed to mint NFT', {
            description: errorMessage.includes('insufficient funds') 
              ? 'Insufficient MON balance for gas fees'
              : errorMessage.includes('user rejected')
              ? 'Transaction was rejected'
              : errorMessage
          });
        }
      );
      
    } catch (error: any) {
      console.error('Minting process error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      
      toast.error('Failed to start minting process', {
        description: errorMessage.includes('wallet') 
          ? 'Please connect your wallet and try again'
          : errorMessage.includes('network')
          ? 'Network error. Please check your connection'
          : errorMessage
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
                  <Label htmlFor="nftPrice">Price (MON)</Label>
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
                Next: Review & Mint
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Review & Mint
              </h2>
              <p className="text-muted-foreground mt-2">
                Review your NFT details before minting on Monad
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-subtle rounded-lg p-6 border border-border/50">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-foreground">{formData.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{formData.description}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{formData.tokenType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Supply:</span>
                    <span className="font-medium">{formData.supply}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{formData.price} MON</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> This NFT will be minted on the NeuraNFT Marketplace contract. 
                  Make sure your wallet has enough MON to cover gas fees.
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
                disabled={transactionStatus.isLoading}
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
              <p className="text-sm text-muted-foreground">NeuraNFT Marketplace</p>
              {mintedTokenId && (
                <p className="text-xs text-primary mt-2">
                  Token ID: {mintedTokenId}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Type: {formData.tokenType} | Supply: {formData.supply}
              </p>
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
                    supply: 1,
                    price: 0.01,
                    tokenType: 'ERC721'
                  });
                  setImageFile(null);
                  setImagePreview('');
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
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 border-border/50 hover:border-primary/50"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="max-w-4xl mx-auto bg-gradient-card border-border/50">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}