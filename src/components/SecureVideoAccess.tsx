import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lock, Unlock, Play, Clock, Trophy, AlertTriangle } from 'lucide-react';

interface CoursePackage {
  id: string;
  name: string;
  description: string;
  course_count: number;
}

interface UserSeat {
  id: string;
  total_seats: number;
  used_seats: number;
  remaining_seats: number;
  purchased_at: string;
  status: string;
  expires_at?: string;
  course_packages: CoursePackage;
}

interface UnlockedCourse {
  id: string;
  training_module_id: string;
  unlocked_at: string;
  last_accessed_at?: string;
  certificate_generated: boolean;
  training_modules: {
    title: string;
    description: string;
    thumbnail_url?: string;
    estimated_duration?: number;
  };
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  estimated_duration?: number;
  category: string;
  status: string;
  is_published: boolean;
}

export const SecureVideoAccess: React.FC = () => {
  const { user } = useAuth();
  const [seats, setSeats] = useState<UserSeat[]>([]);
  const [unlockedCourses, setUnlockedCourses] = useState<UnlockedCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockingCourse, setUnlockingCourse] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchAvailableCourses();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { action: 'get_user_seats' }
      });

      if (error) throw error;

      if (data.success) {
        setSeats(data.seats);
        setUnlockedCourses(data.unlocked_courses);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('id, title, description, thumbnail_url, estimated_duration, category, status, is_published')
        .eq('is_published', true)
        .eq('status', 'published');

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };

  const handleUnlockCourse = async (moduleId: string, moduleTitle: string) => {
    if (!user) return;

    setUnlockingCourse(moduleId);

    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { 
          action: 'unlock_course',
          trainingModuleId: moduleId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`🎉 Course "${moduleTitle}" unlocked successfully!`);
        await fetchUserData(); // Refresh data
      } else {
        throw new Error(data.error || 'Failed to unlock course');
      }
    } catch (error) {
      console.error('Error unlocking course:', error);
      toast.error(`Failed to unlock course: ${error.message}`);
    } finally {
      setUnlockingCourse(null);
    }
  };

  const handleAccessCourse = async (moduleId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { 
          action: 'generate_video_token',
          trainingModuleId: moduleId
        }
      });

      if (error) throw error;

      if (data.success) {
        // Navigate to secure video player with token
        const params = new URLSearchParams({
          token: data.video_token,
          module: moduleId,
          session: data.session_token
        });
        
        window.open(`/secure-video-player?${params.toString()}`, '_blank');
      } else {
        throw new Error(data.error || 'Failed to access course');
      }
    } catch (error) {
      console.error('Error accessing course:', error);
      toast.error(`Failed to access course: ${error.message}`);
    }
  };

  const getTotalRemainingSeats = () => {
    return seats.reduce((total, seat) => total + seat.remaining_seats, 0);
  };

  const isModuleUnlocked = (moduleId: string) => {
    return unlockedCourses.some(course => course.training_module_id === moduleId);
  };

  const getUnlockedCourse = (moduleId: string) => {
    return unlockedCourses.find(course => course.training_module_id === moduleId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Seat Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Course Seats
          </CardTitle>
          <CardDescription>
            Manage your training course access and view remaining seats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-2xl font-bold text-primary">
                {getTotalRemainingSeats()}
              </div>
              <div className="text-sm text-muted-foreground">Remaining Seats</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {unlockedCourses.length}
              </div>
              <div className="text-sm text-muted-foreground">Unlocked Courses</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {unlockedCourses.filter(c => c.certificate_generated).length}
              </div>
              <div className="text-sm text-muted-foreground">Certificates Earned</div>
            </div>
          </div>

          {seats.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Seat Packages</h4>
              <div className="space-y-2">
                {seats.map(seat => (
                  <div key={seat.id} className="flex items-center justify-between p-3 bg-background rounded border">
                    <div>
                      <div className="font-medium">{seat.course_packages.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Purchased: {new Date(seat.purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {seat.remaining_seats} / {seat.total_seats} seats
                      </div>
                      <Badge variant={seat.remaining_seats > 0 ? "default" : "secondary"}>
                        {seat.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unlocked Courses */}
      {unlockedCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Your Unlocked Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedCourses.map(course => (
              <Card key={course.id} className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Unlock className="h-5 w-5 text-green-600 mt-1" />
                    <Badge variant="default" className="bg-green-600">
                      Unlocked
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.training_modules.title}</CardTitle>
                  <CardDescription>{course.training_modules.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.training_modules.estimated_duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {Math.round(course.training_modules.estimated_duration / 60)} minutes
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      Unlocked: {new Date(course.unlocked_at).toLocaleDateString()}
                    </div>

                    {course.last_accessed_at && (
                      <div className="text-sm text-muted-foreground">
                        Last accessed: {new Date(course.last_accessed_at).toLocaleDateString()}
                      </div>
                    )}

                    {course.certificate_generated && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Trophy className="h-3 w-3 mr-1" />
                        Certificate Earned
                      </Badge>
                    )}

                    <Button 
                      onClick={() => handleAccessCourse(course.training_module_id)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Training
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Available Training Courses</h2>
        
        {getTotalRemainingSeats() === 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900 dark:text-orange-100">
                    No Seats Available
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    You need to purchase course seats to unlock training modules.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map(module => {
            const isUnlocked = isModuleUnlocked(module.id);
            const canUnlock = getTotalRemainingSeats() > 0 && !isUnlocked;

            return (
              <Card key={module.id} className={isUnlocked ? "border-green-200" : "border-muted"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    {isUnlocked ? (
                      <Unlock className="h-5 w-5 text-green-600 mt-1" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground mt-1" />
                    )}
                    <Badge variant={isUnlocked ? "default" : "secondary"}>
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {module.estimated_duration && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {Math.round(module.estimated_duration / 60)} minutes
                      </div>
                    )}

                    <Badge variant="outline">{module.category}</Badge>

                    {isUnlocked ? (
                      <Button 
                        onClick={() => handleAccessCourse(module.id)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Training
                      </Button>
                    ) : canUnlock ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                    disabled={unlockingCourse === module.id}
                                  >
                                    {unlockingCourse === module.id ? (
                                      "Unlocking..."
                                    ) : (
                                      <>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Unlock Course
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Unlock Training Course</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      You are about to use <strong>1</strong> of your <strong>{getTotalRemainingSeats()}</strong> remaining seats for:
                                      <br /><br />
                                      <strong>"{module.title}"</strong>
                                      <br /><br />
                                      Once unlocked, this cannot be changed and you will have unlimited access to this course content and can earn a certificate upon completion.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUnlockCourse(module.id, module.title)}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      Confirm Unlock
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This will use 1 of your {getTotalRemainingSeats()} remaining seats</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Button disabled className="w-full">
                        <Lock className="h-4 w-4 mr-2" />
                        No Seats Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};