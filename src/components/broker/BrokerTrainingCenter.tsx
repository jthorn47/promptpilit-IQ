import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Book, Award, Clock, Star, CheckCircle } from "lucide-react";

export const BrokerTrainingCenter = () => {
  // Mock training data
  const trainingModules = [
    {
      id: 1,
      title: "HALO Payroll Fundamentals",
      description: "Complete overview of HALOworks payroll services and features",
      category: "product_training",
      contentType: "video",
      duration: 45,
      difficultyLevel: "beginner",
      isRequired: true,
      progress: 100,
      status: "completed",
      passingScore: 80,
      userScore: 95
    },
    {
      id: 2,
      title: "Advanced Sales Techniques",
      description: "Master consultative selling approaches for complex HR solutions",
      category: "sales_training",
      contentType: "interactive",
      duration: 90,
      difficultyLevel: "advanced",
      isRequired: false,
      progress: 65,
      status: "in_progress",
      passingScore: 85,
      userScore: null
    },
    {
      id: 3,
      title: "Compliance & Regulatory Updates",
      description: "Stay current with HR compliance requirements and regulations",
      category: "compliance",
      contentType: "document",
      duration: 30,
      difficultyLevel: "intermediate",
      isRequired: true,
      progress: 0,
      status: "not_started",
      passingScore: 80,
      userScore: null
    },
    {
      id: 4,
      title: "HALO Certified Partner Exam",
      description: "Final certification exam for elite partner status",
      category: "certification",
      contentType: "quiz",
      duration: 60,
      difficultyLevel: "advanced",
      isRequired: true,
      progress: 0,
      status: "locked",
      passingScore: 90,
      userScore: null
    }
  ];

  const certifications = [
    {
      id: 1,
      name: "HALO Certified Partner",
      status: "in_progress",
      progress: 75,
      completedModules: 3,
      totalModules: 4,
      expiresAt: null
    },
    {
      id: 2,
      name: "Payroll Specialist",
      status: "completed",
      progress: 100,
      completedModules: 2,
      totalModules: 2,
      expiresAt: "2025-01-15"
    },
    {
      id: 3,
      name: "Sales Expert",
      status: "not_started",
      progress: 0,
      completedModules: 0,
      totalModules: 3,
      expiresAt: null
    }
  ];

  const categoryColors = {
    product_training: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    sales_training: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    compliance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    certification: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
  };

  const statusColors = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    not_started: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    locked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };

  const completedModules = trainingModules.filter(m => m.status === 'completed').length;
  const totalProgress = Math.round((completedModules / trainingModules.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Training Center</h2>
        <p className="text-muted-foreground">Enhance your expertise and earn certifications</p>
      </div>

      {/* Training Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Training Progress
            </CardTitle>
            <Book className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {totalProgress}%
            </div>
            <Progress value={totalProgress} className="w-full mb-2" />
            <p className="text-xs text-muted-foreground">
              {completedModules} of {trainingModules.length} modules completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Certifications
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {certifications.filter(c => c.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active certifications earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Learning Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              4.2h
            </div>
            <p className="text-xs text-muted-foreground">
              Total learning time this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Your Certifications</CardTitle>
          <CardDescription>
            Track your certification progress and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{cert.name}</h4>
                    <Badge className={statusColors[cert.status as keyof typeof statusColors]}>
                      {cert.status.replace('_', ' ')}
                    </Badge>
                    {cert.status === 'completed' && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Certified
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{cert.completedModules} / {cert.totalModules} modules</span>
                      {cert.expiresAt && (
                        <span>Expires: {new Date(cert.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Progress value={cert.progress} className="w-full mt-2" />
                  </div>
                </div>
                <div className="ml-4">
                  {cert.status === 'completed' ? (
                    <Button variant="outline" size="sm">
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button size="sm">
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>
            Complete these modules to enhance your expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map((module) => (
              <Card key={module.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                    {module.isRequired && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className={categoryColors[module.category as keyof typeof categoryColors]}>
                      {module.category.replace('_', ' ')}
                    </Badge>
                    <Badge className={difficultyColors[module.difficultyLevel as keyof typeof difficultyColors]}>
                      {module.difficultyLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {module.duration} minutes
                      </div>
                      <div className="flex items-center gap-2">
                        {module.contentType === 'video' && <PlayCircle className="w-4 h-4" />}
                        {module.contentType === 'document' && <Book className="w-4 h-4" />}
                        {module.contentType === 'quiz' && <Award className="w-4 h-4" />}
                        {module.contentType === 'interactive' && <Star className="w-4 h-4" />}
                        {module.contentType}
                      </div>
                    </div>
                    
                    {module.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="w-full" />
                      </div>
                    )}

                    {module.userScore && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Score: {module.userScore}% (Required: {module.passingScore}%)</span>
                      </div>
                    )}

                    <div className="pt-2">
                      {module.status === 'locked' ? (
                        <Button disabled variant="outline" className="w-full">
                          Locked - Complete prerequisites
                        </Button>
                      ) : module.status === 'completed' ? (
                        <Button variant="outline" className="w-full">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review Module
                        </Button>
                      ) : (
                        <Button className="w-full">
                          {module.status === 'not_started' ? 'Start Module' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};