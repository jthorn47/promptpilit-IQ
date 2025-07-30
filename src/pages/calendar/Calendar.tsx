import React, { useState } from 'react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const meetings = [
    {
      id: 1,
      title: "Weekly Team Standup",
      time: "09:00 AM",
      duration: "30 min",
      type: "recurring",
      location: "Conference Room A", 
      attendees: [
        { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face" },
        { name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
        { name: "Emily Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" }
      ],
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Client Presentation - Acme Corp",
      time: "02:00 PM", 
      duration: "60 min",
      type: "meeting",
      location: "Virtual (Zoom)",
      attendees: [
        { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face" },
        { name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
      ],
      date: "2024-01-15"
    },
    {
      id: 3,
      title: "Product Strategy Review",
      time: "10:30 AM",
      duration: "90 min", 
      type: "meeting",
      location: "Executive Boardroom",
      attendees: [
        { name: "Emily Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" },
        { name: "Michael Chen", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
        { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face" },
        { name: "David Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" }
      ],
      date: "2024-01-16"
    },
    {
      id: 4,
      title: "Budget Planning Session",
      time: "03:30 PM",
      duration: "45 min",
      type: "meeting", 
      location: "Finance Office",
      attendees: [
        { name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b107?w=150&h=150&fit=crop&crop=face" }
      ],
      date: "2024-01-17"
    }
  ];

  const todaysMeetings = meetings.filter(m => 
    new Date(m.date).toDateString() === new Date().toDateString()
  );

  const upcomingMeetings = meetings.filter(m => 
    new Date(m.date) > new Date()
  );

  const getTypeIcon = (type: string, location: string) => {
    if (location.includes('Virtual') || location.includes('Zoom')) {
      return <Video className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recurring': return 'secondary';
      case 'meeting': return 'default';
      default: return 'outline';
    }
  };

  return (
    <StandardPageLayout
      title="Calendar & Meetings"
      subtitle="Schedule and manage your meetings and appointments"
      badge={`${todaysMeetings.length} Today`}
      headerActions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      }
    >
      {/* Calendar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Meetings
            </CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Badge variant="outline">{meetings.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
            <p className="text-xs text-muted-foreground">Total meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Meeting
            </CardTitle>
            <MapPin className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {upcomingMeetings.length > 0 ? upcomingMeetings[0].time : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingMeetings.length > 0 ? upcomingMeetings[0].title : 'No upcoming meetings'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mini Calendar */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Calendar grid component would go here</p>
            <p className="text-sm mt-2">Showing {currentDate.toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Meeting List */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Today's Meetings</h3>
          {todaysMeetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No meetings scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todaysMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(meeting.type, meeting.location)}
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <Badge variant={getTypeColor(meeting.type)}>
                            {meeting.type}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{meeting.time} • {meeting.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{meeting.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-sm text-muted-foreground">Attendees:</span>
                          <div className="flex -space-x-2">
                            {meeting.attendees.slice(0, 3).map((attendee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={attendee.avatar} alt={attendee.name} />
                                <AvatarFallback className="text-xs">
                                  {attendee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {meeting.attendees.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  +{meeting.attendees.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(meeting.type, meeting.location)}
                      <div>
                        <h4 className="font-semibold">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.date).toLocaleDateString()} • {meeting.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{meeting.duration}</Badge>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
}