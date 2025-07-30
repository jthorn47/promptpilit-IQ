import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';

interface AdaptiveLearningBuilderProps {
  employeeId: string;
  currentRole?: string;
  currentIndustry?: string;
  onJourneyCreated?: (journey: any) => void;
}

const industryOptions = [
  'manufacturing', 'healthcare', 'retail', 'technology', 'finance', 
  'education', 'construction', 'hospitality', 'transportation', 'general'
];

const orgSizeOptions = [
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
];

const commonRiskAreas = [
  'harassment', 'safety', 'documentation', 'compliance', 
  'performance_management', 'communication', 'leadership'
];

export const AdaptiveLearningBuilder: React.FC<AdaptiveLearningBuilderProps> = ({
  employeeId,
  currentRole = '',
  currentIndustry = '',
  onJourneyCreated
}) => {
  const [roleTitle, setRoleTitle] = useState(currentRole);
  const [industry, setIndustry] = useState(currentIndustry);
  const [orgSize, setOrgSize] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [hrRiskScore, setHrRiskScore] = useState<number>();
  const [selectedRiskAreas, setSelectedRiskAreas] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');

  const {
    journey,
    profiles,
    isGenerating,
    generateJourney,
    getRecommendations
  } = useAdaptiveLearning({ employeeId });

  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (roleTitle && industry) {
      getRecommendations(roleTitle, industry).then(setRecommendations);
    }
  }, [roleTitle, industry, getRecommendations]);

  const handleRiskAreaToggle = (area: string) => {
    setSelectedRiskAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleGenerate = async () => {
    if (!roleTitle || !industry) {
      return;
    }

    const newJourney = await generateJourney({
      employeeId,
      roleTitle,
      industry,
      orgSize,
      hrRiskScore,
      riskAreas: selectedRiskAreas,
      additionalContext
    });

    if (newJourney && onJourneyCreated) {
      onJourneyCreated(newJourney);
    }
  };

  const isFormValid = roleTitle && industry;

  return (
    <div className="space-y-6">
      {/* Existing Journey Display */}
      {journey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Current Adaptive Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Role & Industry</Label>
                <p className="font-medium">{journey.role_title} • {journey.industry}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Progress</Label>
                <div className="flex items-center gap-2">
                  <Progress value={journey.completion_rate * 100} className="flex-1" />
                  <span className="text-sm">{Math.round(journey.completion_rate * 100)}%</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Coaching Style</Label>
                <Badge variant="secondary">{journey.coachgpt_personality}</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Suggested Modules</Label>
              <div className="flex flex-wrap gap-2">
                {journey.suggested_modules.map((module, index) => (
                  <Badge key={index} variant="outline">{module}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Builder Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {journey ? 'Update Learning Journey' : 'Create Adaptive Learning Journey'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            SARAH will analyze role pressures and organizational context to create a personalized learning path.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role Title</Label>
              <Input
                id="role"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., HR Generalist, Safety Manager"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind.charAt(0).toUpperCase() + ind.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgSize">Organization Size</Label>
              <Select value={orgSize} onValueChange={(value: any) => setOrgSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orgSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskScore">HR Risk Score (Optional)</Label>
              <Input
                id="riskScore"
                type="number"
                min="0"
                max="100"
                value={hrRiskScore || ''}
                onChange={(e) => setHrRiskScore(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Risk Areas (Select applicable areas)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonRiskAreas.map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={selectedRiskAreas.includes(area)}
                    onCheckedChange={() => handleRiskAreaToggle(area)}
                  />
                  <Label htmlFor={area} className="text-sm">
                    {area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea
              id="context"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any specific challenges, goals, or context for this learner..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={!isFormValid || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Generating Adaptive Journey...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                {journey ? 'Update' : 'Generate'} Learning Journey
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations Preview */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Similar Role Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((profile) => (
                <div key={profile.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{profile.role_title}</h4>
                    <Badge variant="outline">{profile.coaching_style}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {profile.priority_areas.slice(0, 3).map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile.industry} • {profile.org_size_category}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
