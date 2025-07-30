import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Users, Clock, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Report {
  id: string;
  title: string;
  description: string;
  report_content: string;
  category: string;
  status: string;
  created_by: string;
  created_at: string;
  usage_count: number;
  template_config: any;
}

export const AdminReportBoard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingReports();
  }, []);

  const fetchPendingReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'approved', 
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
          published_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report approved and published successfully"
      });

      fetchPendingReports();
      setSelectedReport(null);
    } catch (error: any) {
      console.error('Error approving report:', error);
      toast({
        title: "Error", 
        description: "Failed to approve report",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'draft' })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report sent back to draft status"
      });

      fetchPendingReports();
      setSelectedReport(null);
    } catch (error: any) {
      console.error('Error rejecting report:', error);
      toast({
        title: "Error",
        description: "Failed to reject report", 
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Report Board</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pending reports...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Report Board</h1>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              All Caught Up!
            </CardTitle>
            <CardDescription>No reports pending approval at this time.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Pending Approval ({reports.length})
              </CardTitle>
              <CardDescription>Reports submitted for admin review and approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedReport?.id === report.id ? 'ring-2 ring-primary shadow-lg bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Pending
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {report.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    <Badge variant="outline">
                      {report.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="sticky top-6">
            {selectedReport ? (
              <>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedReport.title}</CardTitle>
                      <CardDescription>{selectedReport.description}</CardDescription>
                    </div>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Created: {new Date(selectedReport.created_at).toLocaleDateString()}</span>
                    <Badge variant="outline">{selectedReport.category}</Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApprove(selectedReport.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Publish
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedReport.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Send Back
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <h4 className="font-medium mb-3">Report Preview</h4>
                  <div className="max-h-96 overflow-y-auto bg-muted/50 rounded p-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {selectedReport.report_content}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Report</h3>
                <p className="text-muted-foreground">Choose a report from the list to preview and approve</p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};