import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Brain, TrendingUp } from 'lucide-react';

export const AIAssessmentsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI-Powered Assessments</h1>
          <p className="text-muted-foreground">
            Create intelligent assessments that adapt and provide personalized insights.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate AI Assessment
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              AI-Generated Questions
            </CardTitle>
            <CardDescription>
              Automatically create questions from content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generated Today</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quality Score</span>
                <span className="font-medium">96%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              Adaptive Difficulty
            </CardTitle>
            <CardDescription>
              Questions adjust based on learner performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Assessments</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Adaptation Rate</span>
                <span className="font-medium">87%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Smart Analytics
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Insights Generated</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="font-medium">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Assessment Library</CardTitle>
          <CardDescription>
            Manage your AI-powered assessment templates and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No AI Assessments Created Yet</h3>
            <p className="text-muted-foreground mb-4">
              Let AI help you create intelligent, adaptive assessments.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Your First AI Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssessmentsPage;