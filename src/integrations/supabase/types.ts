export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Bills: {
        Row: {
          bill_id: number
          bill_number: string | null
          committee: string | null
          committee_id: string | null
          description: string | null
          last_action: string | null
          last_action_date: string | null
          session_id: number | null
          state_link: string | null
          status: number | null
          status_date: string | null
          status_desc: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          bill_id: number
          bill_number?: string | null
          committee?: string | null
          committee_id?: string | null
          description?: string | null
          last_action?: string | null
          last_action_date?: string | null
          session_id?: number | null
          state_link?: string | null
          status?: number | null
          status_date?: string | null
          status_desc?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          bill_id?: number
          bill_number?: string | null
          committee?: string | null
          committee_id?: string | null
          description?: string | null
          last_action?: string | null
          last_action_date?: string | null
          session_id?: number | null
          state_link?: string | null
          status?: number | null
          status_date?: string | null
          status_desc?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      co_authors: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          invited_by: string
          legislative_draft_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by: string
          legislative_draft_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string
          legislative_draft_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Documents: {
        Row: {
          bill_id: number | null
          document_desc: string | null
          document_id: number
          document_mime: string | null
          document_size: number | null
          document_type: string | null
          state_link: string | null
          url: string | null
        }
        Insert: {
          bill_id?: number | null
          document_desc?: string | null
          document_id: number
          document_mime?: string | null
          document_size?: number | null
          document_type?: string | null
          state_link?: string | null
          url?: string | null
        }
        Update: {
          bill_id?: number | null
          document_desc?: string | null
          document_id?: number
          document_mime?: string | null
          document_size?: number | null
          document_type?: string | null
          state_link?: string | null
          url?: string | null
        }
        Relationships: []
      }
      "History Table": {
        Row: {
          action: string | null
          bill_id: number
          chamber: string | null
          date: string
          sequence: number
        }
        Insert: {
          action?: string | null
          bill_id: number
          chamber?: string | null
          date: string
          sequence: number
        }
        Update: {
          action?: string | null
          bill_id?: number
          chamber?: string | null
          date?: string
          sequence?: number
        }
        Relationships: []
      }
      legislative_drafts: {
        Row: {
          analysis: Json | null
          co_author_count: number | null
          created_at: string
          draft_content: string
          id: string
          is_public: boolean | null
          legislative_idea_id: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
          votes: Json | null
        }
        Insert: {
          analysis?: Json | null
          co_author_count?: number | null
          created_at?: string
          draft_content: string
          id?: string
          is_public?: boolean | null
          legislative_idea_id?: string | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          votes?: Json | null
        }
        Update: {
          analysis?: Json | null
          co_author_count?: number | null
          created_at?: string
          draft_content?: string
          id?: string
          is_public?: boolean | null
          legislative_idea_id?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          votes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "legislative_drafts_legislative_idea_id_fkey"
            columns: ["legislative_idea_id"]
            isOneToOne: false
            referencedRelation: "legislative_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislative_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      legislative_ideas: {
        Row: {
          category: string | null
          created_at: string
          id: string
          improved_idea: string | null
          original_idea: string
          problem_statement_id: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          improved_idea?: string | null
          original_idea: string
          problem_statement_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          improved_idea?: string | null
          original_idea?: string
          problem_statement_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legislative_ideas_problem_statement_id_fkey"
            columns: ["problem_statement_id"]
            isOneToOne: false
            referencedRelation: "problem_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislative_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      media_outputs: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          legislative_draft_id: string | null
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          id?: string
          legislative_draft_id?: string | null
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          legislative_draft_id?: string | null
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_outputs_legislative_draft_id_fkey"
            columns: ["legislative_draft_id"]
            isOneToOne: false
            referencedRelation: "legislative_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_outputs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      People: {
        Row: {
          ballotpedia: string | null
          committee_id: string | null
          district: string | null
          first_name: string | null
          followthemoney_eid: number | null
          knowwho_pid: number | null
          last_name: string | null
          middle_name: string | null
          name: string | null
          nickname: string | null
          opensecrets_id: string | null
          party: string | null
          party_id: number | null
          people_id: number
          role: string | null
          role_id: number | null
          suffix: string | null
          votesmart_id: number | null
        }
        Insert: {
          ballotpedia?: string | null
          committee_id?: string | null
          district?: string | null
          first_name?: string | null
          followthemoney_eid?: number | null
          knowwho_pid?: number | null
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          nickname?: string | null
          opensecrets_id?: string | null
          party?: string | null
          party_id?: number | null
          people_id: number
          role?: string | null
          role_id?: number | null
          suffix?: string | null
          votesmart_id?: number | null
        }
        Update: {
          ballotpedia?: string | null
          committee_id?: string | null
          district?: string | null
          first_name?: string | null
          followthemoney_eid?: number | null
          knowwho_pid?: number | null
          last_name?: string | null
          middle_name?: string | null
          name?: string | null
          nickname?: string | null
          opensecrets_id?: string | null
          party?: string | null
          party_id?: number | null
          people_id?: number
          role?: string | null
          role_id?: number | null
          suffix?: string | null
          votesmart_id?: number | null
        }
        Relationships: []
      }
      problem_statements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_statements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      "Roll Call": {
        Row: {
          absent: string | null
          bill_id: number | null
          chamber: string | null
          date: string | null
          description: string | null
          nay: string | null
          nv: string | null
          roll_call_id: number
          total: number | null
          yea: number | null
        }
        Insert: {
          absent?: string | null
          bill_id?: number | null
          chamber?: string | null
          date?: string | null
          description?: string | null
          nay?: string | null
          nv?: string | null
          roll_call_id: number
          total?: number | null
          yea?: number | null
        }
        Update: {
          absent?: string | null
          bill_id?: number | null
          chamber?: string | null
          date?: string | null
          description?: string | null
          nay?: string | null
          nv?: string | null
          roll_call_id?: number
          total?: number | null
          yea?: number | null
        }
        Relationships: []
      }
      Sponsors: {
        Row: {
          bill_id: number | null
          id: number
          people_id: number | null
          position: number | null
        }
        Insert: {
          bill_id?: number | null
          id?: number
          people_id?: number | null
          position?: number | null
        }
        Update: {
          bill_id?: number | null
          id?: number
          people_id?: number | null
          position?: number | null
        }
        Relationships: []
      }
      Votes: {
        Row: {
          people_id: number
          roll_call_id: number
          vote: number | null
          vote_desc: string | null
        }
        Insert: {
          people_id: number
          roll_call_id: number
          vote?: number | null
          vote_desc?: string | null
        }
        Update: {
          people_id?: number
          roll_call_id?: number
          vote?: number | null
          vote_desc?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
