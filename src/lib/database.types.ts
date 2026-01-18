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
      connections: {
        Row: {
          created_at: string | null
          id: string
          mode_context: string
          receiver_id: string
          request_message: string | null
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mode_context: string
          receiver_id: string
          request_message?: string | null
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mode_context?: string
          receiver_id?: string
          request_message?: string | null
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          connection_id: string
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          connection_id: string
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          connection_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
        }
      }
      posts: {
        Row: {
          author_id: string
          best_answer_id: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          event_date: string | null
          event_location: string | null
          event_rsvp_link: string | null
          event_title: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          mode_context: string
          moderation_reason: string | null
          moderation_status: string | null
          post_type: string
          project_links: string[] | null
          project_title: string | null
          resource_link: string | null
          resource_tags: string[] | null
          resource_title: string | null
          roles_needed: string[] | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          best_answer_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          event_date?: string | null
          event_location?: string | null
          event_rsvp_link?: string | null
          event_title?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mode_context: string
          moderation_reason?: string | null
          moderation_status?: string | null
          post_type: string
          project_links?: string[] | null
          project_title?: string | null
          resource_link?: string | null
          resource_tags?: string[] | null
          resource_title?: string | null
          roles_needed?: string[] | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          best_answer_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          event_date?: string | null
          event_location?: string | null
          event_rsvp_link?: string | null
          event_title?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          mode_context?: string
          moderation_reason?: string | null
          moderation_status?: string | null
          post_type?: string
          project_links?: string[] | null
          project_title?: string | null
          resource_link?: string | null
          resource_tags?: string[] | null
          resource_title?: string | null
          roles_needed?: string[] | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          college_name: string
          created_at: string | null
          current_mode: string | null
          email: string
          full_name: string
          graduation_year: number | null
          id: string
          id_card_url: string | null
          is_verified: boolean | null
          last_active: string | null
          major: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          college_name: string
          created_at?: string | null
          current_mode?: string | null
          email: string
          full_name: string
          graduation_year?: number | null
          id: string
          id_card_url?: string | null
          is_verified?: boolean | null
          last_active?: string | null
          major: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          college_name?: string
          created_at?: string | null
          current_mode?: string | null
          email?: string
          full_name?: string
          graduation_year?: number | null
          id?: string
          id_card_url?: string | null
          is_verified?: boolean | null
          last_active?: string | null
          major?: string
          updated_at?: string | null
        }
      }
    }
  }
}
