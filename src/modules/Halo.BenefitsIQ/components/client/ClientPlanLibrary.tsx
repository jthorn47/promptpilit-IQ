// Client Plan Library - Manage company's benefit plans
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Heart,
  Eye,
  Stethoscope,
  Shield,
  Plus,
  MoreHorizontal,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface ClientPlanLibraryProps {
  companyId: string;
}

interface BenefitPlan {
  id: string;
  name: string;
  carrier: string;
  type: 'medical' | 'dental' | 'vision' | 'life' | 'disability';
  status: 'active' | 'inactive';
  monthlyPremium: number;
  deductible: number;
  effectiveDate: string;
  enrolledEmployees: number;
}

export const ClientPlanLibrary: React.FC<ClientPlanLibraryProps> = ({ 
  companyId 
}) => {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadPlans = async () => {
      // Mock data for now
      setTimeout(() => {
        setPlans([
          {
            id: '1',
            name: 'Blue Cross PPO Standard',
            carrier: 'Blue Cross Blue Shield',
            type: 'medical',
            status: 'active',
            monthlyPremium: 450,
            deductible: 1000,
            effectiveDate: '2024-01-01',
            enrolledEmployees: 32
          },
          {
            id: '2',
            name: 'Aetna HMO Plus',
            carrier: 'Aetna',
            type: 'medical',
            status: 'active',
            monthlyPremium: 380,
            deductible: 500,
            effectiveDate: '2024-01-01',
            enrolledEmployees: 18
          },
          {
            id: '3',
            name: 'Delta Dental PPO',
            carrier: 'Delta Dental',
            type: 'dental',
            status: 'active',
            monthlyPremium: 45,
            deductible: 50,
            effectiveDate: '2024-01-01',
            enrolledEmployees: 42
          },
          {
            id: '4',
            name: 'VSP Vision Care',
            carrier: 'VSP',
            type: 'vision',
            status: 'active',
            monthlyPremium: 15,
            deductible: 0,
            effectiveDate: '2024-01-01',
            enrolledEmployees: 35
          },
          {
            id: '5',
            name: 'MetLife Basic Life',
            carrier: 'MetLife',
            type: 'life',
            status: 'active',
            monthlyPremium: 25,
            deductible: 0,
            effectiveDate: '2024-01-01',
            enrolledEmployees: 45
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadPlans();
  }, [companyId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Stethoscope className="h-4 w-4" />;
      case 'dental': return <Heart className="h-4 w-4" />;
      case 'vision': return <Eye className="h-4 w-4" />;
      case 'life': return <Shield className="h-4 w-4" />;
      case 'disability': return <Shield className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'dental': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'vision': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'life': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'disability': return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'inactive': return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || plan.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getUniqueTypes = () => {
    return Array.from(new Set(plans.map(p => p.type)));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-full mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-4">
        {filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plans Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first benefit plan.'
                  }
                </p>
                {!searchTerm && selectedType === 'all' && (
                  <Button className="mt-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPlans.map(plan => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(plan.type)}`}>
                        {getTypeIcon(plan.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.carrier}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.toUpperCase()}
                      </Badge>
                      <Badge className={getTypeColor(plan.type)}>
                        {plan.type.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Monthly Premium</p>
                        <p className="font-semibold flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {plan.monthlyPremium}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductible</p>
                        <p className="font-semibold">
                          {plan.deductible === 0 ? 'None' : `$${plan.deductible}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Enrolled</p>
                        <p className="font-semibold">{plan.enrolledEmployees} employees</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Effective Date</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(plan.effectiveDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};