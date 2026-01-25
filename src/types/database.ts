export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Mode = 'study' | 'social' | 'project';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type PostType = 'thought' | 'photo' | 'project' | 'event' | 'resource' | 'question';
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'violence' | 'misinformation' | 'other';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          college_name: string | null;
          major: string | null;
          graduation_year: number | null;
          bio: string;
          id_card_url: string | null;
          is_verified: boolean;
          current_mode: Mode;
          last_active: string;
          onboarding_completed: boolean;
          show_own_campus_only: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          college_name?: string | null;
          major?: string | null;
          graduation_year?: number | null;
          bio?: string;
          id_card_url?: string | null;
          is_verified?: boolean;
          current_mode?: Mode;
          last_active?: string;
          onboarding_completed?: boolean;
          show_own_campus_only?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          college_name?: string | null;
          major?: string | null;
          graduation_year?: number | null;
          bio?: string;
          id_card_url?: string | null;
          is_verified?: boolean;
          current_mode?: Mode;
          last_active?: string;
          onboarding_completed?: boolean;
          show_own_campus_only?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_interests: {
        Row: {
          id: string;
          user_id: string;
          interest: string;
          category: 'hobby' | 'skill' | 'academic' | 'activity';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interest: string;
          category: 'hobby' | 'skill' | 'academic' | 'activity';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interest?: string;
          category?: 'hobby' | 'skill' | 'academic' | 'activity';
          created_at?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          requester_id: string;
          receiver_id: string;
          status: ConnectionStatus;
          request_message: string;
          mode_context: Mode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          receiver_id: string;
          status?: ConnectionStatus;
          request_message?: string;
          mode_context: Mode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          receiver_id?: string;
          status?: ConnectionStatus;
          request_message?: string;
          mode_context?: Mode;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          message_type: 'text' | 'emoji';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          connection_id: string;
          sender_id: string;
          content: string;
          message_type?: 'text' | 'emoji';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          connection_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: 'text' | 'emoji';
          is_read?: boolean;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          post_type: PostType;
          mode_context: Mode;
          content: string | null;
          image_url: string | null;
          project_title: string | null;
          project_links: string[] | null;
          roles_needed: string[] | null;
          event_title: string | null;
          event_date: string | null;
          event_location: string | null;
          event_rsvp_link: string | null;
          resource_title: string | null;
          resource_link: string | null;
          resource_tags: string[] | null;
          best_answer_id: string | null;
          moderation_status: ModerationStatus;
          moderation_reason: string | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          post_type: PostType;
          mode_context: Mode;
          content?: string | null;
          image_url?: string | null;
          project_title?: string | null;
          project_links?: string[] | null;
          roles_needed?: string[] | null;
          event_title?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          event_rsvp_link?: string | null;
          resource_title?: string | null;
          resource_link?: string | null;
          resource_tags?: string[] | null;
          best_answer_id?: string | null;
          moderation_status?: ModerationStatus;
          moderation_reason?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          post_type?: PostType;
          mode_context?: Mode;
          content?: string | null;
          image_url?: string | null;
          project_title?: string | null;
          project_links?: string[] | null;
          roles_needed?: string[] | null;
          event_title?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          event_rsvp_link?: string | null;
          resource_title?: string | null;
          resource_link?: string | null;
          resource_tags?: string[] | null;
          best_answer_id?: string | null;
          moderation_status?: ModerationStatus;
          moderation_reason?: string | null;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          content: string;
          is_best_answer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          content: string;
          is_best_answer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          is_best_answer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      saved_posts: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          post_id: string | null;
          comment_id: string | null;
          reason: ReportReason;
          description: string | null;
          status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          reason: ReportReason;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          reason?: ReportReason;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
          created_at?: string;
          reviewed_at?: string | null;
        };
      };
      user_violations: {
        Row: {
          id: string;
          user_id: string;
          violation_type: 'content_policy' | 'harassment' | 'spam' | 'inappropriate_content';
          description: string | null;
          action_taken: 'warning' | 'post_removed' | 'suspension_24h' | 'suspension_7d' | 'permanent_ban';
          related_post_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          violation_type: 'content_policy' | 'harassment' | 'spam' | 'inappropriate_content';
          description?: string | null;
          action_taken: 'warning' | 'post_removed' | 'suspension_24h' | 'suspension_7d' | 'permanent_ban';
          related_post_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          violation_type?: 'content_policy' | 'harassment' | 'spam' | 'inappropriate_content';
          description?: string | null;
          action_taken?: 'warning' | 'post_removed' | 'suspension_24h' | 'suspension_7d' | 'permanent_ban';
          related_post_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Connection = Database['public']['Tables']['connections']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostComment = Database['public']['Tables']['post_comments']['Row'];
export type PostLike = Database['public']['Tables']['post_likes']['Row'];
export type SavedPost = Database['public']['Tables']['saved_posts']['Row'];
export type UserInterest = Database['public']['Tables']['user_interests']['Row'];

export type ProfileWithInterests = Profile & {
  user_interests?: UserInterest[];
};

export type ConnectionWithProfiles = Connection & {
  requester: Profile;
  receiver: Profile;
};

export type PostWithAuthor = Post & {
  author: Profile;
  is_liked?: boolean;
  is_saved?: boolean;
};

export type CommentWithAuthor = PostComment & {
  author: Profile;
  replies?: CommentWithAuthor[];
};
