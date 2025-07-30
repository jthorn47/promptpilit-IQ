import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar as CalendarIcon, Target, Users, FileText, CheckCircle, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PIPFormData {
  // Employee Information
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  supervisor: string;
  hireDate: Date;
  
  // PIP Details
  pipStartDate: Date;
  pipEndDate: Date;
  reviewDate: Date;
  
  // Performance Issues
  performanceIssues: string[];
  specificConcerns: string;
  
  // Sales Metrics
  currentSalesPerformance: {
    monthlySales: number;
    quarterlyGoal: number;
    conversionRate: number;
    prospectingActivity: number;
  };
  
  // Improvement Goals
  improvementGoals: {
    id: string;
    goal: string;
    measurable: string;
    timeline: string;
    resources: string;
  }[];
  
  // Support and Resources
  trainingRequired: string[];
  mentorship: boolean;
  additionalSupport: string;
  
  // Consequences
  consequencesOfFailure: string;
  
  // Status
  status: 'draft' | 'active' | 'completed' | 'extended';
}

interface PIPFormProps {
  onSubmit: (data: PIPFormData) => void;
  initialData?: Partial<PIPFormData>;
  isEditing?: boolean;
}

const PERFORMANCE_ISSUES = [
  'Below sales targets',
  'Poor prospecting activity',
  'Low conversion rates',
  'Inadequate client follow-up',
  'Missed appointments',
  'Poor territory management',
  'Lack of product knowledge',
  'Unprofessional communication',
  'Failure to update CRM',
  'Attendance issues'
];

const TRAINING_OPTIONS = [
  'Sales techniques training',
  'Product knowledge sessions',
  'CRM system training',
  'Presentation skills',
  'Negotiation training',
  'Territory management',
  'Customer service excellence',
  'Time management',
  'Communication skills'
];

export const PIPForm: React.FC<PIPFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>(initialData?.performanceIssues || []);
  const [selectedTraining, setSelectedTraining] = useState<string[]>(initialData?.trainingRequired || []);
  const [goals, setGoals] = useState(initialData?.improvementGoals || [
    { id: '1', goal: '', measurable: '', timeline: '', resources: '' }
  ]);
  const [startDate, setStartDate] = useState<Date>(initialData?.pipStartDate || new Date());
  const [endDate, setEndDate] = useState<Date>(initialData?.pipEndDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [reviewDate, setReviewDate] = useState<Date>(initialData?.reviewDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PIPFormData>({
    defaultValues: {
      employeeName: initialData?.employeeName || '',
      employeeId: initialData?.employeeId || '',
      position: initialData?.position || 'Outside Sales Representative',
      department: initialData?.department || 'Sales',
      supervisor: initialData?.supervisor || '',
      specificConcerns: initialData?.specificConcerns || '',
      currentSalesPerformance: {
        monthlySales: initialData?.currentSalesPerformance?.monthlySales || 0,
        quarterlyGoal: initialData?.currentSalesPerformance?.quarterlyGoal || 0,
        conversionRate: initialData?.currentSalesPerformance?.conversionRate || 0,
        prospectingActivity: initialData?.currentSalesPerformance?.prospectingActivity || 0
      },
      mentorship: initialData?.mentorship || false,
      additionalSupport: initialData?.additionalSupport || '',
      consequencesOfFailure: initialData?.consequencesOfFailure || 'Failure to meet the goals outlined in this PIP may result in further disciplinary action, up to and including termination of employment.',
      status: initialData?.status || 'draft'
    }
  });

  const addGoal = () => {
    const newGoal = {
      id: Date.now().toString(),
      goal: '',
      measurable: '',
      timeline: '',
      resources: ''
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: string, value: string) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const toggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter(i => i !== issue));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const toggleTraining = (training: string) => {
    if (selectedTraining.includes(training)) {
      setSelectedTraining(selectedTraining.filter(t => t !== training));
    } else {
      setSelectedTraining([...selectedTraining, training]);
    }
  };

  const onFormSubmit = (data: any) => {
    const formData: PIPFormData = {
      ...data,
      pipStartDate: startDate,
      pipEndDate: endDate,
      reviewDate: reviewDate,
      performanceIssues: selectedIssues,
      trainingRequired: selectedTraining,
      improvementGoals: goals.filter(g => g.goal.trim() !== ''),
      hireDate: new Date(data.hireDate)
    };

    onSubmit(formData);
    toast.success(`PIP ${isEditing ? 'updated' : 'created'} successfully`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Performance Improvement Plan (P.I.P.)
          </CardTitle>
          <CardDescription>
            Outside Sales Position - {isEditing ? 'Edit' : 'Create'} Performance Improvement Plan
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeeName">Employee Name *</Label>
                <Input
                  id="employeeName"
                  {...register('employeeName', { required: 'Employee name is required' })}
                  className={errors.employeeName ? 'border-destructive' : ''}
                />
                {errors.employeeName && (
                  <p className="text-sm text-destructive mt-1">{errors.employeeName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  {...register('employeeId', { required: 'Employee ID is required' })}
                  className={errors.employeeId ? 'border-destructive' : ''}
                />
                {errors.employeeId && (
                  <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  {...register('position')}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register('department')}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="supervisor">Supervisor *</Label>
                <Input
                  id="supervisor"
                  {...register('supervisor', { required: 'Supervisor name is required' })}
                  className={errors.supervisor ? 'border-destructive' : ''}
                />
                {errors.supervisor && (
                  <p className="text-sm text-destructive mt-1">{errors.supervisor.message}</p>
                )}
              </div>

              <div>
                <Label>Hire Date</Label>
                <Input
                  type="date"
                  {...register('hireDate')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIP Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              PIP Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Review Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(reviewDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reviewDate}
                      onSelect={(date) => date && setReviewDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Performance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Select Performance Issues</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PERFORMANCE_ISSUES.map((issue) => (
                    <Badge
                      key={issue}
                      variant={selectedIssues.includes(issue) ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleIssue(issue)}
                    >
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specificConcerns">Specific Concerns & Examples *</Label>
                <Textarea
                  id="specificConcerns"
                  {...register('specificConcerns', { required: 'Specific concerns are required' })}
                  className={errors.specificConcerns ? 'border-destructive' : ''}
                  rows={4}
                  placeholder="Provide specific examples of performance issues, dates, and impact..."
                />
                {errors.specificConcerns && (
                  <p className="text-sm text-destructive mt-1">{errors.specificConcerns.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Sales Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Current Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlySales">Monthly Sales (Last 3 months average)</Label>
                <Input
                  id="monthlySales"
                  type="number"
                  {...register('currentSalesPerformance.monthlySales')}
                  placeholder="$0"
                />
              </div>

              <div>
                <Label htmlFor="quarterlyGoal">Quarterly Goal</Label>
                <Input
                  id="quarterlyGoal"
                  type="number"
                  {...register('currentSalesPerformance.quarterlyGoal')}
                  placeholder="$0"
                />
              </div>

              <div>
                <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                <Input
                  id="conversionRate"
                  type="number"
                  step="0.1"
                  {...register('currentSalesPerformance.conversionRate')}
                  placeholder="0.0"
                />
              </div>

              <div>
                <Label htmlFor="prospectingActivity">Prospecting Activity (calls/week)</Label>
                <Input
                  id="prospectingActivity"
                  type="number"
                  {...register('currentSalesPerformance.prospectingActivity')}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Improvement Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Improvement Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Goal {index + 1}</h4>
                    {goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Goal Description *</Label>
                      <Textarea
                        value={goal.goal}
                        onChange={(e) => updateGoal(goal.id, 'goal', e.target.value)}
                        placeholder="Describe the specific improvement goal..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Measurable Outcome *</Label>
                      <Input
                        value={goal.measurable}
                        onChange={(e) => updateGoal(goal.id, 'measurable', e.target.value)}
                        placeholder="How will success be measured?"
                      />
                    </div>

                    <div>
                      <Label>Timeline *</Label>
                      <Input
                        value={goal.timeline}
                        onChange={(e) => updateGoal(goal.id, 'timeline', e.target.value)}
                        placeholder="When should this be achieved?"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Resources & Support</Label>
                      <Input
                        value={goal.resources}
                        onChange={(e) => updateGoal(goal.id, 'resources', e.target.value)}
                        placeholder="What resources will be provided?"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support and Training */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Support & Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Required Training</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TRAINING_OPTIONS.map((training) => (
                    <Badge
                      key={training}
                      variant={selectedTraining.includes(training) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTraining(training)}
                    >
                      {training}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mentorship"
                  {...register('mentorship')}
                />
                <Label htmlFor="mentorship">Assign Mentor</Label>
              </div>

              <div>
                <Label htmlFor="additionalSupport">Additional Support</Label>
                <Textarea
                  id="additionalSupport"
                  {...register('additionalSupport')}
                  placeholder="Describe any additional support that will be provided..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consequences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              Consequences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="consequencesOfFailure">Consequences of Failure to Improve</Label>
              <Textarea
                id="consequencesOfFailure"
                {...register('consequencesOfFailure')}
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>PIP Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Status</Label>
              <Select value={watch('status')} onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="extended">Extended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update' : 'Create'} PIP
          </Button>
        </div>
      </form>
    </div>
  );
};