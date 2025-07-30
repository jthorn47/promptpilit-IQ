import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Route, 
  Users, 
  Clock, 
  Star, 
  Edit, 
  Trash2, 
  BookOpen,
  Target,
  TrendingUp,
  Award
} from "lucide-react";

interface LearningPath {
  id: string;
  name: string;
  description: string;
  is_sequential: boolean;
  estimated_duration_hours: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  modules?: LearningPathModule[];
  assignments?: number;
}

interface LearningPathModule {
  id: string;
  learning_path_id: string;
  training_module_id: string;
  sequence_order: number;
  required_score_percentage: number;
  training_modules: {
    id: string;
    title: string;
    description: string;
    estimated_duration: number;
  };
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  estimated_duration: number;
}

export const LearningPathsManager = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const [newPath, setNewPath] = useState({
    name: '',
    description: '',
    is_sequential: true,
    estimated_duration_hours: 0,
    difficulty_level: 'beginner' as const
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch learning paths 
      const { data: pathsData, error: pathsError } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pathsError) throw pathsError;

      // Transform data to match interface
      const transformedPaths = (pathsData || []).map(path => ({
        ...path,
        difficulty_level: (path.difficulty_level || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
        modules: [],
        assignments: 0
      }));

      setLearningPaths(transformedPaths);

      // Fetch available training modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select('id, title, description, estimated_duration')
        .order('title');

      if (modulesError) throw modulesError;
      setTrainingModules(modulesData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load learning paths",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLearningPath = async () => {
    try {
      setCreating(true);

      const { data, error } = await supabase
        .from('learning_paths')
        .insert([newPath])
        .select()
        .single();

      if (error) throw error;

      setLearningPaths(prev => [{ ...data, modules: [], assignments: 0 } as LearningPath, ...prev]);
      setShowCreateDialog(false);
      setNewPath({
        name: '',
        description: '',
        is_sequential: true,
        estimated_duration_hours: 0,
        difficulty_level: 'beginner'
      });

      toast({
        title: "Success",
        description: "Learning path created successfully"
      });

    } catch (error: any) {
      console.error('Error creating learning path:', error);
      toast({
        title: "Error",
        description: "Failed to create learning path",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteLearningPath = async (pathId: string) => {
    try {
      const { error } = await supabase
        .from('learning_paths')
        .update({ is_active: false })
        .eq('id', pathId);

      if (error) throw error;

      setLearningPaths(prev => prev.filter(p => p.id !== pathId));
      
      toast({
        title: "Success",
        description: "Learning path deleted successfully"
      });

    } catch (error: any) {
      console.error('Error deleting learning path:', error);
      toast({
        title: "Error",
        description: "Failed to delete learning path",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Star className="w-3 h-3" />;
      case 'intermediate': return <TrendingUp className="w-3 h-3" />;
      case 'advanced': return <Award className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">Create sequential training workflows</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Path
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Learning Path</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Path Name</Label>
                <Input
                  id="name"
                  value={newPath.name}
                  onChange={(e) => setNewPath(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter path name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPath.description}
                  onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this learning path"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={newPath.difficulty_level}
                  onValueChange={(value: any) => setNewPath(prev => ({ ...prev, difficulty_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="duration">Estimated Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newPath.estimated_duration_hours}
                  onChange={(e) => setNewPath(prev => ({ ...prev, estimated_duration_hours: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sequential"
                  checked={newPath.is_sequential}
                  onChange={(e) => setNewPath(prev => ({ ...prev, is_sequential: e.target.checked }))}
                />
                <Label htmlFor="sequential">Sequential (modules must be completed in order)</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createLearningPath} disabled={creating || !newPath.name}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((path) => (
          <Card key={path.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{path.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {path.description}
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteLearningPath(path.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{path.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{path.assignments || 0} assigned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{path.estimated_duration_hours}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Route className="w-4 h-4 text-muted-foreground" />
                  <span>{path.is_sequential ? 'Sequential' : 'Flexible'}</span>
                </div>
              </div>
              
              {/* Difficulty Badge */}
              <div className="flex justify-between items-center">
                <Badge className={getDifficultyColor(path.difficulty_level)}>
                  <span className="flex items-center space-x-1">
                    {getDifficultyIcon(path.difficulty_level)}
                    <span className="capitalize">{path.difficulty_level}</span>
                  </span>
                </Badge>
                
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {learningPaths.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Learning Paths</h3>
            <p className="text-muted-foreground mb-4">
              Create your first learning path to organize training modules into sequential workflows.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Learning Path
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};