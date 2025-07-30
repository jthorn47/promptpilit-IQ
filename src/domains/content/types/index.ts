// Content Domain Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id: string;
  category_id?: string;
  featured: boolean;
  featured_image_url?: string;
  status: string; // Changed from literal union to string to match DB
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  blog_categories?: Partial<BlogCategory>;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogMetrics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  average_reading_time: number;
  top_categories: { name: string; count: number }[];
}

export interface ContentSettings {
  auto_publish: boolean;
  seo_optimization: boolean;
  social_sharing: boolean;
  comment_moderation: boolean;
  email_notifications: boolean;
}