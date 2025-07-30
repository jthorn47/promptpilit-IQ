import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, Star, Trophy } from 'lucide-react';

export const BadgesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Badges & Achievements</h1>
          <p className="text-muted-foreground">
            Create and manage recognition systems to motivate and engage learners.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Badge
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Skill Badges
            </CardTitle>
            <CardDescription>
              Recognition for mastering specific skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Active Badges</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Leadership</Badge>
                <Badge variant="secondary">Safety</Badge>
                <Badge variant="secondary">Compliance</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-primary" />
              Achievement Levels
            </CardTitle>
            <CardDescription>
              Progressive recognition tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Level Tiers</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Bronze</Badge>
                <Badge variant="outline">Silver</Badge>
                <Badge variant="outline">Gold</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-primary" />
              Leaderboards
            </CardTitle>
            <CardDescription>
              Friendly competition and rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Competitions</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Participants</span>
                <span className="font-medium">127</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Management</CardTitle>
          <CardDescription>
            Design and configure your recognition system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Badges Created Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start recognizing learner achievements with custom badges and rewards.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Design Your First Badge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgesPage;