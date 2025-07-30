import { format } from 'date-fns';
import { ReportData } from './PulseAnalyticsService';

export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeCharts: boolean;
  includeMetrics: boolean;
  includeTables: boolean;
  title?: string;
  subtitle?: string;
}

export class PulseExportService {
  static async exportReport(
    reportData: ReportData, 
    reportType: string, 
    options: ExportOptions
  ): Promise<Blob> {
    if (options.format === 'csv') {
      return this.exportToCSV(reportData, reportType, options);
    } else {
      return this.exportToPDF(reportData, reportType, options);
    }
  }

  private static async exportToCSV(
    reportData: ReportData, 
    reportType: string, 
    options: ExportOptions
  ): Promise<Blob> {
    const csvRows: string[] = [];
    
    // Header
    csvRows.push(`# ${options.title || 'Pulse CMS Report'}`);
    csvRows.push(`# Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
    csvRows.push('');

    // Metrics section
    if (options.includeMetrics) {
      csvRows.push('## Metrics');
      csvRows.push('Metric,Value');
      Object.entries(reportData.metrics).forEach(([key, value]) => {
        csvRows.push(`${this.formatMetricName(key)},${value}`);
      });
      csvRows.push('');
    }

    // Charts section
    if (options.includeCharts) {
      csvRows.push('## Chart Data');
      Object.entries(reportData.charts).forEach(([chartType, data]) => {
        csvRows.push(`### ${this.formatChartName(chartType)}`);
        csvRows.push('Name,Value,Date,Category');
        data.forEach(item => {
          csvRows.push(`${item.name},${item.value},${item.date || ''},${item.category || ''}`);
        });
        csvRows.push('');
      });
    }

    // Tables section
    if (options.includeTables) {
      csvRows.push('## Top Performers');
      csvRows.push('Name,Completed Cases,Avg Resolution Time,Billable Hours');
      reportData.tables.topPerformers.forEach(performer => {
        csvRows.push(`${performer.name},${performer.completedCases},${performer.avgResolutionTime},${performer.billableHours}`);
      });
      csvRows.push('');

      csvRows.push('## High Risk Cases');
      csvRows.push('ID,Title,Priority,Days Open,Assignee');
      reportData.tables.highRiskCases.forEach(case_ => {
        csvRows.push(`${case_.id},${case_.title},${case_.priority},${case_.daysOpen},${case_.assignee}`);
      });
    }

    const csvContent = csvRows.join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private static async exportToPDF(
    reportData: ReportData, 
    reportType: string, 
    options: ExportOptions
  ): Promise<Blob> {
    // Note: In a real implementation, you would use a PDF library like jsPDF
    // For now, we'll create a simple HTML-based PDF export
    
    const htmlContent = this.generateHTMLReport(reportData, reportType, options);
    
    // Convert HTML to PDF (simplified - would need proper PDF library)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // In production, you would use something like:
    // const pdf = await html2pdf().from(htmlContent).outputPdf();
    // return new Blob([pdf], { type: 'application/pdf' });
    
    return blob;
  }

  private static generateHTMLReport(
    reportData: ReportData, 
    reportType: string, 
    options: ExportOptions
  ): string {
    const title = options.title || 'Pulse CMS Report';
    const subtitle = options.subtitle || `Generated on ${format(new Date(), 'MMMM dd, yyyy')}`;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { border-bottom: 2px solid #655DC6; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #655DC6; margin: 0; }
          .subtitle { font-size: 16px; color: #666; margin: 5px 0 0 0; }
          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .metric-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; }
          .metric-value { font-size: 32px; font-weight: bold; color: #655DC6; }
          .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
          .section { margin: 30px 0; }
          .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .chart-placeholder { background: #f5f5f5; border: 2px dashed #ddd; padding: 40px; text-align: center; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
    `;

    // Metrics section
    if (options.includeMetrics) {
      html += `
        <div class="section">
          <h2 class="section-title">Key Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.totalCases}</div>
              <div class="metric-label">Total Cases</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.closedCases}</div>
              <div class="metric-label">Closed Cases</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${Math.round(reportData.metrics.avgResolutionTime)}</div>
              <div class="metric-label">Avg Resolution (days)</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.complianceScore}%</div>
              <div class="metric-label">Compliance Score</div>
            </div>
          </div>
        </div>
      `;
    }

    // Charts section (placeholders for now)
    if (options.includeCharts) {
      html += `
        <div class="section">
          <h2 class="section-title">Analytics Charts</h2>
          <div class="chart-placeholder">
            Case Resolution Trends Chart<br>
            <small>(Chart would be rendered here in full implementation)</small>
          </div>
          <div class="chart-placeholder">
            Department Breakdown Chart<br>
            <small>(Chart would be rendered here in full implementation)</small>
          </div>
        </div>
      `;
    }

    // Tables section
    if (options.includeTables && reportData.tables.topPerformers.length > 0) {
      html += `
        <div class="section">
          <h2 class="section-title">Top Performers</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Completed Cases</th>
                <th>Avg Resolution Time</th>
                <th>Billable Hours</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      reportData.tables.topPerformers.forEach(performer => {
        html += `
          <tr>
            <td>${performer.name}</td>
            <td>${performer.completedCases}</td>
            <td>${performer.avgResolutionTime}</td>
            <td>${performer.billableHours}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>Report generated by Pulse CMS on ${format(new Date(), 'MMMM dd, yyyy \'at\' HH:mm')}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private static formatMetricName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private static formatChartName(chartType: string): string {
    return chartType
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  static async downloadFile(blob: Blob, filename: string): Promise<void> {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}