import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, Shield } from "lucide-react";

interface FeaturedPostProps {
  post: {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image?: string;
    featured?: boolean;
  };
}

export const FeaturedPost = ({ post }: FeaturedPostProps) => {
  return (
    <div className="mb-16">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div className="md:w-1/2 p-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-orange-100 text-orange-800">Featured</Badge>
              <Badge variant="secondary">{post.category}</Badge>
            </div>
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold leading-tight">
                {post.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mt-3">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <User className="w-4 h-4 mr-2" />
              <span className="mr-4">{post.author}</span>
              <Calendar className="w-4 h-4 mr-2" />
              <span className="mr-4">{post.date}</span>
              <Clock className="w-4 h-4 mr-2" />
              <span>{post.readTime}</span>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Read Full Article
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};