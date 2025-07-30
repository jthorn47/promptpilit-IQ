import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { ReportType, ReportFilters, ReportData, ReportExportOptions } from '../types';
import { toast } from 'sonner';
import { useState } from 'react';

export const useTimeReports = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const reportConfigs = TimeTrackService.getReportConfigs();

  const generateReportMutation = useMutation({
    mutationFn: ({ filters, page, size }: { filters: ReportFilters; page?: number; size?: number }) =>
      TimeTrackService.generateReport(filters, page || currentPage, size || pageSize),
    onSuccess: () => {
      toast.success('Report generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  const exportReportMutation = useMutation({
    mutationFn: ({ reportData, options }: { reportData: ReportData; options: ReportExportOptions }) =>
      TimeTrackService.exportReport(reportData, options),
    onSuccess: (downloadUrl, { options }) => {
      toast.success(`${options.format.toUpperCase()} export ready for download`);
      console.log('Download URL:', downloadUrl);
      // In a real implementation, trigger download
    },
    onError: (_, { options }) => {
      toast.error(`Failed to export ${options.format.toUpperCase()}`);
    }
  });

  const generateReport = (filters: ReportFilters) => {
    setCurrentPage(1); // Reset to first page
    generateReportMutation.mutate({ filters, page: 1, size: pageSize });
  };

  const changePage = (filters: ReportFilters, page: number) => {
    setCurrentPage(page);
    generateReportMutation.mutate({ filters, page, size: pageSize });
  };

  const changePageSize = (filters: ReportFilters, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    generateReportMutation.mutate({ filters, page: 1, size });
  };

  return {
    reportConfigs,
    currentReport: generateReportMutation.data,
    isGenerating: generateReportMutation.isPending,
    isExporting: exportReportMutation.isPending,
    generateReport,
    exportReport: exportReportMutation.mutate,
    changePage,
    changePageSize,
    currentPage,
    pageSize,
    error: generateReportMutation.error
  };
};