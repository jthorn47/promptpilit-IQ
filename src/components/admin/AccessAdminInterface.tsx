import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGuard } from '@/components/PermissionGuard';
import { RoleTemplatesPanel } from './access-admin/RoleTemplatesPanel';
import { UserAttributeManager } from './access-admin/UserAttributeManager';
import { PermissionPolicyMatrix } from './access-admin/PermissionPolicyMatrix';
import { DebugAuditView } from './access-admin/DebugAuditView';
import { AttributeSchemaManager } from './access-admin/AttributeSchemaManager';
import { UserInvitationModal } from './UserInvitationModal';
import { PendingInvitations } from './PendingInvitations';
import { Button } from '@/components/ui/button';
import { Shield, Users, Settings, Bug, Database, UserPlus } from 'lucide-react';

export const AccessAdminInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [refreshInvitations, setRefreshInvitations] = useState(0);

  return (
    <PermissionGuard requiredPermission="system:manage" fallback={
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Access denied - System management required</p>
      </div>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Access Control Administration</h1>
            <p className="text-muted-foreground">
              Manage roles, permissions, user attributes, and access policies
            </p>
          </div>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Templates
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Attributes
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permission Policies
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug & Audit
            </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Attribute Schema
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <RoleTemplatesPanel />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserAttributeManager />
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <PermissionPolicyMatrix />
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <DebugAuditView />
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <AttributeSchemaManager />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <PendingInvitations key={refreshInvitations} />
          </TabsContent>
        </Tabs>

        <UserInvitationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvitationSent={() => {
            setRefreshInvitations(prev => prev + 1);
            setActiveTab('invitations');
          }}
        />
      </div>
    </PermissionGuard>
  );
};