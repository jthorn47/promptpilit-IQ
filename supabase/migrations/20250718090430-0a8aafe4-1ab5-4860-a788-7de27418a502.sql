-- Create wiki system for SARAH's knowledge base

-- Wiki categories enum
CREATE TYPE wiki_category AS ENUM ('compliance', 'conflict', 'documentation', 'safety', 'leadership', 'general');

-- Wiki articles table
CREATE TABLE public.wiki_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category wiki_category NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  user_roles TEXT[] DEFAULT '{}', -- Which roles this applies to
  industry_tags TEXT[] DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'qa', -- 'qa', 'course', 'scenario'
  source_data JSONB DEFAULT '{}', -- Original question/answer data
  usage_count INTEGER DEFAULT 0,
  helpfulness_score NUMERIC DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' -- 'active', 'draft', 'archived'
);

-- Wiki usage tracking
CREATE TABLE public.wiki_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID REFERENCES public.company_settings(id),
  user_role TEXT,
  access_type TEXT NOT NULL, -- 'search', 'browse', 'linked'
  search_query TEXT,
  helpful_rating INTEGER, -- 1-5 rating if provided
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wiki article sources (tracks original Q&A)
CREATE TABLE public.wiki_article_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.wiki_articles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- 'coachgpt_qa', 'course_content', 'scenario'
  source_id TEXT, -- Reference to original content
  original_question TEXT,
  original_answer TEXT,
  user_role TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Weekly wiki summaries
CREATE TABLE public.wiki_weekly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id),
  week_start_date DATE NOT NULL,
  summary_data JSONB NOT NULL DEFAULT '{}', -- Top topics, new articles, usage stats
  trending_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_article_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_weekly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wiki_articles
CREATE POLICY "Company users can view their wiki articles"
ON public.wiki_articles FOR SELECT
USING (
  company_id IS NULL OR 
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage wiki articles"
ON public.wiki_articles FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for wiki_usage_logs
CREATE POLICY "Users can insert their own usage logs"
ON public.wiki_usage_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Company admins can view usage logs"
ON public.wiki_usage_logs FOR SELECT
USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for wiki_article_sources
CREATE POLICY "Company admins can manage article sources"
ON public.wiki_article_sources FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.wiki_articles wa 
    WHERE wa.id = wiki_article_sources.article_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, wa.company_id) OR 
      has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- RLS Policies for wiki_weekly_summaries
CREATE POLICY "Company users can view their summaries"
ON public.wiki_weekly_summaries FOR SELECT
USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can manage summaries"
ON public.wiki_weekly_summaries FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_wiki_articles_company_category ON public.wiki_articles(company_id, category);
CREATE INDEX idx_wiki_articles_tags ON public.wiki_articles USING GIN(tags);
CREATE INDEX idx_wiki_articles_user_roles ON public.wiki_articles USING GIN(user_roles);
CREATE INDEX idx_wiki_usage_logs_article_date ON public.wiki_usage_logs(article_id, created_at);
CREATE INDEX idx_wiki_weekly_summaries_company_date ON public.wiki_weekly_summaries(company_id, week_start_date);

-- Full text search index
CREATE INDEX idx_wiki_articles_search ON public.wiki_articles USING GIN(to_tsvector('english', title || ' ' || content));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_wiki_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wiki_articles_updated_at
  BEFORE UPDATE ON public.wiki_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_updated_at();

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_wiki_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wiki_articles 
  SET usage_count = usage_count + 1
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wiki_usage_count_trigger
  AFTER INSERT ON public.wiki_usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_wiki_usage_count();