import { Activity } from "./types";
import { getActivityTypeLabel } from "./ActivityTypeSelector";

export const exportActivitiesToCSV = (activities: Activity[], filename = 'activities') => {
  if (activities.length === 0) {
    return;
  }

  const headers = [
    'Date/Time',
    'Activity Type',
    'Subject',
    'Description',
    'Contact Name',
    'Contact Email',
    'Client Type',
    'Priority',
    'Status',
    'Duration (minutes)',
    'Outcome',
    'Next Steps',
    'Logged By',
    'Assigned To'
  ];

  const csvData = [
    headers,
    ...activities.map(activity => [
      new Date(activity.created_at).toLocaleString(),
      getActivityTypeLabel(activity.type),
      activity.subject,
      activity.description || '',
      activity.contact_name || '',
      activity.contact_email || '',
      activity.client_type || '',
      activity.priority,
      activity.status,
      activity.duration_minutes?.toString() || '',
      activity.outcome || '',
      activity.next_steps || '',
      activity.created_by,
      activity.assigned_to
    ])
  ];

  const csvContent = csvData
    .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};