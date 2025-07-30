import React from "react";
import { Navigate } from "react-router-dom";
import { CourseSelectionWizard } from "@/components/CourseSelectionWizard";
import { useAuth } from "@/contexts/AuthContext";

export const CourseSelectionPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6">
      <CourseSelectionWizard redirectTo="/dashboard" />
    </div>
  );
};