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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          note: string | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          note?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string
          genres: string[]
          hero_image_url: string | null
          home_city: string | null
          id: string
          owner_user_id: string
          slug: string
          socials: Json
          stage_name: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          genres?: string[]
          hero_image_url?: string | null
          home_city?: string | null
          id?: string
          owner_user_id: string
          slug: string
          socials?: Json
          stage_name: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          genres?: string[]
          hero_image_url?: string | null
          home_city?: string | null
          id?: string
          owner_user_id?: string
          slug?: string
          socials?: Json
          stage_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "artists_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      band_members: {
        Row: {
          artist_id: string
          band_id: string
          is_admin: boolean
          joined_at: string
          role: string | null
        }
        Insert: {
          artist_id: string
          band_id: string
          is_admin?: boolean
          joined_at?: string
          role?: string | null
        }
        Update: {
          artist_id?: string
          band_id?: string
          is_admin?: boolean
          joined_at?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "band_members_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "band_members_band_id_fkey"
            columns: ["band_id"]
            isOneToOne: false
            referencedRelation: "bands"
            referencedColumns: ["id"]
          },
        ]
      }
      bands: {
        Row: {
          bio: string | null
          created_at: string
          genres: string[]
          hero_image_url: string | null
          home_city: string | null
          id: string
          name: string
          slug: string
          socials: Json
        }
        Insert: {
          bio?: string | null
          created_at?: string
          genres?: string[]
          hero_image_url?: string | null
          home_city?: string | null
          id?: string
          name: string
          slug: string
          socials?: Json
        }
        Update: {
          bio?: string | null
          created_at?: string
          genres?: string[]
          hero_image_url?: string | null
          home_city?: string | null
          id?: string
          name?: string
          slug?: string
          socials?: Json
        }
        Relationships: []
      }
      conflict_flags: {
        Row: {
          detected_at: string
          event_a_id: string
          event_b_id: string
          id: string
          kind: Database["public"]["Enums"]["conflict_kind"]
          resolved_at: string | null
          subject_id: string
          subject_type: Database["public"]["Enums"]["conflict_subject"]
        }
        Insert: {
          detected_at?: string
          event_a_id: string
          event_b_id: string
          id?: string
          kind: Database["public"]["Enums"]["conflict_kind"]
          resolved_at?: string | null
          subject_id: string
          subject_type: Database["public"]["Enums"]["conflict_subject"]
        }
        Update: {
          detected_at?: string
          event_a_id?: string
          event_b_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["conflict_kind"]
          resolved_at?: string | null
          subject_id?: string
          subject_type?: Database["public"]["Enums"]["conflict_subject"]
        }
        Relationships: [
          {
            foreignKeyName: "conflict_flags_event_a_id_fkey"
            columns: ["event_a_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflict_flags_event_b_id_fkey"
            columns: ["event_b_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          role_at_join: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          role_at_join: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          role_at_join?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          event_id: string | null
          gig_listing_id: string | null
          id: string
          last_message_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id?: string | null
          gig_listing_id?: string | null
          id?: string
          last_message_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string | null
          gig_listing_id?: string | null
          id?: string
          last_message_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_gig_listing_id_fkey"
            columns: ["gig_listing_id"]
            isOneToOne: false
            referencedRelation: "gig_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          expires_at: string | null
          feature: string
          id: string
          organization_id: string
          source: Database["public"]["Enums"]["entitlement_source"]
          value: Json
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          feature: string
          id?: string
          organization_id: string
          source?: Database["public"]["Enums"]["entitlement_source"]
          value?: Json
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          feature?: string
          id?: string
          organization_id?: string
          source?: Database["public"]["Enums"]["entitlement_source"]
          value?: Json
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      event_boosts: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string
          event_id: string
          id: string
          source: Database["public"]["Enums"]["boost_source"]
          starts_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at: string
          event_id: string
          id?: string
          source?: Database["public"]["Enums"]["boost_source"]
          starts_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string
          event_id?: string
          id?: string
          source?: Database["public"]["Enums"]["boost_source"]
          starts_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_boosts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_boosts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_boosts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      event_performers: {
        Row: {
          billing_order: number
          event_id: string
          fee_cents: number | null
          performer_id: string
          performer_type: Database["public"]["Enums"]["performer_type"]
          status: Database["public"]["Enums"]["performer_status"]
        }
        Insert: {
          billing_order?: number
          event_id: string
          fee_cents?: number | null
          performer_id: string
          performer_type: Database["public"]["Enums"]["performer_type"]
          status?: Database["public"]["Enums"]["performer_status"]
        }
        Update: {
          billing_order?: number
          event_id?: string
          fee_cents?: number | null
          performer_id?: string
          performer_type?: Database["public"]["Enums"]["performer_type"]
          status?: Database["public"]["Enums"]["performer_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_performers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_saves: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_saves_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          is_special: boolean
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          ticket_url: string | null
          title: string
          venue_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_special?: boolean
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          ticket_url?: string | null
          title: string
          venue_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_special?: boolean
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          ticket_url?: string | null
          title?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["usage_kind"]
          organization_id: string
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id: string | null
          venue_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["usage_kind"]
          organization_id: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id?: string | null
          venue_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["usage_kind"]
          organization_id?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_payment_intent_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_purchases_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_user_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target"]
        }
        Insert: {
          created_at?: string
          follower_user_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target"]
        }
        Update: {
          created_at?: string
          follower_user_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["follow_target"]
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_user_id_fkey"
            columns: ["follower_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_bids: {
        Row: {
          bidder_id: string
          bidder_type: Database["public"]["Enums"]["performer_type"]
          created_at: string
          gig_listing_id: string
          id: string
          message: string | null
          proposed_fee_cents: number | null
          status: Database["public"]["Enums"]["bid_status"]
        }
        Insert: {
          bidder_id: string
          bidder_type: Database["public"]["Enums"]["performer_type"]
          created_at?: string
          gig_listing_id: string
          id?: string
          message?: string | null
          proposed_fee_cents?: number | null
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Update: {
          bidder_id?: string
          bidder_type?: Database["public"]["Enums"]["performer_type"]
          created_at?: string
          gig_listing_id?: string
          id?: string
          message?: string | null
          proposed_fee_cents?: number | null
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Relationships: [
          {
            foreignKeyName: "gig_bids_gig_listing_id_fkey"
            columns: ["gig_listing_id"]
            isOneToOne: false
            referencedRelation: "gig_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_listings: {
        Row: {
          closes_at: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          pay_high_cents: number | null
          pay_low_cents: number | null
          requirements: string | null
          starts_at: string
          status: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string
        }
        Insert: {
          closes_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          pay_high_cents?: number | null
          pay_low_cents?: number | null
          requirements?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["gig_status"]
          title: string
          venue_id: string
        }
        Update: {
          closes_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          pay_high_cents?: number | null
          pay_low_cents?: number | null
          requirements?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["gig_status"]
          title?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_listings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_listings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_push_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          message: string
          offer_id: string | null
          radius_m: number
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["gps_push_status"]
          venue_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          message: string
          offer_id?: string | null
          radius_m: number
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["gps_push_status"]
          venue_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          message?: string
          offer_id?: string | null
          radius_m?: number
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["gps_push_status"]
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gps_push_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_push_campaigns_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_push_campaigns_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gps_push_campaigns_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          days_of_week: number[]
          expiration_date: string | null
          gps_radius_m: number | null
          id: string
          message: string
          on_event_pages: boolean
          recurrence: Database["public"]["Enums"]["offer_recurrence"]
          start_date: string
          time_end: string | null
          time_start: string | null
          venue_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          days_of_week?: number[]
          expiration_date?: string | null
          gps_radius_m?: number | null
          id?: string
          message: string
          on_event_pages?: boolean
          recurrence?: Database["public"]["Enums"]["offer_recurrence"]
          start_date?: string
          time_end?: string | null
          time_start?: string | null
          venue_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          days_of_week?: number[]
          expiration_date?: string | null
          gps_radius_m?: number | null
          id?: string
          message?: string
          on_event_pages?: boolean
          recurrence?: Database["public"]["Enums"]["offer_recurrence"]
          start_date?: string
          time_end?: string | null
          time_start?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Insert: {
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id: string
        }
        Update: {
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          id: string
          is_founding: boolean
          name: string
          owner_user_id: string
          slug: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          id?: string
          is_founding?: boolean
          name: string
          owner_user_id: string
          slug: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          id?: string
          is_founding?: boolean
          name?: string
          owner_user_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          display_name: string
          feature_matrix: Json
          key: Database["public"]["Enums"]["plan_key"]
          updated_at: string
        }
        Insert: {
          display_name: string
          feature_matrix?: Json
          key: Database["public"]["Enums"]["plan_key"]
          updated_at?: string
        }
        Update: {
          display_name?: string
          feature_matrix?: Json
          key?: Database["public"]["Enums"]["plan_key"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          home_city: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          home_city?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          home_city?: string | null
          id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          organization_id: string
          plan_key: Database["public"]["Enums"]["plan_key"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          venue_quantity: number
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          organization_id: string
          plan_key?: Database["public"]["Enums"]["plan_key"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          venue_quantity?: number
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          organization_id?: string
          plan_key?: Database["public"]["Enums"]["plan_key"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          venue_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["usage_kind"]
          metadata: Json
          organization_id: string | null
          venue_id: string | null
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["usage_kind"]
          metadata?: Json
          organization_id?: string | null
          venue_id?: string | null
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["usage_kind"]
          metadata?: Json
          organization_id?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_staff: {
        Row: {
          can_answer_questions: boolean
          role: Database["public"]["Enums"]["venue_staff_role"]
          user_id: string
          venue_id: string
        }
        Insert: {
          can_answer_questions?: boolean
          role: Database["public"]["Enums"]["venue_staff_role"]
          user_id: string
          venue_id: string
        }
        Update: {
          can_answer_questions?: boolean
          role?: Database["public"]["Enums"]["venue_staff_role"]
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_staff_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          capacity: number | null
          city: string
          created_at: string
          description: string | null
          hero_image_url: string | null
          ics_feed_url: string | null
          id: string
          is_verified: boolean
          lat: number
          lng: number
          name: string
          organization_id: string | null
          owner_user_id: string | null
          postal_code: string | null
          region: string
          slug: string
          socials: Json
        }
        Insert: {
          address: string
          capacity?: number | null
          city: string
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          ics_feed_url?: string | null
          id?: string
          is_verified?: boolean
          lat: number
          lng: number
          name: string
          organization_id?: string | null
          owner_user_id?: string | null
          postal_code?: string | null
          region: string
          slug: string
          socials?: Json
        }
        Update: {
          address?: string
          capacity?: number | null
          city?: string
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          ics_feed_url?: string | null
          id?: string
          is_verified?: boolean
          lat?: number
          lng?: number
          name?: string
          organization_id?: string | null
          owner_user_id?: string | null
          postal_code?: string | null
          region?: string
          slug?: string
          socials?: Json
        }
        Relationships: [
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_log: {
        Args: {
          _action: string
          _metadata?: Json
          _target_id?: string
          _target_type?: string
        }
        Returns: undefined
      }
      admin_market_density: {
        Args: never
        Returns: {
          city: string
          events: number
          region: string
          venues: number
        }[]
      }
      admin_platform_kpis: { Args: never; Returns: Json }
      admin_role_of: {
        Args: never
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      all_performers_confirmed: { Args: { _event: string }; Returns: boolean }
      entitlement_limit: {
        Args: { _feature: string; _org: string; _venue: string }
        Returns: number
      }
      gps_push_cap_ok: { Args: { _venue: string }; Returns: boolean }
      has_entitlement: {
        Args: { _feature: string; _org: string; _venue: string }
        Returns: boolean
      }
      is_band_admin: { Args: { _band_id: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { _conversation_id: string }
        Returns: boolean
      }
      is_org_manager: { Args: { _org: string }; Returns: boolean }
      is_org_member: { Args: { _org: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_venue_manager: { Args: { _venue_id: string }; Returns: boolean }
      is_venue_member: { Args: { _venue_id: string }; Returns: boolean }
      log_ticket_tap: { Args: { _event_id: string }; Returns: undefined }
      offer_gps_ok: {
        Args: { _radius: number; _venue: string }
        Returns: boolean
      }
      offer_quota_ok: {
        Args: { _active: boolean; _id: string; _venue: string }
        Returns: boolean
      }
      owns_artist: { Args: { _artist_id: string }; Returns: boolean }
      recompute_entitlements: { Args: { _org: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      venue_has_entitlement: {
        Args: { _feature: string; _venue: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "sales" | "support" | "read_only"
      app_role: "artist" | "venue_owner" | "venue_staff" | "goer"
      bid_status:
        | "pending"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "withdrawn"
      boost_source: "pro" | "purchase"
      conflict_kind: "venue_double_book" | "performer_double_book"
      conflict_subject: "venue" | "artist" | "band"
      device_platform: "ios" | "android" | "web"
      entitlement_source: "plan" | "purchase" | "comp"
      event_status: "draft" | "proposed" | "confirmed" | "cancelled"
      follow_target: "artist" | "band" | "venue"
      gig_status: "open" | "filled" | "cancelled"
      gps_push_status: "scheduled" | "sent" | "canceled"
      offer_recurrence: "one_time" | "weekly"
      org_member_role: "owner" | "manager" | "staff"
      performer_status: "invited" | "confirmed" | "declined"
      performer_type: "artist" | "band"
      plan_key: "free" | "venue_pro" | "multi_venue"
      purchase_status: "pending" | "paid" | "refunded" | "failed"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
      usage_kind: "boost" | "gps_push" | "offer_redeemed" | "ticket_tap"
      venue_staff_role: "manager" | "staff" | "booker"
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
    Enums: {
      admin_role: ["super_admin", "sales", "support", "read_only"],
      app_role: ["artist", "venue_owner", "venue_staff", "goer"],
      bid_status: [
        "pending",
        "shortlisted",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      boost_source: ["pro", "purchase"],
      conflict_kind: ["venue_double_book", "performer_double_book"],
      conflict_subject: ["venue", "artist", "band"],
      device_platform: ["ios", "android", "web"],
      entitlement_source: ["plan", "purchase", "comp"],
      event_status: ["draft", "proposed", "confirmed", "cancelled"],
      follow_target: ["artist", "band", "venue"],
      gig_status: ["open", "filled", "cancelled"],
      gps_push_status: ["scheduled", "sent", "canceled"],
      offer_recurrence: ["one_time", "weekly"],
      org_member_role: ["owner", "manager", "staff"],
      performer_status: ["invited", "confirmed", "declined"],
      performer_type: ["artist", "band"],
      plan_key: ["free", "venue_pro", "multi_venue"],
      purchase_status: ["pending", "paid", "refunded", "failed"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
      usage_kind: ["boost", "gps_push", "offer_redeemed", "ticket_tap"],
      venue_staff_role: ["manager", "staff", "booker"],
    },
  },
} as const
