import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Users, BarChart3 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const TimeTrackPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/halo-iq')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Halo IQ
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">TimeTrack</h1>
              <p className="text-muted-foreground">Time and attendance tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Time Tracking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Accurate time tracking with clock-in/out functionality and automated timesheets.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Attendance Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Monitor employee attendance patterns and manage leave requests efficiently.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Time Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Detailed reporting and analytics for productivity and attendance insights.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};