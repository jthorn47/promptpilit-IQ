import { BlogPostCard } from "./BlogPostCard";
import { ReactNode } from "react";

interface BlogPost {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  icon: ReactNode;
}

interface BlogPostsGridProps {
  posts: BlogPost[];
}

export const BlogPostsGrid = ({ posts }: BlogPostsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {posts.map((post, index) => (
        <BlogPostCard key={index} post={post} />
      ))}
    </div>
  );
};