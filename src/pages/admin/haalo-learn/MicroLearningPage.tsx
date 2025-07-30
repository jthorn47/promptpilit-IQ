import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Clock, Target } from 'lucide-react';

export const MicroLearningPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Micro-Learning Builder</h1>
          <p className="text-muted-foreground">
            Create bite-sized learning modules that maximize engagement and retention.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Micro-Module
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Quick Concepts
            </CardTitle>
            <CardDescription>
              2-3 minute focused learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Modules</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg. Completion</span>
                <span className="font-medium">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Just-in-Time Learning
            </CardTitle>
            <CardDescription>
              Context-aware learning delivered when needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Triggered Sessions</span>
                <span className="font-medium">847</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate</span>
                <span className="font-medium">89%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Skill Reinforcement
            </CardTitle>
            <CardDescription>
              Spaced repetition for long-term retention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reinforcement Cycles</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retention Rate</span>
                <span className="font-medium">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Micro-Learning Modules</CardTitle>
          <CardDescription>
            Manage your library of micro-learning content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Micro-Modules Created Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building engaging micro-learning experiences for your learners.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Micro-Module
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroLearningPage;