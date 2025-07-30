import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Vault, FileText, Users, Shield } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';
import { DocumentStorageModal } from '@/components/features/DocumentStorageModal';
import { AccessControlModal } from '@/components/features/AccessControlModal';
import { ComplianceModal } from '@/components/features/ComplianceModal';

export const VaultPage: React.FC = () => {
  const navigate = useNavigate();
  const [comingSoonModal, setComingSoonModal] = useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: ''
  });
  const [documentStorageOpen, setDocumentStorageOpen] = useState(false);
  const [accessControlOpen, setAccessControlOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  // Feature flags
  const documentStorageEnabled = useFeatureFlag('documentStorage');
  const accessControlEnabled = useFeatureFlag('accessControl');
  const complianceEnabled = useFeatureFlag('vaultCompliance');

  const handleFeatureClick = (featureName: string, featureKey: string, enabled: boolean) => {
    if (enabled) {
      // Handle enabled features with actual functionality
      switch (featureKey) {
        case 'documentStorage':
          setDocumentStorageOpen(true);
          break;
        case 'accessControl':
          setAccessControlOpen(true);
          break;
        case 'vaultCompliance':
          setComplianceOpen(true);
          break;
        default:
          console.log(`Opening ${featureName}...`);
      }
    } else {
      // This should not happen since all features are now enabled
      setComingSoonModal({ isOpen: true, featureName });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/halo-iq')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Halo IQ
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Vault className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">The Vault</h1>
              <p className="text-muted-foreground">Secure data storage and management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Document Storage', 'documentStorage', documentStorageEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Document Storage</CardTitle>
              {documentStorageEnabled && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Securely store and organize critical business documents with enterprise-grade encryption.
            </CardDescription>
          </CardContent>
        </Card>

        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Access Control', 'accessControl', accessControlEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Access Control</CardTitle>
              {accessControlEnabled && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Manage user permissions and control who can access sensitive information.
            </CardDescription>
          </CardContent>
        </Card>

        <Card 
          className="border-border cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleFeatureClick('Compliance', 'vaultCompliance', complianceEnabled)}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Compliance</CardTitle>
              {complianceEnabled && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Ensure regulatory compliance with automated audit trails and retention policies.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, featureName: '' })}
        featureName={comingSoonModal.featureName}
      />

      <DocumentStorageModal
        isOpen={documentStorageOpen}
        onClose={() => setDocumentStorageOpen(false)}
      />

      <AccessControlModal
        isOpen={accessControlOpen}
        onClose={() => setAccessControlOpen(false)}
      />

      <ComplianceModal
        isOpen={complianceOpen}
        onClose={() => setComplianceOpen(false)}
      />
    </div>
  );
};