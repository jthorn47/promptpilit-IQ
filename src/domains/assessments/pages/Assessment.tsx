import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { assessmentData, type Section, type Question } from "@/data/assessmentQuestions";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { CompanyInfoForm, type CompanyInfo } from "@/components/CompanyInfoForm";
import { SEOHead } from "@/components/SEOHead";
import { useBreakpoint } from "@/hooks/use-mobile";
import easeworksLogo from "@/assets/easeworks-logo.png";
import easelearnLogo from "@/assets/easelearn-logo.png";

interface Answer {
  questionId: string;
  selectedOption: number;
  score: number;
}

const Assessment = () => {
  const { isMobile, isTablet, isMobileOrTablet } = useBreakpoint();
  
  // Check if we're on the EaseWorks domain - more comprehensive check
  const currentDomain = window.location.hostname;
  const currentUrl = window.location.href;
  
  // Debug logging
  console.log('🌐 Assessment Domain Detection:', {
    hostname: currentDomain,
    url: currentUrl,
    href: window.location.href,
    protocol: window.location.protocol,
    port: window.location.port
  });
  
  const isEaseWorksDomain = currentDomain === 'score.easeworks.com' || 
                           currentDomain === 'easeworks.com' ||
                           currentDomain === 'www.easeworks.com' ||
                           currentDomain.includes('easeworks');
  
  // Choose logo based on domain
  const logoSrc = isEaseWorksDomain ? easeworksLogo : easelearnLogo;
  const logoAlt = isEaseWorksDomain ? "EaseWorks - Workplace Safety Assessment" : "EaseLearn - Workplace Safety Assessment";
  const logoName = isEaseWorksDomain ? "EaseWorks" : "EaseLearn";
  
  console.log('🏢 Logo Selection Debug:', { 
    currentDomain, 
    isEaseWorksDomain, 
    logoName,
    logoSrc,
    easeworksLogo,
    easelearnLogo 
  });
  
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentSection = assessmentData[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const totalQuestions = assessmentData.reduce((sum, section) => sum + section.questions.length, 0);
  const completedQuestions = answers.length;
  const progress = (completedQuestions / totalQuestions) * 100;

  // Initialize timer on mount
  useEffect(() => {
    const now = new Date();
    setStartTime(now);
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      setElapsedTime(Math.floor((now.getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressMessage = () => {
    if (progress < 25) {
      return "🚀 Great start! Keep the momentum going.";
    } else if (progress < 50) {
      return "💪 You're making excellent progress!";
    } else if (progress < 75) {
      return "🎯 More than halfway there - you're doing great!";
    } else if (progress < 95) {
      return "🏁 Almost finished! Just a few more questions.";
    }
    return "✨ Final question - you're about to see your results!";
  };

  const getTimeMessage = () => {
    if (elapsedTime < 120) {
      return "⚡ Moving at great pace!";
    } else if (elapsedTime < 240) {
      return "⏱️ Right on track for 5 minutes!";
    } else if (elapsedTime < 360) {
      return "🎯 Taking your time to be thorough - perfect!";
    }
    return "📝 Quality over speed - great job being thoughtful!";
  };

  const checkAchievements = (score: number, isStreak: boolean) => {
    const newAchievements: string[] = [];
    
    // Speed achievements
    if (elapsedTime <= 180 && completedQuestions >= 10) {
      if (!achievements.includes("speed-demon")) {
        newAchievements.push("speed-demon");
      }
    }
    
    // Streak achievements
    if (isStreak) {
      if (streak >= 5 && !achievements.includes("on-fire")) {
        newAchievements.push("on-fire");
      }
      if (streak >= 10 && !achievements.includes("unstoppable")) {
        newAchievements.push("unstoppable");
      }
    }
    
    // Perfect section achievement
    if (currentQuestionIndex === currentSection.questions.length - 1) {
      const sectionAnswers = answers.slice(-currentSection.questions.length);
      const perfectSection = sectionAnswers.every(answer => 
        currentSection.questions.find(q => q.id === answer.questionId)?.options[answer.selectedOption]?.score >= 4
      );
      if (perfectSection && !achievements.includes("section-master")) {
        newAchievements.push("section-master");
      }
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const getAchievementBadge = (achievement: string) => {
    const badges = {
      "speed-demon": { emoji: "⚡", title: "Speed Demon", desc: "Lightning fast responses!" },
      "on-fire": { emoji: "🔥", title: "On Fire", desc: "5 great answers in a row!" },
      "unstoppable": { emoji: "🚀", title: "Unstoppable", desc: "10 perfect answers in a row!" },
      "section-master": { emoji: "🏆", title: "Section Master", desc: "Perfect section completion!" },
    };
    return badges[achievement as keyof typeof badges];
  };

  const handleAnswerSelect = (optionIndex: number) => {
    console.log('🎯 Answer selected:', { optionIndex, isMobile, currentQuestion: currentQuestion.id });
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const selectedScore = currentQuestion.options[selectedOption].score;
    
    // Save the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedOption,
      score: selectedScore
    };

    setAnswers(prev => [...prev, newAnswer]);
    setTotalScore(prev => prev + selectedScore);

    // Update streak tracking
    const isGoodAnswer = selectedScore >= 4;
    if (isGoodAnswer) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      checkAchievements(selectedScore, true);
    } else {
      setStreak(0);
      checkAchievements(selectedScore, false);
    }

    // Move to next question or section
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < assessmentData.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment complete - navigate to results
      navigate('/results', { 
        state: { 
          answers: [...answers, newAnswer],
          companyInfo,
          assessmentData,
          totalTime: elapsedTime,
          achievements,
          bestStreak
        } 
      });
      return;
    }

    setSelectedOption(null);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(assessmentData[currentSectionIndex - 1].questions.length - 1);
    }

    // Remove the last answer
    if (answers.length > 0) {
      setAnswers(prev => prev.slice(0, -1));
    }

    setSelectedOption(null);
  };

  const canGoBack = currentSectionIndex > 0 || currentQuestionIndex > 0;
  const canGoNext = selectedOption !== null;
  
  console.log('🎯 Navigation state:', { 
    selectedOption, 
    canGoNext, 
    canGoBack, 
    isMobile,
    currentQuestionId: currentQuestion?.id 
  });

  // Show company info form first
  if (!companyInfo) {
    return <CompanyInfoForm onComplete={setCompanyInfo} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-muted/20">
      <SEOHead 
        title="Workplace Safety Risk Assessment | EaseWorks"
        description="Take our comprehensive workplace safety assessment to identify risks and get personalized training recommendations. Free evaluation tool for workplace violence prevention and compliance."
        keywords="workplace safety assessment, risk evaluation, workplace violence assessment, safety audit, compliance assessment, free safety evaluation"
        canonicalUrl="https://easeworks.com/assessment"
      />
      
      {/* Header - Mobile optimized */}
      <header className={`px-4 py-4 border-b bg-white backdrop-blur-sm fixed top-0 left-0 right-0 z-[99999] shadow-lg ${
        isMobile ? 'py-3' : 'md:px-6 md:py-6'
      }`} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999, backgroundColor: 'white' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
          <div className="flex items-center justify-center" style={{ position: 'relative', zIndex: 99999 }}>
            <img 
              src={`${logoSrc}?v=${Date.now()}&force=true`}
              alt={logoAlt}
              className={`w-auto ${isMobile ? 'h-8' : 'h-12'}`}
              key={isEaseWorksDomain ? "easeworks-logo" : "easelearn-logo"}
              style={{ 
                position: 'relative', 
                zIndex: 99999, 
                display: 'block',
                visibility: 'visible',
                opacity: 1
              }}
              onError={(e) => console.log('🚨 Logo failed to load:', { logoName, logoSrc, error: e })}
              onLoad={() => console.log('✅ Logo loaded successfully:', { logoName, domain: currentDomain, isEaseWorks: isEaseWorksDomain })}
            />
          </div>
          <div className={`absolute right-0 text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {!isMobile && <span className="hidden sm:inline">Question </span>}
            {completedQuestions + 1}/{totalQuestions}
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className={isMobile ? 'h-14' : 'h-20'}></div>
      {/* Breadcrumbs - Hidden on mobile to save space */}
      {!isMobile && <BreadcrumbNav items={[{ label: "Safety Assessment" }]} className="max-w-4xl mx-auto" />}

      {/* Progress Bar with Timer and Gamification - Mobile optimized */}
      <div className={`px-4 py-3 bg-white/50 backdrop-blur-sm ${!isMobile ? 'md:px-6 md:py-4' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`flex justify-between mb-3 ${isMobile ? 'flex-col space-y-2' : 'flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0'}`}>
            <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-2 md:space-x-4'}`}>
              <div className={`font-semibold text-primary ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>
                ⏱️ {formatTime(elapsedTime)}
              </div>
              {!isMobile && (
                <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  {getTimeMessage()}
                </div>
              )}
            </div>
            
            {/* Gamification Stats - Mobile optimized */}
            <div className={`flex items-center overflow-x-auto ${isMobile ? 'space-x-1 text-xs' : 'space-x-2 md:space-x-4 text-xs md:text-sm'}`}>
              {streak > 0 && (
                <div className={`flex items-center space-x-1 py-1 bg-orange-100 text-orange-700 rounded-full animate-pulse whitespace-nowrap ${
                  isMobile ? 'px-2 text-xs' : 'px-2 md:px-3'
                }`}>
                  <span>🔥</span>
                  <span className="font-semibold">{streak}{isMobile ? '' : ' streak'}</span>
                </div>
              )}
              
              <div className={`flex items-center space-x-1 py-1 bg-primary-muted text-primary rounded-full whitespace-nowrap ${
                isMobile ? 'px-2 text-xs' : 'px-2 md:px-3'
              }`}>
                <span>⭐</span>
                <span className="font-semibold">{totalScore}{isMobile ? '' : ' points'}</span>
              </div>
              
              {achievements.length > 0 && (
                <div className={`flex items-center space-x-1 py-1 bg-success-muted text-success rounded-full whitespace-nowrap ${
                  isMobile ? 'px-2 text-xs' : 'px-2 md:px-3'
                }`}>
                  <span>🏆</span>
                  <span className="font-semibold">{achievements.length}{isMobile ? '' : ' badges'}</span>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={progress} className={isMobile ? 'h-2 mb-2' : 'h-2 md:h-3 mb-3'} />
          
          <div className={`flex justify-between items-center ${isMobile ? 'text-xs' : 'text-xs md:text-sm'}`}>
            <span className="text-muted-foreground truncate">{isMobile ? currentSection.title.substring(0, 20) + '...' : currentSection.title}</span>
            <span className="font-medium text-primary whitespace-nowrap">{Math.round(progress)}%{isMobile ? '' : ' Complete'}</span>
          </div>
          
          {/* Progress encouragement message - Hidden on mobile to save space */}
          {!isMobile && (
            <div className="mt-2 text-xs md:text-sm text-center text-muted-foreground font-medium">
              {getProgressMessage()}
            </div>
          )}
          
          {/* Achievement Celebration */}
          {showCelebration && achievements.length > 0 && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
              <Card className="p-4 md:p-6 bg-gradient-primary text-white shadow-strong text-center mx-4">
                <div className="text-3xl md:text-4xl mb-2">
                  {getAchievementBadge(achievements[achievements.length - 1])?.emoji}
                </div>
                <div className="text-base md:text-lg font-bold mb-1">
                  {getAchievementBadge(achievements[achievements.length - 1])?.title}
                </div>
                <div className="text-xs md:text-sm opacity-90">
                  {getAchievementBadge(achievements[achievements.length - 1])?.desc}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Question Content - Mobile optimized */}
      <main className={`px-4 ${isMobile ? 'py-4' : 'md:px-6 py-8 md:py-12'}`}>
        <div className="max-w-4xl mx-auto">
          <Card className={`shadow-medium ${isMobile ? 'p-3' : 'p-4 md:p-8'}`}>
            {/* Section Info - Mobile optimized */}
            <div className={isMobile ? 'mb-4' : 'mb-6 md:mb-8'}>
              <div className={`font-medium text-primary mb-2 ${isMobile ? 'text-xs' : 'text-xs md:text-sm'}`}>
                {currentSection.title}
              </div>
              <h1 className={`font-bold text-foreground leading-tight ${
                isMobile ? 'text-lg mb-2' : 'text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4'
              }`}>
                {currentQuestion.question}
              </h1>
              {!isMobile && (
                <p className="text-sm md:text-base text-muted-foreground">
                  {currentSection.description}
                </p>
              )}
            </div>

            {/* Answer Options - Mobile optimized */}
            <div className={`mb-6 ${isMobile ? 'space-y-2 md:mb-4' : 'space-y-3 md:space-y-4 md:mb-8'}`}>
              {currentQuestion.options.map((option, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 border-2 ${
                    isMobile ? 'p-3 active:scale-95' : 'p-4 md:p-6'
                  } ${
                    selectedOption === index
                      ? 'border-primary bg-primary-muted shadow-medium'
                      : 'border-border hover:border-primary/50 hover:shadow-soft'
                  }`}
                  style={{ 
                    touchAction: 'manipulation',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onTouchStart={() => {
                    console.log('🎯 Touch start:', { index, isMobile });
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🎯 Card clicked:', { index, isMobile, selectedOption });
                    handleAnswerSelect(index);
                  }}
                >
                  <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3 md:space-x-4'}`}>
                    <div className={`rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      isMobile ? 'w-4 h-4' : 'w-5 h-5'
                    } ${
                      selectedOption === index
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-foreground ${
                        isMobile ? 'text-sm mb-1' : 'text-sm md:text-base mb-2'
                      }`}>
                        {option.text}
                      </div>
                      {selectedOption === index && (
                        <div className={`text-muted-foreground bg-white/50 rounded-lg border border-primary/20 ${
                          isMobile ? 'text-xs p-2' : 'text-xs md:text-sm p-2 md:p-3'
                        }`}>
                          {option.score >= 4 ? (
                            <>✅ <strong>Great Choice!</strong> {isMobile ? '' : option.riskTip}</>
                          ) : option.score >= 3 ? (
                            <>💡 <strong>Good Progress:</strong> {isMobile ? '' : option.riskTip}</>
                          ) : (
                            <>⚠️ <strong>Risk Alert:</strong> {isMobile ? '' : option.riskTip}</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Navigation - Mobile optimized */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={!canGoBack}
                className={`flex items-center space-x-2 ${
                  isMobile ? 'min-h-[44px] px-3 text-sm' : 'min-h-[48px] px-4 md:px-6'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`flex items-center space-x-2 transition-all duration-300 ${
                  isMobile ? 'min-h-[44px] px-3 text-sm' : 'min-h-[48px] px-4 md:px-6'
                } ${
                  canGoNext 
                    ? 'bg-gradient-to-r from-[#655DC6] to-[#7B73D9] hover:from-[#5A51B8] hover:to-[#655DC6] text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
                  {currentSectionIndex === assessmentData.length - 1 && 
                   currentQuestionIndex === currentSection.questions.length - 1
                    ? 'Get Results'
                    : 'Next'
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Helper text when no option is selected */}
            {!canGoNext && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                  👆 Please select an answer above to continue
                </p>
              </div>
            )}
            
            {/* Success indicator when answer is selected */}
            {canGoNext && (
              <div className="mt-4 text-center">
                <p className="text-sm text-[#655DC6] bg-[#655DC6]/10 px-4 py-2 rounded-lg font-medium">
                  ✅ Answer selected! Tap "Next" to continue
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Assessment;