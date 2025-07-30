-- Create knowledge base system
CREATE TABLE IF NOT EXISTS public.knowledge_base_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#655DC6',
  icon TEXT DEFAULT 'folder',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID REFERENCES public.knowledge_base_categories(id),
  
  -- Article metadata
  author_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  
  -- SEO and organization
  slug TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  
  -- View tracking
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.knowledge_base_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.knowledge_base_articles(id) ON DELETE CASCADE,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.knowledge_base_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON public.knowledge_base_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON public.knowledge_base_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_author ON public.knowledge_base_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_published ON public.knowledge_base_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_kb_views_article ON public.knowledge_base_views(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_bookmarks_user ON public.knowledge_base_bookmarks(user_id);

-- Enable RLS
ALTER TABLE public.knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Categories
CREATE POLICY "Anyone can view active categories" ON public.knowledge_base_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.knowledge_base_categories
FOR ALL USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Articles
CREATE POLICY "Anyone can view published articles" ON public.knowledge_base_articles
FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can manage their own articles" ON public.knowledge_base_articles
FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all articles" ON public.knowledge_base_articles
FOR ALL USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Views
CREATE POLICY "System can insert views" ON public.knowledge_base_views
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view article analytics" ON public.knowledge_base_views
FOR SELECT USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for Bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON public.knowledge_base_bookmarks
FOR ALL USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_kb_categories_updated_at
  BEFORE UPDATE ON public.knowledge_base_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON public.knowledge_base_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.knowledge_base_articles 
  SET view_count = view_count + 1,
      last_viewed_at = NEW.viewed_at
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_views
  AFTER INSERT ON public.knowledge_base_views
  FOR EACH ROW EXECUTE FUNCTION update_article_view_count();

-- Insert default categories
INSERT INTO public.knowledge_base_categories (name, description, color, icon, sort_order) VALUES
('SOPs & Procedures', 'Standard Operating Procedures and step-by-step guides', '#10B981', 'clipboard-list', 1),
('Training Materials', 'Learning resources and training documentation', '#3B82F6', 'graduation-cap', 2),
('System Documentation', 'Technical documentation and system guides', '#8B5CF6', 'code', 3),
('Policies & Compliance', 'Company policies and compliance information', '#EF4444', 'shield', 4),
('FAQs & Troubleshooting', 'Frequently asked questions and problem resolution', '#F59E0B', 'help-circle', 5);