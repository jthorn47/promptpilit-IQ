import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Users, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PotentialDuplicate {
  company_id: string;
  company_name: string;
  website?: string;
  similarity_score: number;
  match_type: string;
  confidence: string;
  lifecycle_stage?: string;
  service_type?: string;
  employee_count?: number;
}

interface DuplicateResolutionStepProps {
  duplicates: PotentialDuplicate[];
  companyName: string;
  domain: string;
  onSelectExisting: (company: PotentialDuplicate) => void;
  onCreateNew: () => void;
  onBack: () => void;
}

export const DuplicateResolutionStep = ({
  duplicates,
  companyName,
  domain,
  onSelectExisting,
  onCreateNew,
  onBack
}: DuplicateResolutionStepProps) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType?.toLowerCase()) {
      case 'name_exact':
        return 'Exact Name Match';
      case 'name_similar':
        return 'Similar Name';
      case 'website_exact':
        return 'Exact Website Match';
      case 'website_domain':
        return 'Domain Match';
      default:
        return 'Potential Match';
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType?.toLowerCase()) {
      case 'name_exact':
      case 'name_similar':
        return <Building2 className="h-4 w-4" />;
      case 'website_exact':
      case 'website_domain':
        return <Globe className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          We found {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''} for 
          <strong> {companyName}</strong> ({domain}). 
          Please review and select an existing company or create a new one.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Potential Duplicates</h3>
        
        {duplicates.map((duplicate, index) => (
          <Card key={duplicate.company_id || index} className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{duplicate.company_name}</CardTitle>
                  {duplicate.website && (
                    <CardDescription className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {duplicate.website}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getConfidenceColor(duplicate.confidence)}>
                    {duplicate.confidence} confidence
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getMatchTypeIcon(duplicate.match_type)}
                    {getMatchTypeLabel(duplicate.match_type)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {duplicate.service_type && (
                    <span>Service: {duplicate.service_type}</span>
                  )}
                  {duplicate.lifecycle_stage && (
                    <span>Stage: {duplicate.lifecycle_stage}</span>
                  )}
                  {duplicate.employee_count && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {duplicate.employee_count} employees
                    </span>
                  )}
                  <span>
                    Similarity: {Math.round(duplicate.similarity_score * 100)}%
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectExisting(duplicate)}
                >
                  Select This Company
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <h4 className="font-medium">Create New Company Instead</h4>
          <p className="text-sm text-muted-foreground">
            If none of these matches are correct, you can proceed to create a new company record. 
            This action will be logged for review.
          </p>
          <Button onClick={onCreateNew} className="w-full">
            Create New Company: {companyName}
          </Button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          Back to Domain Entry
        </Button>
      </div>
    </div>
  );
};