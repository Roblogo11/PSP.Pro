export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          athlete_type: string | null
          age: number | null
          parent_email: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          athlete_type?: string | null
          age?: number | null
          parent_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          athlete_type?: string | null
          age?: number | null
          parent_email?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          scheduled_at: string
          completed: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheduled_at: string
          completed?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheduled_at?: string
          completed?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      drills: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string
          thumbnail_url: string | null
          tags: string[]
          difficulty: string
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url: string
          thumbnail_url?: string | null
          tags: string[]
          difficulty: string
          duration: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string
          thumbnail_url?: string | null
          tags?: string[]
          difficulty?: string
          duration?: number
          created_at?: string
        }
      }
      drill_completions: {
        Row: {
          id: string
          user_id: string
          drill_id: string
          completed_at: string
          velocity_mph: number | null
        }
        Insert: {
          id?: string
          user_id: string
          drill_id: string
          completed_at?: string
          velocity_mph?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          drill_id?: string
          completed_at?: string
          velocity_mph?: number | null
        }
      }
      velocity_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          velocity_mph: number
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          velocity_mph: number
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          velocity_mph?: number
          recorded_at?: string
        }
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
  }
}
