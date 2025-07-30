import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SeatPlanConfiguration {
  id: string;
  plan_name: string;
  included_seats: number;
  price_per_additional_seat: number;
  allow_additional_seats: boolean;
  max_total_seats: number | null;
  auto_unlock_on_purchase: boolean;
  is_active: boolean;
}

interface SeatLicensingTabProps {
  seatConfigs: SeatPlanConfiguration[];
  onUpdate: () => void;
}

export const SeatLicensingTab = ({ seatConfigs, onUpdate }: SeatLicensingTabProps) => {
  const [editingConfig, setEditingConfig] = useState<SeatPlanConfiguration | null>(null);
  const { toast } = useToast();

  const handleUpdateConfig = async (config: SeatPlanConfiguration) => {
    try {
      const { error } = await supabase
        .from('seat_plan_configurations')
        .update({
          included_seats: config.included_seats,
          price_per_additional_seat: config.price_per_additional_seat,
          allow_additional_seats: config.allow_additional_seats,
          max_total_seats: config.max_total_seats,
          auto_unlock_on_purchase: config.auto_unlock_on_purchase,
          is_active: config.is_active,
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({ title: "Success", description: "Seat configuration updated successfully" });
      setEditingConfig(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seat configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seat Licensing Configuration</CardTitle>
        <CardDescription>
          Configure seat allocations and pricing for each plan tier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Included Seats</TableHead>
                <TableHead>Price per Additional Seat</TableHead>
                <TableHead>Allow Additional</TableHead>
                <TableHead>Max Total Seats</TableHead>
                <TableHead>Auto Unlock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seatConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.plan_name}</TableCell>
                  <TableCell>{config.included_seats}</TableCell>
                  <TableCell>${config.price_per_additional_seat}</TableCell>
                  <TableCell>{config.allow_additional_seats ? "Yes" : "No"}</TableCell>
                  <TableCell>{config.max_total_seats || "Unlimited"}</TableCell>
                  <TableCell>{config.auto_unlock_on_purchase ? "Yes" : "No"}</TableCell>
                  <TableCell>{config.is_active ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingConfig(config)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingConfig && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Edit {editingConfig.plan_name} Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="included_seats">Included Seats</Label>
                    <Input
                      id="included_seats"
                      type="number"
                      value={editingConfig.included_seats}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          included_seats: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="additional_seat_price">Price per Additional Seat ($)</Label>
                    <Input
                      id="additional_seat_price"
                      type="number"
                      step="0.01"
                      value={editingConfig.price_per_additional_seat}
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          price_per_additional_seat: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_seats">Max Total Seats</Label>
                    <Input
                      id="max_seats"
                      type="number"
                      value={editingConfig.max_total_seats || ""}
                      placeholder="Leave empty for unlimited"
                      onChange={(e) =>
                        setEditingConfig({
                          ...editingConfig,
                          max_total_seats: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow_additional"
                      checked={editingConfig.allow_additional_seats}
                      onCheckedChange={(checked) =>
                        setEditingConfig({
                          ...editingConfig,
                          allow_additional_seats: checked,
                        })
                      }
                    />
                    <Label htmlFor="allow_additional">Allow Additional Seat Purchases</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_unlock"
                      checked={editingConfig.auto_unlock_on_purchase}
                      onCheckedChange={(checked) =>
                        setEditingConfig({
                          ...editingConfig,
                          auto_unlock_on_purchase: checked,
                        })
                      }
                    />
                    <Label htmlFor="auto_unlock">Auto-unlock courses on seat purchase</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editingConfig.is_active}
                      onCheckedChange={(checked) =>
                        setEditingConfig({
                          ...editingConfig,
                          is_active: checked,
                        })
                      }
                    />
                    <Label htmlFor="is_active">Plan is active</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateConfig(editingConfig)}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingConfig(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};