import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, MessageSquare, Share2 } from 'lucide-react';

export const SocialLearningPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Learning Hub</h1>
          <p className="text-muted-foreground">
            Enable collaborative learning through peer interaction and knowledge sharing.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Discussion
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Study Groups
            </CardTitle>
            <CardDescription>
              Collaborative learning communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Groups</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Members</span>
                <span className="font-medium">284</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Discussions
            </CardTitle>
            <CardDescription>
              Knowledge sharing and Q&A
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Threads</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Daily Posts</span>
                <span className="font-medium">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-primary" />
              Peer Reviews
            </CardTitle>
            <CardDescription>
              Collaborative assessment and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reviews Completed</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg. Rating</span>
                <span className="font-medium">4.7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Learning Activity</CardTitle>
          <CardDescription>
            Recent collaborative learning interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Social Learning Activities Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create discussion forums, study groups, and peer review systems.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start a Discussion Forum
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialLearningPage;