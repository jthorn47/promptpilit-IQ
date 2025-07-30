
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CasesManager } from "@/modules/CaseManagement/components/CasesManager";
import { PulseCaseForm } from "@/modules/CaseManagement/components/PulseCaseForm";
import { usePulseCases } from "@/modules/CaseManagement/hooks/usePulseCases";
import { toast } from "sonner";
import { CreateCaseRequest } from '@/modules/CaseManagement/types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const PulseAllCasesPage = () => {
  const navigate = useNavigate();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { createCase, refetch } = usePulseCases();

  const handleCreateCase = async (data: CreateCaseRequest) => {
    try {
      setIsCreating(true);
      await createCase(data);
      toast.success("Case created successfully!");
      setIsCreateFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground mb-8 rounded-lg">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Good Morning, jeffrey!</h1>
          <p className="text-primary-foreground/80">Welcome back - Ready to get things done?</p>
        </div>
      </div>

      {/* Navigation breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Admin Home
        </Button>
        <span>/</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/pulse')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Pulse Dashboard
        </Button>
      </div>

      {/* Pulse CMS Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Pulse CMS</h2>
            <p className="text-muted-foreground">Track and manage client support cases</p>
          </div>
          <Button onClick={() => setIsCreateFormOpen(true)}>
            New Case
          </Button>
        </div>
      </div>

      <CasesManager />

      <PulseCaseForm
        open={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
        onSuccess={() => {
          refetch();
          setIsCreateFormOpen(false);
        }}
      />
    </>
  );
};
