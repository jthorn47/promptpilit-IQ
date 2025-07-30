import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2,
  Building2,
  Phone,
  Mail,
  User,
  Search
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CompanyLocation {
  id: string;
  location_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  is_primary: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const CompanyLocationManager = () => {
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CompanyLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    location_name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
    phone: "",
    email: "",
    manager_name: "",
    is_primary: false,
    is_active: true
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('company_locations')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: "Error",
          description: "Company not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('company_locations')
        .insert({
          ...formData,
          company_id: profile.company_id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location added successfully",
      });

      setShowAddDialog(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive",
      });
    }
  };

  const handleEditLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    try {
      const { error } = await supabase
        .from('company_locations')
        .update(formData)
        .eq('id', editingLocation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location updated successfully",
      });

      setEditingLocation(null);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const { error } = await supabase
        .from('company_locations')
        .delete()
        .eq('id', locationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Location deleted successfully",
      });

      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  const startEdit = (location: CompanyLocation) => {
    setEditingLocation(location);
    setFormData({
      location_name: location.location_name,
      address: location.address || "",
      city: location.city || "",
      state: location.state || "",
      zip_code: location.zip_code || "",
      country: location.country || "United States",
      phone: location.phone || "",
      email: location.email || "",
      manager_name: location.manager_name || "",
      is_primary: location.is_primary || false,
      is_active: location.is_active ?? true
    });
  };

  const resetForm = () => {
    setFormData({
      location_name: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "United States",
      phone: "",
      email: "",
      manager_name: "",
      is_primary: false,
      is_active: true
    });
  };

  const filteredLocations = locations.filter(location => 
    location.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (location.state && location.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Company Locations</h1>
        <div className="text-center py-8">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Locations</h1>
          <p className="text-muted-foreground">Manage your company's office locations and facilities</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="location_name">Location Name *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                    placeholder="Main Office, Warehouse, etc."
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="office@company.com"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="manager_name">Location Manager</Label>
                  <Input
                    id="manager_name"
                    value={formData.manager_name}
                    onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({...formData, is_primary: checked})}
                  />
                  <Label htmlFor="is_primary">Primary Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Location</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.filter(l => l.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Location</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.filter(l => l.is_primary).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Managers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.filter(l => l.manager_name).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No locations found</h3>
              <p className="text-muted-foreground mb-4">
                {locations.length === 0 
                  ? "Get started by adding your first company location"
                  : "Try adjusting your search"
                }
              </p>
              {locations.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Location
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLocations.map(location => (
                <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{location.location_name}</h3>
                        {location.is_primary && <Badge variant="default" className="text-xs">Primary</Badge>}
                        <Badge variant={location.is_active ? 'default' : 'secondary'} className="text-xs">
                          {location.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {location.address && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {location.city}, {location.state}
                          </span>
                        )}
                        {location.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {location.phone}
                          </span>
                        )}
                        {location.manager_name && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {location.manager_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(location)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingLocation} onOpenChange={() => setEditingLocation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditLocation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit_location_name">Location Name *</Label>
                <Input
                  id="edit_location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_city">City</Label>
                <Input
                  id="edit_city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_state">State</Label>
                <Input
                  id="edit_state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_zip_code">ZIP Code</Label>
                <Input
                  id="edit_zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit_manager_name">Location Manager</Label>
                <Input
                  id="edit_manager_name"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({...formData, is_primary: checked})}
                />
                <Label htmlFor="edit_is_primary">Primary Location</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingLocation(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Location</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};