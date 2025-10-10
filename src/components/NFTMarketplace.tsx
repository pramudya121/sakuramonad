import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { web3Manager } from '@/lib/web3';
import { Heart, ShoppingCart, Tag, Eye, Share2, Loader2 } from 'lucide-react';

interface NFT {
  id: string;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  owner_address: string;
  nft_collections?: {
    name: string;
    contract_address: string;
    contract_type: string;
  };
  marketplace_listings?: Array<{
    listing_id: number;
    price: number;
    is_active: boolean;
    listing_type: string;
  }>;
  likes_count?: number;
  is_liked?: boolean;
}

interface NFTMarketplaceProps {
  showTrending?: boolean;
  showLiveFeed?: boolean;
  limit?: number;
}

export const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({ 
  showTrending = false, 
  showLiveFeed = false, 
  limit = 12 
}) => {
  const { isConnected, address, connectWallet } = useWalletConnection();
  const { executeTransaction, status, hash, error, isLoading, resetState } = useTransactionStatus();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  const fetchNFTs = async () => {
    try {
      let query = supabase
        .from('nft_tokens')
        .select(`
          id,
          token_id,
          name,
          description,
          image_url,
          owner_address,
          nft_collections (
            name,
            contract_address,
            contract_type
          ),
          marketplace_listings (
            listing_id,
            price,
            is_active,
            listing_type
          )
        `)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch likes count for each NFT
      const nftsWithLikes = await Promise.all(
        (data || []).map(async (nft) => {
          const { count } = await supabase
            .from('nft_likes')
            .select('*', { count: 'exact', head: true })
            .eq('token_id', nft.id);

          let isLiked = false;
          if (address) {
            const { data: userLike } = await supabase
              .from('nft_likes')
              .select('id')
              .eq('token_id', nft.id)
              .eq('user_address', address)
              .single();
            isLiked = !!userLike;
          }

          return {
            ...nft,
            likes_count: count || 0,
            is_liked: isLiked
          };
        })
      );

      setNfts(nftsWithLikes as NFT[]);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNFT = async (nft: NFT) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const activeListing = nft.marketplace_listings?.find(l => l.is_active);
    if (!activeListing) {
      toast.error('This NFT is not for sale');
      return;
    }

    resetState();
    
    await executeTransaction(
      async () => {
        toast.info('Preparing purchase transaction...', { id: 'buy-tx' });
        
        // Execute real on-chain transaction - This will trigger MetaMask/OKX confirmation
        const txHash = await web3Manager.buyNFT(
          activeListing.listing_id.toString()
        );

        return txHash;
      },
      async (txHash) => {
        toast.success(`Purchase confirmed! Transaction: ${txHash.slice(0, 10)}...`, { id: 'buy-tx' });
        
        // Update database after successful transaction
        await supabase.from('marketplace_transactions').insert({
          transaction_hash: txHash,
          transaction_type: 'purchase',
          from_address: address,
          to_address: nft.owner_address || '',
          price: activeListing.price,
          token_id: nft.id,
          block_number: 0,
          status: 'confirmed'
        });

        fetchNFTs();
      },
      (error) => {
        toast.error(error.message || 'Purchase failed', { id: 'buy-tx' });
      }
    );
  };

  const handleMakeOffer = async (nft: NFT, offerAmount: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    resetState();
    
    await executeTransaction(
      async () => {
        toast.info('Preparing offer transaction...', { id: 'offer-tx' });

        const txHash = await web3Manager.makeOffer(
          0, // standardFlag: 0 for ERC721, 1 for ERC1155
          nft.token_id || '',
          "1",
          offerAmount
        );

        return txHash;
      },
      async (txHash) => {
        toast.success(`Offer confirmed! Transaction: ${txHash.slice(0, 10)}...`, { id: 'offer-tx' });
        
        await supabase.from('marketplace_offers').insert({
          offer_id: Math.floor(Math.random() * 1000000),
          token_id: nft.id,
          buyer_address: address,
          price: parseFloat(offerAmount),
          amount: 1,
          expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          is_erc1155: false,
          transaction_hash: txHash,
          is_active: true
        });

        setOfferAmount('');
        setSelectedNFT(null);
        fetchNFTs();
      },
      (error) => {
        toast.error(error.message || 'Failed to make offer', { id: 'offer-tx' });
      }
    );
  };

  useEffect(() => {
    fetchNFTs();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => {
        const activeListing = nft.marketplace_listings?.find(l => l.is_active);
        const isOwner = address?.toLowerCase() === nft.owner_address?.toLowerCase();

        return (
          <Card key={nft.id} className="group hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                <img
                  src={nft.image_url || '/placeholder.svg'}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isOwner && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-green-500/80 text-white">
                      Owned
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-1">{nft.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{nft.description}</p>

                {activeListing && (
                  <div className="flex justify-between items-center py-2 px-3 bg-gradient-subtle rounded-lg">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-bold text-primary">{activeListing.price} MON</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {activeListing && !isOwner && (
                    <>
                      <Button
                        onClick={() => handleBuyNFT(nft)}
                        className="flex-1 bg-gradient-primary hover:shadow-glow"
                        disabled={!isConnected || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {status === 'pending' ? 'Confirm in Wallet...' : 
                             status === 'submitted' ? 'Processing...' : 'Buy Now'}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </Button>
                      
                      <Dialog open={selectedNFT?.id === nft.id} onOpenChange={(open) => !open && setSelectedNFT(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setSelectedNFT(nft)}>
                            <Tag className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Make an Offer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Offer Amount (MON)</label>
                              <Input
                                type="number"
                                step="0.001"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                placeholder="Enter offer amount"
                              />
                            </div>
                            <Button
                              onClick={() => handleMakeOffer(nft, offerAmount)}
                              className="w-full bg-gradient-primary hover:shadow-glow"
                              disabled={!offerAmount || parseFloat(offerAmount) <= 0 || isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {status === 'pending' ? 'Confirm in Wallet...' : 
                                   status === 'submitted' ? 'Processing...' : 'Make Offer'}
                                </>
                              ) : (
                                <>
                                  <Tag className="w-4 h-4 mr-2" />
                                  Make Offer
                                </>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};