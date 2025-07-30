import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Download, 
  Home, 
  TrendingUp 
} from "lucide-react";

interface BIHeaderProps {
  dateRange: string;
  setDateRange: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  departments: string[];
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export function BIHeader({ 
  dateRange, 
  setDateRange, 
  departmentFilter, 
  setDepartmentFilter, 
  departments, 
  onExportPDF, 
  onExportCSV 
}: BIHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link 
          to="/admin" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence</h1>
          <p className="text-muted-foreground">Training compliance analytics and insights</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onExportPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          PDF
        </Button>
        
        <Button onClick={onExportCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          CSV
        </Button>
        
        <Link to="/admin">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}