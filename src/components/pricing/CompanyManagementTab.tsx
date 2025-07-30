import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyAllocation {
  id: string;
  company_id: string;
  company_name: string;
  package_name: string;
  total_seats: number;
  used_seats: number;
  purchased_seats: number;
  status: string;
}

interface CompanyManagementTabProps {
  allocations: CompanyAllocation[];
  onUpdate: () => void;
}

export const CompanyManagementTab = ({ allocations, onUpdate }: CompanyManagementTabProps) => {
  const [editingAllocation, setEditingAllocation] = useState<CompanyAllocation | null>(null);
  const [additionalSeats, setAdditionalSeats] = useState(0);
  const { toast } = useToast();

  const handleAddSeats = async (allocation: CompanyAllocation, seats: number) => {
    try {
      const { error } = await supabase
        .from('company_seat_allocations')
        .update({
          total_seats: allocation.total_seats + seats,
          purchased_seats: allocation.purchased_seats + seats,
        })
        .eq('id', allocation.id);

      if (error) throw error;

      // Log the transaction
      await supabase.from('seat_transactions').insert({
        company_id: allocation.company_id,
        action_type: 'purchase',
        seats_change: seats,
        price_paid: 0, // Manual addition, no payment
        performed_by: null, // System admin action
        metadata: { manual_addition: true, reason: 'Admin manual seat addition' },
      });

      toast({ title: "Success", description: `Added ${seats} seats successfully` });
      setEditingAllocation(null);
      setAdditionalSeats(0);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add seats",
        variant: "destructive",
      });
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Seat Management</CardTitle>
        <CardDescription>
          View and manage seat allocations for individual companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Seat Usage</TableHead>
                <TableHead>Total Seats</TableHead>
                <TableHead>Purchased Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => {
                const usagePercentage = (allocation.used_seats / allocation.total_seats) * 100;
                
                return (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">{allocation.company_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{allocation.package_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="text-sm">
                          {allocation.used_seats} / {allocation.total_seats} seats
                        </div>
                        <Progress
                          value={usagePercentage}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{allocation.total_seats}</TableCell>
                    <TableCell>
                      {allocation.purchased_seats > 0 ? (
                        <Badge variant="secondary">+{allocation.purchased_seats}</Badge>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={allocation.status === 'active' ? 'default' : 'secondary'}
                      >
                        {allocation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAllocation(allocation)}
                            >
                              Add Seats
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Seats for {allocation.company_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="additional_seats">Number of Additional Seats</Label>
                                <Input
                                  id="additional_seats"
                                  type="number"
                                  min="1"
                                  value={additionalSeats}
                                  onChange={(e) => setAdditionalSeats(parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Current: {allocation.used_seats} / {allocation.total_seats} seats
                                <br />
                                After addition: {allocation.used_seats} / {allocation.total_seats + additionalSeats} seats
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAddSeats(allocation, additionalSeats)}
                                  disabled={additionalSeats <= 0}
                                >
                                  Add {additionalSeats} Seats
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAllocation(null);
                                    setAdditionalSeats(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {allocations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No company seat allocations found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};