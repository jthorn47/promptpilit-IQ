import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface BlogPostCardProps {
  post: {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    icon: ReactNode;
  };
}

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-primary">
            {post.icon}
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
          {post.title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 mt-2">
          {post.excerpt}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <User className="w-3 h-3 mr-1" />
          <span className="mr-3">{post.author}</span>
          <Calendar className="w-3 h-3 mr-1" />
          <span className="mr-3">{post.date}</span>
          <Clock className="w-3 h-3 mr-1" />
          <span>{post.readTime}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          Read More
          <ArrowRight className="w-3 h-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};