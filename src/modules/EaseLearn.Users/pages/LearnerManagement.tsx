import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Search, GraduationCap, Clock } from 'lucide-react';
import { microservicesClient, User } from '@/services/api/microservices';
import { useToast } from '@/hooks/use-toast';

export const LearnerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [learners, setLearners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLearners = async () => {
    try {
      console.log('🔍 LearnerManagement: Fetching users via microservice...');
      // For now, using current user as demo - in real app would fetch all users with learner role
      const currentUser = await microservicesClient.getCurrentUser();
      console.log('🔍 LearnerManagement: Current user:', currentUser);
      
      // Mock data enhanced with real user
      const mockLearners = [
        {
          id: currentUser.user?.id || '1',
          user_id: currentUser.user?.user_id || 'user-1',
          email: currentUser.user?.email || 'current.user@company.com',
          created_at: currentUser.user?.created_at || new Date().toISOString(),
          updated_at: currentUser.user?.updated_at || new Date().toISOString(),
          company_id: currentUser.user?.company_id,
          completed_tours: currentUser.user?.completed_tours || [],
          is_employee: currentUser.user?.is_employee || true,
        }
      ];
      
      setLearners(mockLearners);
    } catch (error) {
      console.error('🔍 LearnerManagement: Error fetching learners:', error);
      toast({
        title: 'Error loading learners',
        description: 'Failed to fetch learner data. Using fallback mode.',
        variant: 'destructive'
      });
      setLearners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const filteredLearners = learners.filter(learner =>
    learner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Learner Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Learner
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learners.length}</div>
            <p className="text-xs text-muted-foreground">Via microservice API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">50% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Learners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Learner Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading learners...</div>
          ) : (
            <div className="space-y-4">
              {filteredLearners.map((learner) => (
                <div key={learner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{learner.email.split('@')[0]}</div>
                    <div className="text-sm text-muted-foreground">{learner.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {learner.is_employee ? 'Employee' : 'External User'}
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-medium">
                      Tours: {learner.completed_tours.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(learner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(learner.is_employee ? 'active' : 'inactive')}
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredLearners.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No learners found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first learner.'}
          </p>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Learner
          </Button>
        </div>
      )}
    </div>
  );
};