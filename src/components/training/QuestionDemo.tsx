import React, { useState } from 'react';
import { QuestionSequence } from './QuestionSequence';
import { QuestionData } from './QuestionPresentation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Eye } from 'lucide-react';

// Sample question data demonstrating all question types
const sampleQuestions: QuestionData[] = [
  {
    id: 'q1',
    type: 'multiple_choice_single',
    title: 'What is the primary purpose of workplace safety training?',
    description: 'Choose the most accurate answer based on OSHA guidelines.',
    imageUrl: '/assets/training/safety-training.jpg',
    options: [
      {
        id: 'q1_opt1',
        text: 'To comply with legal requirements only',
        isCorrect: false,
        explanation: 'While compliance is important, it\'s not the only purpose.'
      },
      {
        id: 'q1_opt2',
        text: 'To prevent workplace injuries and create a safer work environment',
        isCorrect: true,
        explanation: 'Correct! Safety training aims to protect workers and reduce accidents.'
      },
      {
        id: 'q1_opt3',
        text: 'To reduce insurance costs',
        isCorrect: false,
        explanation: 'Cost reduction is a benefit, but not the primary purpose.'
      },
      {
        id: 'q1_opt4',
        text: 'To satisfy employee requests',
        isCorrect: false,
        explanation: 'Employee satisfaction is important but not the main goal.'
      }
    ],
    correctFeedback: 'Excellent! You understand the core purpose of workplace safety.',
    incorrectFeedback: 'Safety training is primarily about preventing injuries and protecting workers.',
    explanation: 'Workplace safety training is designed to educate employees about potential hazards and safe work practices to prevent accidents and injuries.',
    points: 2,
    isRequired: true
  },
  {
    id: 'q2',
    type: 'multiple_choice_multiple',
    title: 'Which of the following are signs of workplace harassment?',
    description: 'Select all that apply. This is a multi-select question.',
    options: [
      {
        id: 'q2_opt1',
        text: 'Unwelcome comments about appearance',
        isCorrect: true
      },
      {
        id: 'q2_opt2',
        text: 'Constructive feedback about work performance',
        isCorrect: false
      },
      {
        id: 'q2_opt3',
        text: 'Exclusion from work-related activities based on protected characteristics',
        isCorrect: true
      },
      {
        id: 'q2_opt4',
        text: 'Requests to complete assigned work tasks',
        isCorrect: false
      },
      {
        id: 'q2_opt5',
        text: 'Offensive jokes or language',
        isCorrect: true
      }
    ],
    correctFeedback: 'Great job identifying the signs of harassment!',
    incorrectFeedback: 'Review the definition of workplace harassment and try again.',
    explanation: 'Harassment includes unwelcome behavior based on protected characteristics, but does not include legitimate work-related requests or constructive feedback.',
    points: 3
  },
  {
    id: 'q3',
    type: 'true_false',
    title: 'Employees must report safety violations immediately to their supervisor.',
    description: 'Consider company policy and legal requirements.',
    options: [
      {
        id: 'q3_opt1',
        text: 'True',
        isCorrect: true
      },
      {
        id: 'q3_opt2',
        text: 'False',
        isCorrect: false
      }
    ],
    correctFeedback: 'Correct! Immediate reporting helps prevent accidents.',
    incorrectFeedback: 'Safety violations should be reported immediately to prevent potential injuries.',
    explanation: 'OSHA requires employees to report safety hazards promptly. Delaying reports can lead to accidents and injuries.',
    points: 1
  },
  {
    id: 'q4',
    type: 'scenario_based',
    title: 'Workplace Scenario: Harassment Response',
    description: 'You witness a coworker making inappropriate comments to another employee. The victim looks uncomfortable but hasn\'t said anything. What should you do?',
    imageUrl: '/assets/training/workplace-scenario.jpg',
    options: [
      {
        id: 'q4_opt1',
        text: 'Ignore it since the victim didn\'t complain',
        isCorrect: false,
        explanation: 'Ignoring harassment allows it to continue and escalate.'
      },
      {
        id: 'q4_opt2',
        text: 'Speak to the victim privately and offer support, then report to HR',
        isCorrect: true,
        explanation: 'This shows support for the victim while ensuring proper reporting.'
      },
      {
        id: 'q4_opt3',
        text: 'Confront the harasser directly in front of everyone',
        isCorrect: false,
        explanation: 'Direct confrontation might escalate the situation and embarrass the victim.'
      },
      {
        id: 'q4_opt4',
        text: 'Tell other coworkers about what you saw',
        isCorrect: false,
        explanation: 'Gossiping doesn\'t help the situation and may harm the victim.'
      }
    ],
    correctFeedback: 'Excellent! You understand how to be a supportive bystander.',
    incorrectFeedback: 'Consider both supporting the victim and following proper reporting procedures.',
    explanation: 'Bystander intervention should prioritize victim support and proper reporting channels to ensure effective resolution.',
    points: 3,
    isRequired: true
  }
];

export const QuestionDemo: React.FC = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [demoSettings, setDemoSettings] = useState({
    allowRetry: true,
    allowSkip: false,
    showFeedback: true,
    passingScore: 80
  });

  const handleComplete = (responses: any[], finalScore: number) => {
    console.log('Quiz completed:', { responses, finalScore });
    setIsDemo(false);
  };

  const handleQuestionAnswered = (response: any) => {
    console.log('Question answered:', response);
  };

  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setIsDemo(false)}
              className="mb-4"
            >
              ← Back to Demo Settings
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              EaseBASE Training Question Demo
            </h1>
            <p className="text-muted-foreground">
              Experience our interactive question presentation system
            </p>
          </div>

          <QuestionSequence
            questions={sampleQuestions}
            onComplete={handleComplete}
            onQuestionAnswered={handleQuestionAnswered}
            allowRetry={demoSettings.allowRetry}
            allowSkip={demoSettings.allowSkip}
            showFeedback={demoSettings.showFeedback}
            passingScore={demoSettings.passingScore}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            EaseBASE Question Presentation System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive, accessible, and responsive question interface for workplace training modules
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">WCAG 2.2 AA Compliant</Badge>
            <Badge variant="secondary">Mobile Optimized</Badge>
            <Badge variant="secondary">Screen Reader Ready</Badge>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">✓ Multiple Choice (Single)</div>
              <div className="text-sm">✓ Multiple Choice (Multiple)</div>
              <div className="text-sm">✓ True/False</div>
              <div className="text-sm">✓ Scenario-Based</div>
              <div className="text-sm">✓ Media Support (Images/Video)</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">✓ Keyboard Navigation</div>
              <div className="text-sm">✓ Screen Reader Support</div>
              <div className="text-sm">✓ High Contrast Support</div>
              <div className="text-sm">✓ Focus Management</div>
              <div className="text-sm">✓ ARIA Labels & Roles</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">✓ Progress Tracking</div>
              <div className="text-sm">✓ Immediate Feedback</div>
              <div className="text-sm">✓ Retry Mechanism</div>
              <div className="text-sm">✓ Smooth Animations</div>
              <div className="text-sm">✓ Mobile-First Design</div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Demo Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Quiz Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={demoSettings.allowRetry}
                      onChange={(e) => setDemoSettings(prev => ({ ...prev, allowRetry: e.target.checked }))}
                      className="rounded border-gray-300 text-[#655DC6] focus:ring-[#655DC6]"
                    />
                    <span className="text-sm">Allow retry for incorrect answers</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={demoSettings.allowSkip}
                      onChange={(e) => setDemoSettings(prev => ({ ...prev, allowSkip: e.target.checked }))}
                      className="rounded border-gray-300 text-[#655DC6] focus:ring-[#655DC6]"
                    />
                    <span className="text-sm">Allow skipping questions</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={demoSettings.showFeedback}
                      onChange={(e) => setDemoSettings(prev => ({ ...prev, showFeedback: e.target.checked }))}
                      className="rounded border-gray-300 text-[#655DC6] focus:ring-[#655DC6]"
                    />
                    <span className="text-sm">Show immediate feedback</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Scoring</h4>
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium">Passing Score (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={demoSettings.passingScore}
                      onChange={(e) => setDemoSettings(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 80 }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#655DC6] focus:ring-[#655DC6]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sample Questions Preview */}
            <div className="space-y-4">
              <h4 className="font-medium">Sample Questions ({sampleQuestions.length})</h4>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <div key={question.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      <span className="text-sm font-medium">
                        {question.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground truncate max-w-md">
                        {question.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.isRequired && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {question.points} {question.points === 1 ? 'pt' : 'pts'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setIsDemo(true)}
              size="lg"
              className="w-full bg-[#655DC6] hover:bg-[#5a52b8] text-white gap-2"
            >
              <Play className="w-5 h-5" />
              Start Interactive Demo
            </Button>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Technical Implementation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Accessibility Standards</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• ARIA roles and properties for screen readers</li>
                  <li>• Keyboard navigation with focus management</li>
                  <li>• Color contrast ratios meeting WCAG 2.2 AA</li>
                  <li>• Live regions for dynamic content updates</li>
                  <li>• Semantic HTML structure</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Responsive Design</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Mobile-first approach with touch-friendly targets</li>
                  <li>• Adaptive layouts for tablet and desktop</li>
                  <li>• Scalable typography and spacing</li>
                  <li>• Optimized media loading and display</li>
                  <li>• Smooth animations with reduced motion support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};