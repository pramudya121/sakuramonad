export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bidder_address: string
          created_at: string
          id: string
          transaction_hash: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bidder_address: string
          created_at?: string
          id?: string
          transaction_hash: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bidder_address?: string
          created_at?: string
          id?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "marketplace_auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_sync_state: {
        Row: {
          contract_address: string
          created_at: string | null
          event_type: string
          id: string
          last_processed_block: number
          updated_at: string | null
        }
        Insert: {
          contract_address: string
          created_at?: string | null
          event_type: string
          id?: string
          last_processed_block?: number
          updated_at?: string | null
        }
        Update: {
          contract_address?: string
          created_at?: string | null
          event_type?: string
          id?: string
          last_processed_block?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_analytics: {
        Row: {
          average_price: number | null
          collection_id: string | null
          created_at: string
          daily_sales: number | null
          daily_volume: number | null
          date: string
          floor_price: number | null
          id: string
          unique_buyers: number | null
          unique_sellers: number | null
        }
        Insert: {
          average_price?: number | null
          collection_id?: string | null
          created_at?: string
          daily_sales?: number | null
          daily_volume?: number | null
          date: string
          floor_price?: number | null
          id?: string
          unique_buyers?: number | null
          unique_sellers?: number | null
        }
        Update: {
          average_price?: number | null
          collection_id?: string | null
          created_at?: string
          daily_sales?: number | null
          daily_volume?: number | null
          date?: string
          floor_price?: number | null
          id?: string
          unique_buyers?: number | null
          unique_sellers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_analytics_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_auctions: {
        Row: {
          amount: number | null
          auction_id: number
          created_at: string
          end_time: string
          highest_bid: number | null
          highest_bidder_address: string | null
          id: string
          is_erc1155: boolean | null
          is_settled: boolean | null
          reserve_price: number
          seller_address: string
          start_time: string
          token_id: string
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          auction_id: number
          created_at?: string
          end_time: string
          highest_bid?: number | null
          highest_bidder_address?: string | null
          id?: string
          is_erc1155?: boolean | null
          is_settled?: boolean | null
          reserve_price: number
          seller_address: string
          start_time: string
          token_id: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          auction_id?: number
          created_at?: string
          end_time?: string
          highest_bid?: number | null
          highest_bidder_address?: string | null
          id?: string
          is_erc1155?: boolean | null
          is_settled?: boolean | null
          reserve_price?: number
          seller_address?: string
          start_time?: string
          token_id?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_auctions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          amount: number | null
          contract_address: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_erc1155: boolean | null
          listing_id: number
          listing_type: string | null
          price: number
          seller_address: string
          token_id: string
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          amount?: number | null
          contract_address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_erc1155?: boolean | null
          listing_id: number
          listing_type?: string | null
          price: number
          seller_address: string
          token_id: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number | null
          contract_address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_erc1155?: boolean | null
          listing_id?: number
          listing_type?: string | null
          price?: number
          seller_address?: string
          token_id?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_offers: {
        Row: {
          amount: number | null
          buyer_address: string
          created_at: string
          expiry: string
          id: string
          is_active: boolean | null
          is_erc1155: boolean | null
          offer_id: number
          price: number
          token_id: string
          transaction_hash: string | null
        }
        Insert: {
          amount?: number | null
          buyer_address: string
          created_at?: string
          expiry: string
          id?: string
          is_active?: boolean | null
          is_erc1155?: boolean | null
          offer_id: number
          price: number
          token_id: string
          transaction_hash?: string | null
        }
        Update: {
          amount?: number | null
          buyer_address?: string
          created_at?: string
          expiry?: string
          id?: string
          is_active?: boolean | null
          is_erc1155?: boolean | null
          offer_id?: number
          price?: number
          token_id?: string
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_offers_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          amount: number | null
          block_number: number
          created_at: string
          from_address: string
          gas_price: number | null
          gas_used: number | null
          id: string
          price: number | null
          status: string | null
          to_address: string
          token_id: string | null
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          amount?: number | null
          block_number: number
          created_at?: string
          from_address: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          price?: number | null
          status?: string | null
          to_address: string
          token_id?: string | null
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          amount?: number | null
          block_number?: number
          created_at?: string
          from_address?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          price?: number | null
          status?: string | null
          to_address?: string
          token_id?: string | null
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_collections: {
        Row: {
          banner_url: string | null
          contract_address: string
          contract_type: string | null
          created_at: string
          creator_address: string
          description: string | null
          floor_price: number | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          last_sync_block: number | null
          name: string
          royalty_percentage: number | null
          symbol: string | null
          total_supply: number | null
          total_volume: number | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          contract_address: string
          contract_type?: string | null
          created_at?: string
          creator_address: string
          description?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          last_sync_block?: number | null
          name: string
          royalty_percentage?: number | null
          symbol?: string | null
          total_supply?: number | null
          total_volume?: number | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          contract_address?: string
          contract_type?: string | null
          created_at?: string
          creator_address?: string
          description?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          last_sync_block?: number | null
          name?: string
          royalty_percentage?: number | null
          symbol?: string | null
          total_supply?: number | null
          total_volume?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      nft_likes: {
        Row: {
          created_at: string
          id: string
          token_id: string
          user_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          token_id: string
          user_address: string
        }
        Update: {
          created_at?: string
          id?: string
          token_id?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_likes_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_tokens: {
        Row: {
          attributes: Json | null
          collection_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          last_sync_block: number | null
          metadata_url: string | null
          name: string
          owner_address: string
          rarity_rank: number | null
          rarity_score: number | null
          token_id: string
          updated_at: string
        }
        Insert: {
          attributes?: Json | null
          collection_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          last_sync_block?: number | null
          metadata_url?: string | null
          name: string
          owner_address: string
          rarity_rank?: number | null
          rarity_score?: number | null
          token_id: string
          updated_at?: string
        }
        Update: {
          attributes?: Json | null
          collection_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          last_sync_block?: number | null
          metadata_url?: string | null
          name?: string
          owner_address?: string
          rarity_rank?: number | null
          rarity_score?: number | null
          token_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_tokens_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          abi: Json | null
          contract_address: string
          contract_type: string
          created_at: string
          id: string
          network: string
          updated_at: string
        }
        Insert: {
          abi?: Json | null
          contract_address: string
          contract_type: string
          created_at?: string
          id?: string
          network?: string
          updated_at?: string
        }
        Update: {
          abi?: Json | null
          contract_address?: string
          contract_type?: string
          created_at?: string
          id?: string
          network?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_watchlists: {
        Row: {
          collection_id: string | null
          created_at: string
          id: string
          token_id: string | null
          user_address: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          id?: string
          token_id?: string | null
          user_address: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          id?: string
          token_id?: string | null
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlists_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "nft_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlists_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nft_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_wallet_address: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
