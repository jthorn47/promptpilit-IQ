import { 
  BlogHeader,
  BlogHero,
  FeaturedPost,
  CategoryFilter,
  BlogPostsGrid,
  NewsletterSignup
} from "../components";
import { featuredPost, blogPosts, categories } from "@/data/blogData";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const Blog = () => {
  const blogSchemaData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Learner's Blog - EaseLearn",
    "description": "Expert insights, practical tips, and industry updates on workplace safety, compliance training, and building safer work environments.",
    "url": "https://easelearn.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "EaseLearn",
      "logo": "/lovable-uploads/0de8e8d9-b908-4f3d-9415-6c98102466a6.png"
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author
      },
      "datePublished": post.date,
      "keywords": post.category
    }))
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="The Learner's Blog - Workplace Safety & Training Insights | EaseLearn"
        description="Expert insights, practical tips, and industry updates on workplace safety, compliance training, and building safer work environments. Stay informed with EaseLearn's blog."
        keywords="workplace safety blog, compliance training tips, harassment prevention insights, workplace violence articles, employee training resources, safety compliance news"
        canonicalUrl="https://easelearn.com/blog"
        schemaData={blogSchemaData}
      />
      
      <BlogHeader />
      
      <BreadcrumbNav items={[{ label: "Blog" }]} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <BlogHero />
        <FeaturedPost post={featuredPost} />
        <CategoryFilter categories={categories} />
        <BlogPostsGrid posts={blogPosts} />
        <NewsletterSignup />
      </div>
    </div>
  );
};

export default Blog;