import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Settings, 
  Download, 
  Upload,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Archive,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  SortAsc,
  SortDesc,
  Shield
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkersCompCodes } from '@/hooks/useClientPayrollSettings';

interface WorkersCompCode {
  id: string;
  code: string;
  description: string;
  actual_rate: number;
  bill_rate: number;
  experience_modifier: number;
  industry: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  company_id?: string;
}

interface WorkersCompManagerProps {
  companyId: string;
}

export const WorkersCompManager: React.FC<WorkersCompManagerProps> = ({ companyId }) => {
  console.log('🔍 WorkersCompManager - companyId:', companyId);
  
  // Mock data for now - this will be replaced with actual data fetching
  const mockData: WorkersCompCode[] = [
    {
      id: '1',
      code: '8810',
      description: 'Clerical Office Employees',
      actual_rate: 0.35,
      bill_rate: 0.42,
      experience_modifier: 1.17,
      industry: 'Professional Services',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      is_active: true,
      company_id: companyId
    },
    {
      id: '2',
      code: '5403',
      description: 'Carpentry - Shop Only',
      actual_rate: 4.85,
      bill_rate: 5.82,
      experience_modifier: 1.15,
      industry: 'Construction',
      start_date: '2024-01-01',
      is_active: true,
      company_id: companyId
    },
    {
      id: '3',
      code: '7380',
      description: 'Drivers - Chauffeurs, Delivery',
      actual_rate: 2.95,
      bill_rate: 3.54,
      experience_modifier: 1.18,
      industry: 'Transportation',
      start_date: '2024-01-01',
      end_date: '2025-06-30',
      is_active: true,
      company_id: companyId
    }
  ];

  const [sortBy, setSortBy] = useState<keyof WorkersCompCode>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorted data
  const sortedData = useMemo(() => {
    let sorted = [...mockData];

    // Sort data
    sorted.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return sorted;
  }, [mockData, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof WorkersCompCode) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(item => item.id));
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getHazardGroupColor = (group: string) => {
    switch (group) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRate = (rate: number) => {
    return `$${rate.toFixed(2)}`;
  };

  // Get unique values for filters
  const industries = Array.from(new Set(mockData.map(item => item.industry)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Workers' Compensation Management
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Code
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Workers' Comp Codes ({sortedData.length})
            </CardTitle>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} selected
                </span>
                <Button variant="outline" size="sm">
                  <Archive className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={paginatedData.length > 0 && selectedItems.length === paginatedData.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-1">
                      Code
                      {sortBy === 'code' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-1">
                      Description
                      {sortBy === 'description' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('actual_rate')}
                  >
                    <div className="flex items-center gap-1">
                      Actual Rate
                      {sortBy === 'actual_rate' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Bill Rate</TableHead>
                  <TableHead>Experience Mod</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell className="max-w-xs">
                      <div>
                        <div className="font-medium truncate">{item.description}</div>
                        <div className="text-sm text-muted-foreground">{item.industry}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      <input 
                        type="number"
                        step="0.01"
                        value={item.actual_rate}
                        className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onChange={(e) => {
                          // Handle actual rate change
                          console.log('Update actual rate for', item.id, 'to', e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <input 
                        type="number"
                        step="0.01"
                        value={item.bill_rate}
                        className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onChange={(e) => {
                          // Handle bill rate change
                          console.log('Update bill rate for', item.id, 'to', e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.experience_modifier.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <input 
                        type="date"
                        value={item.start_date}
                        className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                        onChange={(e) => {
                          // Handle start date change
                          console.log('Update start date for', item.id, 'to', e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <input 
                        type="date"
                        value={item.end_date || ''}
                        className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Optional"
                        onChange={(e) => {
                          // Handle end date change
                          console.log('Update end date for', item.id, 'to', e.target.value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.is_active ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="w-12 h-12 text-muted-foreground" />
                        <div className="text-lg font-medium">No workers' comp codes found</div>
                        <div className="text-sm text-muted-foreground">
                          Add your first workers' compensation code to get started
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};