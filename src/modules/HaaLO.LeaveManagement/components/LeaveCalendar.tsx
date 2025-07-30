import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function LeaveCalendar() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Calendar</h1>
          <p className="text-muted-foreground">Visual overview of employee leave schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>December 2024</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Employee leave schedule and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Sun</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Mon</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Tue</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Wed</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Thu</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Fri</div>
            <div className="text-center text-sm font-medium text-muted-foreground p-2">Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <div key={day} className="border rounded-lg p-2 min-h-24 bg-background">
                <div className="text-sm font-medium mb-1">{day}</div>
                {day === 19 && (
                  <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded mb-1">
                    Mike D. - Sick
                  </div>
                )}
                {day >= 23 && day <= 27 && (
                  <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1">
                    Sarah J. - Vacation
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-sm">Vacation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm">Sick Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm">Personal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 rounded"></div>
              <span className="text-sm">Maternity/Paternity</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mike Davis</p>
                  <p className="text-sm text-muted-foreground">Sick Leave</p>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Today</span>
              </div>
              <div className="text-sm text-muted-foreground">
                No other employees are out today
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}