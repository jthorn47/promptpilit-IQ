import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DocumentCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-4 bg-muted rounded w-12"></div>
          </div>
        </div>
        <div className="h-6 w-6 bg-muted rounded"></div>
      </div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-2/3"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-muted rounded w-12"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-14"></div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-muted rounded flex-1"></div>
          <div className="h-8 bg-muted rounded flex-1"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DocumentGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <DocumentCardSkeleton key={i} />
    ))}
  </div>
);

export const SearchFiltersSkeleton: React.FC = () => (
  <div className="space-y-4 mb-8">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <div className="h-10 bg-muted rounded w-full"></div>
      </div>
      <div className="h-10 bg-muted rounded w-48"></div>
      <div className="h-10 bg-muted rounded w-48"></div>
      <div className="h-10 bg-muted rounded w-48"></div>
    </div>
  </div>
);

export const VaultPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <SearchFiltersSkeleton />
    <div className="flex items-center justify-between mb-6">
      <div className="h-4 bg-muted rounded w-32"></div>
      <div className="h-8 bg-muted rounded w-24"></div>
    </div>
    <DocumentGridSkeleton />
  </div>
);