import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Download, Copy } from 'lucide-react';

export const GlobalReportLibrary = () => {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Globe className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Global Report Library</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approved Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Browse approved reports from the community</p>
        </CardContent>
      </Card>
    </div>
  );
};