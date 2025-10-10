import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { web3Manager } from '@/lib/web3';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Offer {
  id: string;
  offer_id: number;
  token_id: string;
  buyer_address: string;
  price: number;
  amount: number;
  expiry: string;
  is_erc1155: boolean;
  is_active: boolean;
  nft_tokens?: {
    name: string;
    image_url: string;
    token_id: string;
    nft_collections?: {
      contract_type: string;
    };
  };
}

export const OffersManager: React.FC = () => {
  const { isConnected, address } = useWalletConnection();
  const { executeTransaction, isLoading } = useTransactionStatus();
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [madeOffers, setMadeOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    if (!address) return;
    
    try {
      setLoading(true);

      // Fetch offers received on user's NFTs
      const { data: received } = await supabase
        .from('marketplace_offers')
        .select(`
          *,
          nft_tokens!inner (
            name,
            image_url,
            token_id,
            owner_address,
            nft_collections (
              contract_type
            )
          )
        `)
        .eq('nft_tokens.owner_address', address)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Fetch offers made by user
      const { data: made } = await supabase
        .from('marketplace_offers')
        .select(`
          *,
          nft_tokens (
            name,
            image_url,
            token_id,
            nft_collections (
              contract_type
            )
          )
        `)
        .eq('buyer_address', address)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setReceivedOffers(received || []);
      setMadeOffers(made || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offer: Offer) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    await executeTransaction(
      async () => {
        toast.info('Accepting offer...', { id: 'accept-offer' });
        
        const standardFlag = offer.is_erc1155 ? 1 : 0;
        const txHash = await web3Manager.acceptOffer(
          standardFlag,
          offer.nft_tokens?.token_id || '',
          offer.buyer_address
        );

        return txHash;
      },
      async (txHash) => {
        toast.success(`Offer accepted! Transaction: ${txHash.slice(0, 10)}...`, { id: 'accept-offer' });
        
        // Update database
        await supabase
          .from('marketplace_offers')
          .update({ is_active: false })
          .eq('id', offer.id);

        // Record transaction
        await supabase.from('marketplace_transactions').insert({
          transaction_hash: txHash,
          transaction_type: 'offer_accepted',
          from_address: address,
          to_address: offer.buyer_address,
          price: offer.price,
          token_id: offer.token_id,
          block_number: 0,
          status: 'confirmed'
        });

        fetchOffers();
      },
      (error) => {
        toast.error(error.message || 'Failed to accept offer', { id: 'accept-offer' });
      }
    );
  };

  const handleCancelOffer = async (offer: Offer) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    await executeTransaction(
      async () => {
        toast.info('Cancelling offer...', { id: 'cancel-offer' });
        
        const standardFlag = offer.is_erc1155 ? 1 : 0;
        const txHash = await web3Manager.cancelOffer(
          standardFlag,
          offer.nft_tokens?.token_id || ''
        );

        return txHash;
      },
      async (txHash) => {
        toast.success(`Offer cancelled! Transaction: ${txHash.slice(0, 10)}...`, { id: 'cancel-offer' });
        
        // Update database
        await supabase
          .from('marketplace_offers')
          .update({ is_active: false })
          .eq('id', offer.id);

        fetchOffers();
      },
      (error) => {
        toast.error(error.message || 'Failed to cancel offer', { id: 'cancel-offer' });
      }
    );
  };

  useEffect(() => {
    if (address) {
      fetchOffers();
    }
  }, [address]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to view offers</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="received" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="received">
          Received Offers ({receivedOffers.length})
        </TabsTrigger>
        <TabsTrigger value="made">
          Made Offers ({madeOffers.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="space-y-4">
        {receivedOffers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No offers received yet</p>
            </CardContent>
          </Card>
        ) : (
          receivedOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={offer.nft_tokens?.image_url || '/placeholder.svg'}
                    alt={offer.nft_tokens?.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{offer.nft_tokens?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      From: {offer.buyer_address.slice(0, 6)}...{offer.buyer_address.slice(-4)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{offer.price} MON</Badge>
                      <Badge variant="outline">x{offer.amount}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleAcceptOffer(offer)}
                      disabled={isLoading}
                      className="bg-gradient-primary"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isLoading}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="made" className="space-y-4">
        {madeOffers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No offers made yet</p>
            </CardContent>
          </Card>
        ) : (
          madeOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={offer.nft_tokens?.image_url || '/placeholder.svg'}
                    alt={offer.nft_tokens?.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{offer.nft_tokens?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Expires: {new Date(offer.expiry).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{offer.price} MON</Badge>
                      <Badge variant="outline">x{offer.amount}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOffer(offer)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
