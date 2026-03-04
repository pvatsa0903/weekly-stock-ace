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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_sentiment: {
        Row: {
          confidence: number
          created_at: string
          date: string
          id: string
          reddit_confirmed: boolean
          reddit_engagement: number
          reddit_mentions: number
          reddit_sentiment_score: number | null
          reddit_velocity: number | null
          sentiment_score: number
          ticker: string
          x_confirmed: boolean
          x_engagement: number
          x_mentions: number
          x_sentiment_score: number | null
          x_velocity: number | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          date: string
          id?: string
          reddit_confirmed?: boolean
          reddit_engagement?: number
          reddit_mentions?: number
          reddit_sentiment_score?: number | null
          reddit_velocity?: number | null
          sentiment_score?: number
          ticker: string
          x_confirmed?: boolean
          x_engagement?: number
          x_mentions?: number
          x_sentiment_score?: number | null
          x_velocity?: number | null
        }
        Update: {
          confidence?: number
          created_at?: string
          date?: string
          id?: string
          reddit_confirmed?: boolean
          reddit_engagement?: number
          reddit_mentions?: number
          reddit_sentiment_score?: number | null
          reddit_velocity?: number | null
          sentiment_score?: number
          ticker?: string
          x_confirmed?: boolean
          x_engagement?: number
          x_mentions?: number
          x_sentiment_score?: number | null
          x_velocity?: number | null
        }
        Relationships: []
      }
      fundamentals_snapshot: {
        Row: {
          cash: number | null
          debt: number | null
          ev_sales: number | null
          fcf: number | null
          id: string
          net_margin: number | null
          op_margin: number | null
          pe: number | null
          rev_cagr_3y: number | null
          rev_yoy: number | null
          risk_flags: string | null
          ticker: string
          week_ending: string
        }
        Insert: {
          cash?: number | null
          debt?: number | null
          ev_sales?: number | null
          fcf?: number | null
          id?: string
          net_margin?: number | null
          op_margin?: number | null
          pe?: number | null
          rev_cagr_3y?: number | null
          rev_yoy?: number | null
          risk_flags?: string | null
          ticker: string
          week_ending: string
        }
        Update: {
          cash?: number | null
          debt?: number | null
          ev_sales?: number | null
          fcf?: number | null
          id?: string
          net_margin?: number | null
          op_margin?: number | null
          pe?: number | null
          rev_cagr_3y?: number | null
          rev_yoy?: number | null
          risk_flags?: string | null
          ticker?: string
          week_ending?: string
        }
        Relationships: []
      }
      pick_performance: {
        Row: {
          created_at: string
          entry_price: number
          exit_price: number
          id: string
          is_win: boolean | null
          return_pct: number | null
          ticker: string
          week_ending: string
        }
        Insert: {
          created_at?: string
          entry_price: number
          exit_price: number
          id?: string
          is_win?: boolean | null
          return_pct?: number | null
          ticker: string
          week_ending: string
        }
        Update: {
          created_at?: string
          entry_price?: number
          exit_price?: number
          id?: string
          is_win?: boolean | null
          return_pct?: number | null
          ticker?: string
          week_ending?: string
        }
        Relationships: []
      }
      sentiment_items: {
        Row: {
          engagement: number
          id: string
          platform: string
          sentiment_label: string
          snippet: string
          ticker: string
          url: string
          velocity: number | null
          week_ending: string
        }
        Insert: {
          engagement?: number
          id?: string
          platform: string
          sentiment_label: string
          snippet: string
          ticker: string
          url: string
          velocity?: number | null
          week_ending: string
        }
        Update: {
          engagement?: number
          id?: string
          platform?: string
          sentiment_label?: string
          snippet?: string
          ticker?: string
          url?: string
          velocity?: number | null
          week_ending?: string
        }
        Relationships: []
      }
      tickers: {
        Row: {
          avg_dollar_volume: number
          company_name: string
          market_cap: number
          price: number
          sector: string
          ticker: string
        }
        Insert: {
          avg_dollar_volume: number
          company_name: string
          market_cap: number
          price: number
          sector: string
          ticker: string
        }
        Update: {
          avg_dollar_volume?: number
          company_name?: string
          market_cap?: number
          price?: number
          sector?: string
          ticker?: string
        }
        Relationships: []
      }
      weekly_decisions: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["decision_type"]
          eli5_summary: string
          id: string
          pick1: string | null
          pick1_confidence: number | null
          pick2: string | null
          pick2_confidence: number | null
          week_ending: string
          why_summary: string
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["decision_type"]
          eli5_summary: string
          id?: string
          pick1?: string | null
          pick1_confidence?: number | null
          pick2?: string | null
          pick2_confidence?: number | null
          week_ending: string
          why_summary: string
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["decision_type"]
          eli5_summary?: string
          id?: string
          pick1?: string | null
          pick1_confidence?: number | null
          pick2?: string | null
          pick2_confidence?: number | null
          week_ending?: string
          why_summary?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      decision_type: "PICK" | "SKIP"
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
      decision_type: ["PICK", "SKIP"],
    },
  },
} as const
