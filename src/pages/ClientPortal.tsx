import React, { useState } from 'react';
import { ClientDashboard } from '@/modules/CaseManagement/components/ClientDashboard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

// Mock company data - in real app this would come from auth/context
const MOCK_COMPANY = {
  id: "mock-company-id",
  name: "Demo Company Inc."
};

export const ClientPortal = () => {
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    type: '',
    priority: 'medium',
    description: ''
  });

  const handleCreateCase = () => {
    // In real app, this would create a case via API
    toast.success('Case created successfully!');
    setShowCreateCase(false);
    setNewCase({ title: '', type: '', priority: 'medium', description: '' });
  };

  if (showCreateCase) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowCreateCase(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Create New Case</h1>
            <p className="text-muted-foreground">Submit a new support request</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Case Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Case Title</label>
                <Input
                  value={newCase.title}
                  onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={newCase.type} onValueChange={(value) => setNewCase(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="payroll">Payroll</SelectItem>
                      <SelectItem value="benefits">Benefits</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="general_support">General Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select value={newCase.priority} onValueChange={(value) => setNewCase(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about your request..."
                  rows={6}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateCase(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCase}
                  disabled={!newCase.title || !newCase.type || !newCase.description}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Case
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <ClientDashboard
          companyId={MOCK_COMPANY.id}
          companyName={MOCK_COMPANY.name}
          onCreateCase={() => setShowCreateCase(true)}
        />
      </div>
    </div>
  );
};