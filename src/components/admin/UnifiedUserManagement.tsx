import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck,
  UserX,
  Shield,
  Eye,
  Settings,
  Clock,
  Filter,
  MoreHorizontal,
  Mail,
  RefreshCw,
  UserCog,
  Building
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { UserInvitationModal } from "./UserInvitationModal";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

// Types
interface UnifiedUser {
  id: string;
  type: 'active' | 'pending' | 'expired' | 'revoked';
  name?: string;
  email: string;
  role: string;
  roleName?: string;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  companyName?: string;
  invitedDate?: string;
  lastLogin?: string;
  acceptedDate?: string;
  invitationId?: string;
  userId?: string;
  avatar?: string;
}

interface StatusCounts {
  total: number;
  active: number;
  pending: number;
  expired: number;
  revoked: number;
}

export const UnifiedUserManagement = () => {
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    revoked: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { toast } = useToast();

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch active users (profiles + user_roles)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (userRolesError) throw userRolesError;

      // Create a map of user roles by user_id
      const userRolesMap = new Map();
      userRolesData?.forEach(role => {
        if (!userRolesMap.has(role.user_id)) {
          userRolesMap.set(role.user_id, []);
        }
        userRolesMap.get(role.user_id).push(role);
      });

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("user_invitations")
        .select(`
          id,
          email,
          role_assignment,
          user_attributes,
          status,
          created_at,
          expires_at,
          accepted_at,
          company_id,
          client_id
        `)
        .order("created_at", { ascending: false });

      if (invitationsError) throw invitationsError;

      // Fetch companies for role display
      const { data: companiesData, error: companiesError } = await supabase
        .from('company_settings')
        .select('id, company_name');

      if (companiesError) throw companiesError;

      const companiesMap = new Map(companiesData?.map(c => [c.id, c.company_name]) || []);

      // Transform active users
      const activeUsers: UnifiedUser[] = (profilesData || []).map(profile => {
        const userRoles = userRolesMap.get(profile.user_id) || [];
        const primaryRole = userRoles[0];
        const companyName = primaryRole?.company_id ? companiesMap.get(primaryRole.company_id) : undefined;
        
        return {
          id: profile.user_id,
          type: 'active',
          name: profile.email.split('@')[0], // Extract name from email for now
          email: profile.email,
          role: primaryRole?.role || 'learner',
          roleName: formatRoleLabel(primaryRole?.role || 'learner'),
          status: 'active',
          companyName,
          invitedDate: profile.created_at,
          lastLogin: profile.updated_at, // Approximate - could enhance with real session data
          acceptedDate: profile.created_at,
          userId: profile.user_id,
          avatar: undefined
        };
      });

      // Transform invitations
      const invitationUsers: UnifiedUser[] = (invitationsData || []).map(invitation => {
        const roleAssignment = invitation.role_assignment as { role: string; name?: string } | null;
        const status = getInvitationStatus(invitation);
        const companyName = invitation.company_id ? companiesMap.get(invitation.company_id) : undefined;
        
        return {
          id: invitation.id,
          type: status,
          email: invitation.email,
          role: roleAssignment?.role || 'learner',
          roleName: formatRoleLabel(roleAssignment?.role || 'learner'),
          status,
          companyName,
          invitedDate: invitation.created_at,
          acceptedDate: invitation.accepted_at,
          invitationId: invitation.id,
          avatar: undefined
        };
      });

      // Combine and deduplicate (prefer active users over invitations)
      const emailMap = new Map<string, UnifiedUser>();
      
      // Add active users first (they take priority)
      activeUsers.forEach(user => {
        emailMap.set(user.email, user);
      });
      
      // Add invitations only if no active user with same email exists
      invitationUsers.forEach(user => {
        if (!emailMap.has(user.email)) {
          emailMap.set(user.email, user);
        }
      });

      const allUsers = Array.from(emailMap.values());
      setUsers(allUsers);

      // Calculate status counts
      const counts = allUsers.reduce((acc, user) => {
        acc.total++;
        acc[user.status as keyof StatusCounts]++;
        return acc;
      }, { total: 0, active: 0, pending: 0, expired: 0, revoked: 0 });

      setStatusCounts(counts);

    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInvitationStatus = (invitation: any): 'pending' | 'expired' | 'revoked' => {
    if (invitation.status === 'revoked') return 'revoked';
    
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (expiresAt < now) return 'expired';
    return 'pending';
  };

  const formatRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'company_admin': 'Company Admin',
      'client_admin': 'Client Admin',
      'learner': 'Learner',
      'admin': 'Admin',
      'internal_staff': 'Internal Staff'
    };
    return roleMap[role] || role;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'revoked':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('admin') || role.includes('Admin')) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    if (role === 'internal_staff') {
      return <Building className="h-4 w-4 text-purple-500" />;
    }
    return <Users className="h-4 w-4 text-gray-500" />;
  };

  const handleViewProfile = async (user: UnifiedUser) => {
    toast({
      title: "View Profile",
      description: `Viewing profile for ${user.email}`,
    });
    // TODO: Navigate to user profile page or open modal
  };

  const handleEditRole = async (user: UnifiedUser) => {
    toast({
      title: "Edit Role",
      description: `Edit role functionality for ${user.email} - Coming soon`,
    });
    // TODO: Open role editing modal
  };

  const handleDeactivateUser = async (user: UnifiedUser) => {
    if (!user.userId) return;

    try {
      // Remove user roles to effectively deactivate
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${user.email} has been deactivated`,
      });
      
      fetchAllUsers(); // Refresh data
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    }
  };

  const handleReactivateUser = async (user: UnifiedUser) => {
    toast({
      title: "Reactivate User",
      description: `Reactivation functionality for ${user.email} - Coming soon`,
    });
    // TODO: Implement user reactivation logic
  };

  const handleResendInvite = async (user: UnifiedUser) => {
    if (!user.invitationId) return;

    try {
      const { error } = await supabase.functions.invoke('send-user-invitation', {
        body: { invitationId: user.invitationId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation resent to ${user.email}`,
      });
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Error", 
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvite = async (user: UnifiedUser) => {
    if (!user.invitationId) return;

    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'revoked' })
        .eq('id', user.invitationId);

      if (error) throw error;

      toast({
        title: "Success", 
        description: `Invitation revoked for ${user.email}`,
      });
      
      fetchAllUsers(); // Refresh data
    } catch (error) {
      console.error("Error revoking invitation:", error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Define table columns
  const columns = [
    {
      header: "User",
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">{user.name || user.email.split('@')[0]}</h3>
                {getRoleIcon(user.role)}
              </div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {user.companyName && (
                <p className="text-xs text-muted-foreground">{user.companyName}</p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: "Role",
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        return (
          <Badge variant="outline" className="text-xs">
            {user.roleName}
          </Badge>
        );
      }
    },
    {
      header: "Status", 
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        return (
          <Badge variant={getStatusBadgeVariant(user.status) as any} className="capitalize">
            {user.status}
          </Badge>
        );
      }
    },
    {
      header: "Invited Date",
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        return user.invitedDate ? format(new Date(user.invitedDate), 'MMM dd, yyyy') : '-';
      }
    },
    {
      header: "Last Activity",
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        if (user.status === 'active' && user.lastLogin) {
          return format(new Date(user.lastLogin), 'MMM dd, yyyy');
        }
        if (user.acceptedDate) {
          return format(new Date(user.acceptedDate), 'MMM dd, yyyy');
        }
        return '-';
      }
    },
    {
      header: "Actions",
      cell: ({ row }: { row: any }) => {
        const user = row as UnifiedUser;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {(user.status === 'pending' || user.status === 'expired') && (
                <>
                  <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Invite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRevokeInvite(user)}>
                    <UserX className="h-4 w-4 mr-2" />
                    Revoke Invite  
                  </DropdownMenuItem>
                </>
              )}
              
              {user.status === 'active' && (
                <>
                  <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditRole(user)}>
                    <UserCog className="h-4 w-4 mr-2" />
                    Edit Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeactivateUser(user)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate User
                  </DropdownMenuItem>
                </>
              )}
              
              {user.status === 'revoked' && (
                <DropdownMenuItem onClick={() => handleReactivateUser(user)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Reactivate User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <StandardPageLayout
      title="User Management"
      subtitle="Manage user accounts, invitations, and access control"
      headerActions={
        <Button onClick={() => setShowInviteModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      }
      onRefresh={fetchAllUsers}
      isRefreshing={loading}
    >
      <div className="space-y-6">

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.expired}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revoked</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.revoked}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="company_admin">Company Admin</SelectItem>
            <SelectItem value="client_admin">Client Admin</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
            <SelectItem value="internal_staff">Internal Staff</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredUsers}
            searchKey="email"
            searchPlaceholder="Search users..."
            loading={loading}
          />
        </CardContent>
      </Card>

        {/* User Invitation Modal */}
        <UserInvitationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvitationSent={() => {
            fetchAllUsers();
            setShowInviteModal(false);
          }}
        />
      </div>
    </StandardPageLayout>
  );
};