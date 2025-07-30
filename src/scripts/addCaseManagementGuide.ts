import { supabase } from "@/integrations/supabase/client";
import { caseManagementGuideArticle } from "@/data/caseManagementGuide";

export async function addCaseManagementGuide() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get categories to map names to IDs
    const { data: categories } = await supabase
      .from('knowledge_base_categories')
      .select('id, name');

    if (!categories) {
      throw new Error("Could not fetch categories");
    }

    const categoryMap = Object.fromEntries(
      categories.map(cat => [cat.name, cat.id])
    );

    // Create the slug
    const slug = caseManagementGuideArticle.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Prepare article data
    const articleData = {
      title: caseManagementGuideArticle.title,
      content: caseManagementGuideArticle.content,
      excerpt: caseManagementGuideArticle.excerpt,
      slug,
      status: caseManagementGuideArticle.status,
      featured: caseManagementGuideArticle.featured,
      tags: caseManagementGuideArticle.tags,
      target_roles: caseManagementGuideArticle.target_roles,
      category_id: categoryMap[caseManagementGuideArticle.category_name],
      author_id: user.id,
      published_at: caseManagementGuideArticle.status === 'published' ? new Date().toISOString() : null
    };

    // Check if article already exists
    const { data: existingArticle } = await supabase
      .from('knowledge_base_articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingArticle) {
      // Update existing article
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .update(articleData)
        .eq('id', existingArticle.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Updated article: ${caseManagementGuideArticle.title}`);
      return { success: true, action: 'updated', data };
    } else {
      // Create new article
      const { data, error } = await supabase
        .from('knowledge_base_articles')
        .insert([articleData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`Created article: ${caseManagementGuideArticle.title}`);
      return { success: true, action: 'created', data };
    }

  } catch (error) {
    console.error('Error adding case management guide:', error);
    return { success: false, error: error.message };
  }
}