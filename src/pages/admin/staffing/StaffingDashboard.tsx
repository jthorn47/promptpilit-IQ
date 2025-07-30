import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, MapPin, Target, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { PopDashboard } from './components/PopDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AdminDashboard } from './components/AdminDashboard';

interface StaffingUserRole {
  id: string;
  role: 'pop' | 'recruiter' | 'admin';
  territory_id: string | null;
  commission_rate: number;
  is_active: boolean;
  territory?: {
    name: string;
    state: string;
    cities: string[];
    is_locked: boolean;
  };
}

const StaffingDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<StaffingUserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchUserRole(user.id);
      } else {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staffing_user_roles')
        .select(`
          *,
          territory:territories(
            name,
            state,
            cities,
            is_locked
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setError('No staffing role assigned. Please contact your administrator.');
        return;
      }

      setUserRole(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load user role information.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Required</h3>
              <p className="text-gray-600 mb-4">
                {error || 'You need a staffing role to access this dashboard.'}
              </p>
              <p className="text-sm text-gray-500">
                Please contact your administrator to get assigned a role.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recruiter':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Platform Administrator';
      case 'pop':
        return 'Partner Office Program';
      case 'recruiter':
        return 'Recruiter';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {user?.email?.split('@')[0]}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {getRoleTitle(userRole.role)} Dashboard
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${getRoleBadgeColor(userRole.role)} mb-2`}>
                  {getRoleTitle(userRole.role)}
                </Badge>
                {userRole.territory && (
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="w-4 h-4" />
                    <span>{userRole.territory.name}, {userRole.territory.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific Dashboard Content */}
        {userRole.role === 'pop' && <PopDashboard userRole={userRole} />}
        {userRole.role === 'recruiter' && <RecruiterDashboard userRole={userRole} />}
        {userRole.role === 'admin' && <AdminDashboard userRole={userRole} />}
      </div>
    </div>
  );
};

export default StaffingDashboard;