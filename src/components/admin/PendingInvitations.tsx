import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataTable } from '@/components/ui/data-table';
import { MoreHorizontal, Mail, UserX, RefreshCw, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Invitation {
  id: string;
  email: string;
  role_assignment: {
    role: string;
    name?: string;
  };
  user_attributes: Record<string, any>;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  created_at: string;
  expires_at: string;
  invited_by: string;
  company_id?: string;
  client_id?: string;
}

export const PendingInvitations: React.FC = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const invitationsData = (data || []).map(invitation => ({
        ...invitation,
        role_assignment: invitation.role_assignment as { role: string; name?: string },
        user_attributes: invitation.user_attributes as Record<string, any>,
        status: invitation.status as 'pending' | 'accepted' | 'expired' | 'revoked',
      }));
      setInvitations(invitationsData);
    } catch (error: any) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Must be authenticated');
      }

      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: invitation.email,
          name: invitation.role_assignment.name,
          role: invitation.role_assignment.role,
          company_id: invitation.company_id,
          client_id: invitation.client_id,
          attributes: invitation.user_attributes,
          invited_by: user.id,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Success",
          description: `Invitation resent to ${invitation.email}`,
        });
        loadInvitations();
      }
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'revoked' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation revoked",
      });
      loadInvitations();
    } catch (error: any) {
      console.error('Revoke error:', error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'pending' && isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'revoked':
        return <Badge variant="outline">Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="font-medium">{row.email}</div>
          {row.role_assignment.name && (
            <div className="text-sm text-muted-foreground">
              {row.role_assignment.name}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'role_assignment.role',
      header: 'Role',
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline">
          {row.role_assignment.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => getStatusBadge(row.status, row.expires_at),
    },
    {
      accessorKey: 'created_at',
      header: 'Invited',
      cell: ({ row }: { row: any }) => (
        <div className="text-sm">
          {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: 'expires_at',
      header: 'Expires',
      cell: ({ row }: { row: any }) => {
        const expiresAt = new Date(row.expires_at);
        const isExpired = expiresAt < new Date();
        
        return (
          <div className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
            {formatDistanceToNow(expiresAt, { addSuffix: true })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const invitation = row;
        const isExpired = new Date(invitation.expires_at) < new Date();
        const canResend = invitation.status === 'pending' || isExpired;
        const canRevoke = invitation.status === 'pending';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log('View details', invitation)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canResend && (
                <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Invitation
                </DropdownMenuItem>
              )}
              {canRevoke && (
                <DropdownMenuItem 
                  onClick={() => handleRevokeInvitation(invitation.id)}
                  className="text-destructive"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Revoke Invitation
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={invitations}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};