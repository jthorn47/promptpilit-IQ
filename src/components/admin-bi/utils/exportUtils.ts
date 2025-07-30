import { useToast } from "@/hooks/use-toast";
import type { DepartmentData } from "../types";

export const useExportUtils = () => {
  const { toast } = useToast();

  const exportToPDF = () => {
    toast({
      title: "Export Started",
      description: "Your dashboard PDF is being prepared for download.",
    });
    // TODO: Implement PDF export
  };

  const exportToCSV = (departmentData: DepartmentData[]) => {
    // Create CSV content
    const csvContent = [
      ['Employee Name', 'Email', 'Department', 'Assigned Trainings', 'Completed Trainings', 'Compliance Rate'].join(','),
      ...departmentData.map(dept => 
        [dept.department, '', '', dept.total, dept.completed, `${((dept.completed / dept.total) * 100).toFixed(1)}%`].join(',')
      )
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Compliance report downloaded successfully.",
    });
  };

  return { exportToPDF, exportToCSV };
};