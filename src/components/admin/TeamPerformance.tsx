import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Mail, 
  FileText, 
  MessageSquare, 
  CheckCircle,
  Download,
  Calendar,
  DollarSign,
  Users,
  Activity
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  metrics: {
    closedWon: number;
    totalRevenue: number;
    winRate: number;
    proposalsSent: number;
    emailsSent: number;
    repliesReceived: number;
    pipelineValue: number;
    followUpCompliance: number;
  };
  weeklyActivity: {
    day: string;
    emailsSent: number;
    proposalsGenerated: number;
    repliesReceived: number;
  }[];
}

// Mock data - will be replaced with real data from PropGEN + CRM
const mockTeamData: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Senior Sales Rep",
    metrics: {
      closedWon: 12,
      totalRevenue: 185000,
      winRate: 68,
      proposalsSent: 24,
      emailsSent: 156,
      repliesReceived: 89,
      pipelineValue: 95000,
      followUpCompliance: 85
    },
    weeklyActivity: [
      { day: "Mon", emailsSent: 8, proposalsGenerated: 2, repliesReceived: 5 },
      { day: "Tue", emailsSent: 12, proposalsGenerated: 3, repliesReceived: 7 },
      { day: "Wed", emailsSent: 15, proposalsGenerated: 1, repliesReceived: 9 },
      { day: "Thu", emailsSent: 10, proposalsGenerated: 2, repliesReceived: 6 },
      { day: "Fri", emailsSent: 6, proposalsGenerated: 1, repliesReceived: 4 },
    ]
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@company.com",
    role: "Sales Rep",
    metrics: {
      closedWon: 8,
      totalRevenue: 124000,
      winRate: 61,
      proposalsSent: 18,
      emailsSent: 134,
      repliesReceived: 72,
      pipelineValue: 78000,
      followUpCompliance: 72
    },
    weeklyActivity: [
      { day: "Mon", emailsSent: 6, proposalsGenerated: 1, repliesReceived: 4 },
      { day: "Tue", emailsSent: 9, proposalsGenerated: 2, repliesReceived: 5 },
      { day: "Wed", emailsSent: 11, proposalsGenerated: 0, repliesReceived: 6 },
      { day: "Thu", emailsSent: 8, proposalsGenerated: 1, repliesReceived: 3 },
      { day: "Fri", emailsSent: 5, proposalsGenerated: 0, repliesReceived: 2 },
    ]
  },
  {
    id: "3",
    name: "Emma Thompson",
    email: "emma.thompson@company.com",
    role: "Sales Rep",
    metrics: {
      closedWon: 6,
      totalRevenue: 98000,
      winRate: 55,
      proposalsSent: 16,
      emailsSent: 112,
      repliesReceived: 58,
      pipelineValue: 65000,
      followUpCompliance: 91
    },
    weeklyActivity: [
      { day: "Mon", emailsSent: 5, proposalsGenerated: 1, repliesReceived: 3 },
      { day: "Tue", emailsSent: 7, proposalsGenerated: 1, repliesReceived: 4 },
      { day: "Wed", emailsSent: 9, proposalsGenerated: 2, repliesReceived: 5 },
      { day: "Thu", emailsSent: 6, proposalsGenerated: 0, repliesReceived: 2 },
      { day: "Fri", emailsSent: 4, proposalsGenerated: 1, repliesReceived: 3 },
    ]
  }
];

const timeRanges = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "ytd", label: "Year to date" }
];

export const TeamPerformance = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  const [sortBy, setSortBy] = useState("totalRevenue");

  const sortedTeamData = useMemo(() => {
    return [...mockTeamData].sort((a, b) => {
      const aValue = a.metrics[sortBy as keyof typeof a.metrics];
      const bValue = b.metrics[sortBy as keyof typeof b.metrics];
      return bValue - aValue;
    });
  }, [sortBy]);

  const exportData = (format: 'csv' | 'json') => {
    const data = sortedTeamData.map(member => ({
      Name: member.name,
      Email: member.email,
      Role: member.role,
      ClosedWon: member.metrics.closedWon,
      TotalRevenue: member.metrics.totalRevenue,
      WinRate: member.metrics.winRate,
      ProposalsSent: member.metrics.proposalsSent,
      EmailsSent: member.metrics.emailsSent,
      RepliesReceived: member.metrics.repliesReceived,
      PipelineValue: member.metrics.pipelineValue,
      FollowUpCompliance: member.metrics.followUpCompliance
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const csvContent = [headers, ...data.map(row => Object.values(row).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-performance-${selectedTimeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-performance-${selectedTimeRange}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 80) return "text-green-600";
    if (compliance >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getActivityIntensity = (value: number, max: number) => {
    const intensity = Math.min(value / max, 1);
    if (intensity > 0.8) return "bg-green-500";
    if (intensity > 0.6) return "bg-green-400";
    if (intensity > 0.4) return "bg-green-300";
    if (intensity > 0.2) return "bg-green-200";
    if (intensity > 0) return "bg-green-100";
    return "bg-gray-100";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Performance</h1>
          <p className="text-muted-foreground">Analyze team sales performance and activity</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Activity Heatmap</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Follow-up Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalRevenue">Total Revenue</SelectItem>
                <SelectItem value="closedWon">Closed-Won Count</SelectItem>
                <SelectItem value="winRate">Win Rate</SelectItem>
                <SelectItem value="proposalsSent">Proposals Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sortedTeamData.slice(0, 3).map((member, index) => (
              <Card key={member.id} className={index === 0 ? "border-yellow-200 bg-yellow-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                        <span className="text-2xl font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenue:</span>
                      <span className="font-medium">${member.metrics.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Closed-Won:</span>
                      <span className="font-medium">{member.metrics.closedWon}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Win Rate:</span>
                      <span className="font-medium">{member.metrics.winRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Complete Team Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Closed-Won</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Proposals Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTeamData.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">#{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>${member.metrics.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell>{member.metrics.closedWon}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{member.metrics.winRate}%</span>
                          <Progress value={member.metrics.winRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{member.metrics.proposalsSent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity Heatmap</CardTitle>
              <CardDescription>Email activity, proposals generated, and replies received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedTeamData.map((member) => (
                  <div key={member.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{member.metrics.emailsSent}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{member.metrics.proposalsSent}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{member.metrics.repliesReceived}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {member.weeklyActivity.map((day) => (
                        <div key={day.day} className="space-y-1">
                          <div className="text-xs text-center font-medium">{day.day}</div>
                          <div className="space-y-1">
                            <div 
                              className={`h-4 rounded ${getActivityIntensity(day.emailsSent, 15)}`}
                              title={`${day.emailsSent} emails sent`}
                            />
                            <div 
                              className={`h-4 rounded ${getActivityIntensity(day.proposalsGenerated, 3)}`}
                              title={`${day.proposalsGenerated} proposals generated`}
                            />
                            <div 
                              className={`h-4 rounded ${getActivityIntensity(day.repliesReceived, 10)}`}
                              title={`${day.repliesReceived} replies received`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Value by Representative</CardTitle>
              <CardDescription>Current pipeline value and opportunity distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedTeamData.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{member.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{member.role}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${member.metrics.pipelineValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress 
                      value={(member.metrics.pipelineValue / Math.max(...sortedTeamData.map(m => m.metrics.pipelineValue))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Compliance Rate</CardTitle>
              <CardDescription>How often team members follow AI recommendations and prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Compliance Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Improvement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTeamData.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getComplianceColor(member.metrics.followUpCompliance)}`}>
                            {member.metrics.followUpCompliance}%
                          </span>
                          <Progress value={member.metrics.followUpCompliance} className="w-20 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          member.metrics.followUpCompliance >= 80 ? "default" :
                          member.metrics.followUpCompliance >= 60 ? "secondary" : "destructive"
                        }>
                          {member.metrics.followUpCompliance >= 80 ? "Excellent" :
                           member.metrics.followUpCompliance >= 60 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {member.metrics.followUpCompliance >= 80 ? "Keep up the great work!" :
                           member.metrics.followUpCompliance >= 60 ? "Consider using AI suggestions more often" : 
                           "Focus on following AI recommendations"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};