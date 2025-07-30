import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink, Building, Globe, Users } from 'lucide-react';
import { PotentialDuplicate } from '@/hooks/useCompanyValidation';

interface DuplicateWarningProps {
  duplicates: PotentialDuplicate[];
  onSelectExisting: (company: PotentialDuplicate) => void;
  onCreateNew: () => void;
  onCancel: () => void;
  isCreating?: boolean;
}

export const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  duplicates,
  onSelectExisting,
  onCreateNew,
  onCancel,
  isCreating = false
}) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'website_exact':
        return 'Exact website match';
      case 'website_similar':
        return 'Similar website';
      case 'name_similar':
        return 'Similar name';
      default:
        return 'Similar company';
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'website_exact':
      case 'website_similar':
        return <Globe className="h-4 w-4" />;
      case 'name_similar':
        return <Building className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Potential Duplicate Companies Found</CardTitle>
        </div>
        <CardDescription>
          We found {duplicates.length} existing compan{duplicates.length === 1 ? 'y' : 'ies'} that might be similar to the one you're creating.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Creating duplicate companies can cause confusion and data issues. Please review the suggestions below.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {duplicates.map((duplicate) => (
            <div
              key={duplicate.company_id}
              className="border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getMatchTypeIcon(duplicate.match_type)}
                    <h4 className="font-medium">{duplicate.company_name}</h4>
                    <Badge variant={getConfidenceColor(duplicate.confidence)}>
                      {duplicate.confidence} confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Match Type:</span>
                      <span>{getMatchTypeLabel(duplicate.match_type)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Similarity:</span>
                      <span>{Math.round(duplicate.similarity_score * 100)}%</span>
                    </div>
                    
                    {duplicate.website && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Website:</span>
                        <a
                          href={duplicate.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {duplicate.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectExisting(duplicate)}
                  className="ml-4"
                >
                  Use This Company
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onCreateNew}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create New Company Anyway'}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          <strong>Note:</strong> If you proceed with creating a new company, it will be flagged for admin review 
          to ensure it's not a duplicate. This helps maintain data quality.
        </div>
      </CardContent>
    </Card>
  );
};