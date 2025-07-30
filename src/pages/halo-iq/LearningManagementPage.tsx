import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const LearningManagementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/halo-iq')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to HALO IQ
        </Button>
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Management</h1>
            <p className="text-muted-foreground">Manage courses and training programs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Browse and manage available training courses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create and manage structured training programs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Monitor learner progress and completion rates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};