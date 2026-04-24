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
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          resume_text: string | null
          skills: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          resume_text?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          resume_text?: string | null
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_feedback: {
        Row: {
          application_id: string
          created_at: string
          culture_fit: string | null
          final_score: number
          gaps: string[] | null
          id: string
          improvement_tips: string[] | null
          job_id: string
          status_reason: string | null
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          culture_fit?: string | null
          final_score?: number
          gaps?: string[] | null
          id?: string
          improvement_tips?: string[] | null
          job_id: string
          status_reason?: string | null
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          culture_fit?: string | null
          final_score?: number
          gaps?: string[] | null
          id?: string
          improvement_tips?: string[] | null
          job_id?: string
          status_reason?: string | null
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_feedback_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_feedback_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string | null
          id: string
          job_id: string
          name: string
          resume_text: string | null
          skills: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          job_id: string
          name: string
          resume_text?: string | null
          skills?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          job_id?: string
          name?: string
          resume_text?: string | null
          skills?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          department: string
          description: string
          experience_level: string
          id: string
          required_skills: string[] | null
          title: string
          top_performer_profile: string | null
          updated_at: string
          user_id: string
          weight_culture: number
          weight_experience: number
          weight_skills: number
        }
        Insert: {
          created_at?: string
          department?: string
          description?: string
          experience_level?: string
          id?: string
          required_skills?: string[] | null
          title: string
          top_performer_profile?: string | null
          updated_at?: string
          user_id: string
          weight_culture?: number
          weight_experience?: number
          weight_skills?: number
        }
        Update: {
          created_at?: string
          department?: string
          description?: string
          experience_level?: string
          id?: string
          required_skills?: string[] | null
          title?: string
          top_performer_profile?: string | null
          updated_at?: string
          user_id?: string
          weight_culture?: number
          weight_experience?: number
          weight_skills?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string
          created_at: string
          id: string
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screening_results: {
        Row: {
          candidate_id: string
          created_at: string
          culture_fit: string | null
          final_score: number
          gaps: string[] | null
          id: string
          interview_questions: string[] | null
          job_id: string
          skill_tags: string[] | null
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          culture_fit?: string | null
          final_score?: number
          gaps?: string[] | null
          id?: string
          interview_questions?: string[] | null
          job_id: string
          skill_tags?: string[] | null
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          culture_fit?: string | null
          final_score?: number
          gaps?: string[] | null
          id?: string
          interview_questions?: string[] | null
          job_id?: string
          skill_tags?: string[] | null
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
