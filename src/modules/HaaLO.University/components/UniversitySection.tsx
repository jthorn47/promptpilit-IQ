import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VideoEmbed } from './VideoEmbed';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface UniversitySectionProps {
  section: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    estimatedTime: string;
    content: string;
    videoUrl?: string | null;
    adminOnly?: boolean;
  };
  isCompleted: boolean;
  onMarkComplete: () => void;
}

export function UniversitySection({ section, isCompleted, onMarkComplete }: UniversitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <section.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {section.title}
                {section.adminOnly && (
                  <Badge variant="outline" className="text-xs">
                    Admin Only
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {section.estimatedTime} • {section.description}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={onMarkComplete}
            variant={isCompleted ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Mark Complete
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Video Embed if available */}
        {section.videoUrl && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Training Video</h3>
            <VideoEmbed url={section.videoUrl} title={section.title} />
            <Separator className="mt-6" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mb-3 mt-6">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                  {children}
                </blockquote>
              )
            }}
          >
            {section.content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}