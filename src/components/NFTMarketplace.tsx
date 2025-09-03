import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnection } from '@/hooks/useWalletConnection';
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
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [transactionLoading, setTransactionLoading] = useState<string | null>(null);

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

          // Check if current user liked this NFT
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

  const handleLike = async (nftId: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const nft = nfts.find(n => n.id === nftId);
      if (!nft) return;

      if (nft.is_liked) {
        // Unlike
        await supabase
          .from('nft_likes')
          .delete()
          .eq('token_id', nftId)
          .eq('user_address', address);

        setNfts(nfts.map(n => n.id === nftId ? {
          ...n,
          is_liked: false,
          likes_count: (n.likes_count || 1) - 1
        } : n));
      } else {
        // Like
        await supabase
          .from('nft_likes')
          .insert({
            token_id: nftId,
            user_address: address
          });

        setNfts(nfts.map(n => n.id === nftId ? {
          ...n,
          is_liked: true,
          likes_count: (n.likes_count || 0) + 1
        } : n));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleBuyNFT = async (nft: NFT) => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    const activeListing = nft.marketplace_listings?.find(l => l.is_active);
    if (!activeListing) {
      toast.error('This NFT is not for sale');
      return;
    }

    setTransactionLoading(nft.id);

    try {
      // Simulate blockchain transaction
      toast.info('Processing purchase transaction...');
      
      // In a real implementation, you would:
      // 1. Call the marketplace contract's buy function
      // 2. Wait for transaction confirmation
      // 3. Update the database with new ownership
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate transaction time

      // Update ownership in database
      await supabase
        .from('nft_tokens')
        .update({ owner_address: address })
        .eq('id', nft.id);

      // Deactivate listing
      await supabase
        .from('marketplace_listings')
        .update({ is_active: false })
        .eq('token_id', nft.id);

      // Record transaction
      await supabase
        .from('marketplace_transactions')
        .insert({
          token_id: nft.id,
          from_address: nft.owner_address,
          to_address: address,
          price: activeListing.price,
          transaction_type: 'purchase',
          transaction_hash: '0x' + Math.random().toString(16).substr(2, 64), // Placeholder
          block_number: Math.floor(Math.random() * 1000000)
        });

      toast.success('NFT purchased successfully!');
      fetchNFTs(); // Refresh the list
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase NFT');
    } finally {
      setTransactionLoading(null);
    }
  };

  const handleMakeOffer = async (nft: NFT) => {
    if (!isConnected) {
      const connected = await connectWallet();
      if (!connected) return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      toast.info('Submitting offer...');

      await supabase
        .from('marketplace_offers')
        .insert({
          token_id: nft.id,
          buyer_address: address,
          price: parseFloat(offerAmount),
          offer_id: Math.floor(Math.random() * 1000000), // Placeholder
          expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          transaction_hash: '0x' + Math.random().toString(16).substr(2, 64) // Placeholder
        });

      toast.success('Offer submitted successfully!');
      setOfferAmount('');
      setSelectedNFT(null);
    } catch (error) {
      console.error('Offer error:', error);
      toast.error('Failed to submit offer');
    }
  };

  // Set up real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('nft-marketplace-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nft_tokens'
      }, () => {
        fetchNFTs();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_listings'
      }, () => {
        fetchNFTs();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nft_likes'
      }, () => {
        fetchNFTs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
              {/* NFT Image */}
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                <img
                  src={nft.image_url || '/placeholder.svg'}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => handleLike(nft.id)}
                  >
                    <Heart className={`w-4 h-4 ${nft.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="ml-1 text-xs">{nft.likes_count || 0}</span>
                  </Button>
                </div>
                {isOwner && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-green-500/80 text-white">
                      Owned
                    </Badge>
                  </div>
                )}
              </div>

              {/* NFT Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-foreground line-clamp-1">{nft.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {nft.nft_collections?.contract_type || 'ERC721'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nft.description}
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Collection: {nft.nft_collections?.name || 'Unknown'}
                </p>

                {activeListing && (
                  <div className="flex justify-between items-center py-2 px-3 bg-gradient-subtle rounded-lg">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-bold text-primary">{activeListing.price} ETH</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {activeListing && !isOwner && (
                    <>
                      <Button
                        onClick={() => handleBuyNFT(nft)}
                        disabled={transactionLoading === nft.id}
                        className="flex-1 bg-gradient-primary hover:shadow-glow"
                      >
                        {transactionLoading === nft.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Buy
                          </>
                        )}
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedNFT(nft)}
                          >
                            <Tag className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Make an Offer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Offer Amount (ETH)</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.1"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleMakeOffer(nft)}
                              className="w-full bg-gradient-primary hover:shadow-glow"
                            >
                              Submit Offer
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  
                  {!activeListing && !isOwner && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedNFT(nft)}
                        >
                          <Tag className="w-4 h-4 mr-1" />
                          Make Offer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make an Offer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Offer Amount (ETH)</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.1"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                            />
                          </div>
                          <Button
                            onClick={() => handleMakeOffer(nft)}
                            className="w-full bg-gradient-primary hover:shadow-glow"
                          >
                            Submit Offer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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