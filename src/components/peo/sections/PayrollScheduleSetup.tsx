import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessibleFormField, AccessibleSelectField, AccessibleTextareaField } from '@/components/AccessibleForm';
import { Calendar, Upload, Video, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayrollScheduleSetupProps {
  sessionId: string;
  sectionId: string;
  sectionData: any;
  userRole: 'client_admin' | 'onboarding_manager';
  onProgressUpdate: (progress: number, data?: any) => void;
}

export const PayrollScheduleSetup: React.FC<PayrollScheduleSetupProps> = ({
  sessionId,
  sectionId,
  sectionData,
  userRole,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState([
    {
      id: '1',
      name: 'Primary Schedule',
      frequency: 'bi_weekly',
      payDates: [],
      holidays: [],
      isDefault: true
    }
  ]);
  const [customDocs, setCustomDocs] = useState<any[]>([]);
  const [welcomeVideo, setWelcomeVideo] = useState('');

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'semi_monthly', label: 'Semi-Monthly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const holidayOptions = [
    'New Year\'s Day',
    'Martin Luther King Jr. Day',
    'Presidents\' Day',
    'Memorial Day',
    'Independence Day',
    'Labor Day',
    'Columbus Day',
    'Veterans Day',
    'Thanksgiving',
    'Christmas Day'
  ];

  const calculateProgress = () => {
    let progress = 0;
    
    // Schedule configured: 50%
    if (schedules.length > 0 && schedules[0].frequency) progress += 50;
    
    // Custom docs uploaded: 25%
    if (customDocs.length > 0) progress += 25;
    
    // Welcome video added: 25%
    if (welcomeVideo) progress += 25;
    
    return progress;
  };

  const addPayDate = (scheduleId: string) => {
    // Add logic to add pay dates to schedule
    toast({
      title: "Pay Date Added",
      description: "Pay date has been added to the schedule."
    });
  };

  const uploadCustomDoc = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Simulate file upload
    const newDocs = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: 'acknowledgment_form',
      uploadedAt: new Date().toISOString()
    }));

    setCustomDocs([...customDocs, ...newDocs]);
    
    toast({
      title: "Documents Uploaded",
      description: `${files.length} document(s) uploaded successfully.`
    });

    onProgressUpdate(calculateProgress());
  };

  return (
    <div className="space-y-6">
      {/* Payroll Schedule Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Build Payroll Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {schedules.map((schedule, index) => (
            <div key={schedule.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{schedule.name}</h4>
                {schedule.isDefault && <Badge>Default</Badge>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <AccessibleSelectField
                  label="Pay Frequency"
                  name={`frequency_${schedule.id}`}
                  value={schedule.frequency}
                  onChange={(value) => {
                    const updatedSchedules = schedules.map(s => 
                      s.id === schedule.id ? { ...s, frequency: value } : s
                    );
                    setSchedules(updatedSchedules);
                    onProgressUpdate(calculateProgress());
                  }}
                  options={frequencyOptions}
                  placeholder="Select frequency"
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pay Dates</label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPayDate(schedule.id)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Add Pay Date
                    </Button>
                  </div>
                </div>
              </div>

              {/* Holiday Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observed Holidays</label>
                <div className="grid grid-cols-3 gap-2">
                  {holidayOptions.map((holiday) => (
                    <label key={holiday} className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>{holiday}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Additional Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Employee Schedule Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Schedules to Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* This would be populated with actual employees from the previous section */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-sm text-muted-foreground">john.smith@company.com</p>
              </div>
              <AccessibleSelectField
                label=""
                name="schedule_john"
                value="primary"
                onChange={() => {}}
                options={[
                  { value: 'primary', label: 'Primary Schedule' }
                ]}
                className="w-48"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Jane Doe</p>
                <p className="text-sm text-muted-foreground">jane.doe@company.com</p>
              </div>
              <AccessibleSelectField
                label=""
                name="schedule_jane"
                value="primary"
                onChange={() => {}}
                options={[
                  { value: 'primary', label: 'Primary Schedule' }
                ]}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Client-Specific Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload any company-specific acknowledgment forms, policies, or documents that employees need to review during onboarding.
          </p>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium mb-2">Upload Documents</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Drag and drop files here or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={uploadCustomDoc}
              className="hidden"
              id="custom-doc-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="custom-doc-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>

          {/* Uploaded Documents */}
          {customDocs.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium">Uploaded Documents</h5>
              {customDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">PDF</span>
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">Acknowledgment Form</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Welcome Video */}
      <Card>
        <CardHeader>
          <CardTitle>Optional Welcome Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessibleFormField
            label="Welcome Video URL"
            name="welcome_video"
            value={welcomeVideo}
            onChange={(value) => {
              setWelcomeVideo(value);
              onProgressUpdate(calculateProgress());
            }}
            placeholder="https://vimeo.com/... or upload MP4 file"
            description="Provide a Vimeo link or upload an MP4 file for new employee welcome message"
          />
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Recommended: 2-5 minute welcome message from leadership</span>
          </div>
        </CardContent>
      </Card>

      {/* Lock After Review */}
      <Card>
        <CardHeader>
          <CardTitle>Section Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This section will be locked after review to prevent changes that could affect payroll processing.
            </p>
            
            {userRole === 'onboarding_manager' && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <h5 className="font-medium text-blue-800">Ready for Lock</h5>
                  <p className="text-sm text-blue-700">Lock this section to finalize payroll schedule configuration.</p>
                </div>
                <Button>
                  Lock Section
                </Button>
              </div>
            )}
            
            {userRole === 'client_admin' && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Please review all schedule settings carefully. This section will be locked after onboarding manager approval.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};