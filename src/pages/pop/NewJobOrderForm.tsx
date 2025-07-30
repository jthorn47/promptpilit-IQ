import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Save, ArrowLeft, Calendar, DollarSign } from "lucide-react";

const NewJobOrderForm = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>
        <h1 className="text-3xl font-bold">Create Job Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" placeholder="e.g., Warehouse Associate" />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc-corp">ABC Corp</SelectItem>
                      <SelectItem value="xyz-logistics">XYZ Logistics</SelectItem>
                      <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                      <SelectItem value="global-manufacturing">Global Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="positions">Number of Positions</Label>
                  <Input id="positions" type="number" placeholder="e.g., 5" />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-week">1 Week</SelectItem>
                      <SelectItem value="2-weeks">2 Weeks</SelectItem>
                      <SelectItem value="1-month">1 Month</SelectItem>
                      <SelectItem value="3-months">3 Months</SelectItem>
                      <SelectItem value="6-months">6 Months</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="temp-to-perm">Temp-to-Perm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed description of job responsibilities, requirements, and expectations"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements & Qualifications</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="Education, experience, certifications, physical requirements, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Compensation */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule & Compensation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (if applicable)</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day (8 AM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (4 PM - 12 AM)</SelectItem>
                      <SelectItem value="night">Night (11 PM - 7 AM)</SelectItem>
                      <SelectItem value="rotating">Rotating</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hoursPerWeek">Hours per Week</Label>
                  <Input id="hoursPerWeek" type="number" placeholder="40" />
                </div>
                <div>
                  <Label htmlFor="overtime">Overtime Available</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="occasional">Occasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payRate">Pay Rate (per hour)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="payRate" type="number" step="0.01" placeholder="15.00" className="pl-9" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billRate">Bill Rate (per hour)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="billRate" type="number" step="0.01" placeholder="22.00" className="pl-9" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea 
                  id="benefits" 
                  placeholder="Health insurance, paid time off, bonuses, etc."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Job Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">Draft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">JO-2024-001</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <Button className="w-full flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Submit Job Order
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p className="font-medium">For better candidate matching:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Be specific about requirements</li>
                  <li>Include preferred experience level</li>
                  <li>Mention any certifications needed</li>
                  <li>Describe the work environment</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewJobOrderForm;