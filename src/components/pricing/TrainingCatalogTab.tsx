import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  available_for_licensing: boolean;
  license_category: string;
  requires_special_approval: boolean;
  seat_price_override: number | null;
  visibility_level: string;
  is_active: boolean;
}

interface TrainingCatalogTabProps {
  trainingModules: TrainingModule[];
  onUpdate: () => void;
}

export const TrainingCatalogTab = ({ trainingModules, onUpdate }: TrainingCatalogTabProps) => {
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const { toast } = useToast();

  const handleUpdateModule = async (module: TrainingModule) => {
    try {
      const { error } = await supabase
        .from('training_modules')
        .update({
          available_for_licensing: module.available_for_licensing,
          license_category: module.license_category,
          requires_special_approval: module.requires_special_approval,
          seat_price_override: module.seat_price_override,
          visibility_level: module.visibility_level,
        })
        .eq('id', module.id);

      if (error) throw error;

      toast({ title: "Success", description: "Training module updated successfully" });
      setEditingModule(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update training module",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-red-100 text-red-800';
      case 'safety': return 'bg-yellow-100 text-yellow-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Catalog Management</CardTitle>
        <CardDescription>
          Configure which training modules are available for seat-based licensing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Training Module</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Available for Licensing</TableHead>
                <TableHead>Requires Approval</TableHead>
                <TableHead>Price Override</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingModules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{module.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {module.description?.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(module.license_category)}>
                      {module.license_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {module.available_for_licensing ? (
                      <Badge variant="default">Available</Badge>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {module.requires_special_approval ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    {module.seat_price_override ? `$${module.seat_price_override}` : "Default"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {module.visibility_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingModule(module)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingModule && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Edit {editingModule.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">License Category</Label>
                    <Select
                      value={editingModule.license_category}
                      onValueChange={(value) =>
                        setEditingModule({
                          ...editingModule,
                          license_category: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility Level</Label>
                    <Select
                      value={editingModule.visibility_level}
                      onValueChange={(value) =>
                        setEditingModule({
                          ...editingModule,
                          visibility_level: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="enterprise">Enterprise Only</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price_override">Seat Price Override ($)</Label>
                    <Input
                      id="price_override"
                      type="number"
                      step="0.01"
                      value={editingModule.seat_price_override || ""}
                      placeholder="Leave empty for default pricing"
                      onChange={(e) =>
                        setEditingModule({
                          ...editingModule,
                          seat_price_override: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available_licensing"
                      checked={editingModule.available_for_licensing}
                      onCheckedChange={(checked) =>
                        setEditingModule({
                          ...editingModule,
                          available_for_licensing: checked,
                        })
                      }
                    />
                    <Label htmlFor="available_licensing">Available for Seat Licensing</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_approval"
                      checked={editingModule.requires_special_approval}
                      onCheckedChange={(checked) =>
                        setEditingModule({
                          ...editingModule,
                          requires_special_approval: checked,
                        })
                      }
                    />
                    <Label htmlFor="requires_approval">Requires Special Approval</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateModule(editingModule)}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingModule(null)}>
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