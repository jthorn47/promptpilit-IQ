import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizBuilder } from './QuizBuilder';
import { QuizTaker } from './QuizTaker';
import { QuizAnalytics } from './QuizAnalytics';
import { FileText, Brain, BarChart3, Settings, Plus, Play, Eye } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: any[];
  config: any;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  attempts: number;
  pass_rate: number;
}

interface QuizIntegrationProps {
  documentId?: string;
  sectionId?: string;
  onQuizCreated?: (quiz: Quiz) => void;
  onQuizUpdated?: (quiz: Quiz) => void;
}

export const QuizIntegration: React.FC<QuizIntegrationProps> = ({
  documentId,
  sectionId,
  onQuizCreated,
  onQuizUpdated
}) => {
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'taker' | 'analytics'>('list');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');

  // Mock data - in real implementation, this would come from Supabase
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Workplace Safety Quiz',
      description: 'Test your knowledge of workplace safety procedures',
      questions: [],
      config: {
        title: 'Workplace Safety Quiz',
        passing_score: 80,
        max_attempts: 3,
        time_limit_minutes: 15,
        show_results_immediately: true,
        show_correct_answers: true
      },
      status: 'active',
      created_at: '2024-01-15',
      attempts: 45,
      pass_rate: 87
    },
    {
      id: '2',
      title: 'Harassment Prevention Training',
      description: 'Understanding harassment policies and procedures',
      questions: [],
      config: {
        title: 'Harassment Prevention Training',
        passing_score: 90,
        max_attempts: 2,
        time_limit_minutes: 20,
        show_results_immediately: true,
        show_correct_answers: false
      },
      status: 'active',
      created_at: '2024-01-10',
      attempts: 32,
      pass_rate: 94
    },
    {
      id: '3',
      title: 'OSHA Compliance Assessment',
      description: 'Draft quiz for OSHA compliance training',
      questions: [],
      config: {
        title: 'OSHA Compliance Assessment',
        passing_score: 85,
        max_attempts: 3,
        time_limit_minutes: 25,
        show_results_immediately: true,
        show_correct_answers: true
      },
      status: 'draft',
      created_at: '2024-01-20',
      attempts: 0,
      pass_rate: 0
    }
  ]);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setActiveView('builder');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveView('builder');
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveView('taker');
  };

  const handleViewAnalytics = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveView('analytics');
  };

  const handleSaveQuiz = (config: any, questions: any[]) => {
    if (selectedQuiz) {
      // Update existing quiz
      const updatedQuiz = {
        ...selectedQuiz,
        config,
        questions,
        status: 'active' as const
      };
      setQuizzes(quizzes.map(q => q.id === selectedQuiz.id ? updatedQuiz : q));
      if (onQuizUpdated) {
        onQuizUpdated(updatedQuiz);
      }
    } else {
      // Create new quiz
      const newQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title: config.title,
        description: config.description,
        config,
        questions,
        status: 'draft',
        created_at: new Date().toISOString(),
        attempts: 0,
        pass_rate: 0
      };
      setQuizzes([...quizzes, newQuiz]);
      if (onQuizCreated) {
        onQuizCreated(newQuiz);
      }
    }
    setActiveView('list');
  };

  const toggleQuizStatus = (quizId: string, newStatus: 'active' | 'archived') => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
    ));
  };

  if (activeView === 'builder') {
    return (
      <QuizBuilder
        trainingModuleId={documentId}
        onSave={handleSaveQuiz}
        onCancel={() => setActiveView('list')}
      />
    );
  }

  if (activeView === 'taker' && selectedQuiz) {
    return (
      <QuizTaker
        quizId={selectedQuiz.id}
        questions={selectedQuiz.questions}
        config={selectedQuiz.config}
        onComplete={(responses, score) => {
          console.log('Quiz completed:', { responses, score });
          setActiveView('list');
        }}
        onCancel={() => setActiveView('list')}
      />
    );
  }

  if (activeView === 'analytics' && selectedQuiz) {
    // Mock analytics data
    const mockAnalyticsData = {
      overview: {
        total_attempts: selectedQuiz.attempts,
        total_completions: Math.floor(selectedQuiz.attempts * 0.9),
        average_score: selectedQuiz.pass_rate,
        pass_rate: selectedQuiz.pass_rate,
        average_time_minutes: 12
      },
      question_analytics: [],
      employee_performance: [],
      time_series: []
    };

    return (
      <QuizAnalytics
        quizId={selectedQuiz.id}
        analyticsData={mockAnalyticsData}
        onExport={() => console.log('Export analytics')}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Quiz Management</h2>
          <p className="text-muted-foreground">Create and manage quizzes for your training modules</p>
        </div>
        <Button onClick={handleCreateQuiz}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredQuizzes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 
                'No quizzes match your search criteria.' : 
                'No quizzes created yet. Click "Create Quiz" to get started.'
              }
            </CardContent>
          </Card>
        ) : (
          filteredQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <Badge variant={
                        quiz.status === 'active' ? 'default' :
                        quiz.status === 'draft' ? 'secondary' : 'outline'
                      }>
                        {quiz.status}
                      </Badge>
                    </div>
                    {quiz.description && (
                      <p className="text-muted-foreground">{quiz.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuiz(quiz)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {quiz.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTakeQuiz(quiz)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalytics(quiz)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Questions</div>
                    <div className="font-medium">{quiz.questions.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Attempts</div>
                    <div className="font-medium">{quiz.attempts}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Pass Rate</div>
                    <div className="font-medium">{quiz.pass_rate}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div className="font-medium">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Passing Score: {quiz.config.passing_score}% • 
                    Max Attempts: {quiz.config.max_attempts} • 
                    Time Limit: {quiz.config.time_limit_minutes ? `${quiz.config.time_limit_minutes}min` : 'None'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`status-${quiz.id}`} className="text-sm">
                      {quiz.status === 'active' ? 'Archive' : 'Activate'}
                    </Label>
                    <Switch
                      id={`status-${quiz.id}`}
                      checked={quiz.status === 'active'}
                      onCheckedChange={(checked) => 
                        toggleQuizStatus(quiz.id, checked ? 'active' : 'archived')
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};