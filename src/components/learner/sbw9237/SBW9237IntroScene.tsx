import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, Shield, AlertTriangle, Users, Building, Clock, CheckCircle, Star, Zap, Target, Award, ArrowRight, RotateCcw } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

interface ScrollTimingConfig {
  segments: Array<{
    id: string;
    text: string;
    startTime: number;
    label: string;
  }>;
  audioDuration: number;
  lastUpdated: string;
}

interface SBW9237IntroSceneProps {
  companySettings: any;
  onNext: () => void;
  isCompleted: boolean;
  testingMode?: boolean; // New prop to bypass timing restrictions
}

export const SBW9237IntroScene = ({ 
  companySettings, 
  onNext, 
  isCompleted,
  testingMode = false
}: SBW9237IntroSceneProps) => {
  console.log('🏢 SBW9237IntroScene - companySettings:', companySettings);
  const { getSettingValue, loading: settingsLoading } = useSystemSettings();
  const [isPreloading, setIsPreloading] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isManualScroll, setIsManualScroll] = useState<boolean>(false);
  const [lastManualScrollTime, setLastManualScrollTime] = useState<number>(0);
  const [textSections, setTextSections] = useState<string[]>([]);
  const [sectionTimings, setSectionTimings] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimationRef = useRef<number | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get Easelearn logo URL - using the same path as the Logo component
  const easelearnLogoUrl = "/lovable-uploads/438db28b-3492-43f0-8609-ce63c778e329.png";
  
  console.log('🏢 Easelearn logo URL from settings:', easelearnLogoUrl);
  console.log('🏢 Settings loading state:', settingsLoading);

  // Process text into segments when component mounts
  useEffect(() => {
    const processTextIntoSegments = () => {
      // Check if we have custom scroll timing configuration
      const scrollConfig = companySettings?.intro_scroll_timing_config as ScrollTimingConfig | null;
      console.log('🎯 Scroll config from DB:', scrollConfig);
      
      if (scrollConfig && scrollConfig.segments && scrollConfig.segments.length > 0) {
        // Use configured segments and timing
        const segments = scrollConfig.segments.map(segment => segment.text);
        const timings = scrollConfig.segments.map(segment => segment.startTime);
        
        setTextSections(segments);
        setSectionTimings(timings);
        console.log('🎯 Using custom scroll timing:', { segments: segments.length, timings });
        return;
      }

      if (!companySettings?.intro_custom_text) {
        // Use default segmented text
        const defaultSegments = [
          "Welcome to Your Training:",
          "This training was prepared specifically for your organization as part of your compliance with California Labor Code §6401.9 (SB 553).",
          "The purpose of this training is to help you understand the risks, responsibilities, and prevention strategies related to workplace violence.",
          "During this session, you will learn about identifying potential threats, de-escalation techniques, emergency procedures, and how to create a safer work environment for everyone.",
          "Please listen carefully as we guide you through these important safety concepts that protect both you and your colleagues.",
          "Let's begin your journey to a safer workplace."
        ];
        setTextSections(defaultSegments);
        return;
      }

      const text = companySettings.intro_custom_text;
      const segments: string[] = [];
      
      // Split by double newlines first (paragraph breaks)
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      
      for (const paragraph of paragraphs) {
        const lines = paragraph.split('\n').filter(l => l.trim());
        
        // If paragraph has multiple lines, process each meaningful chunk
        if (lines.length > 1) {
          let currentSegment = '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Section headers (lines ending with colon) get their own segment
            if (trimmedLine.endsWith(':')) {
              if (currentSegment) {
                segments.push(currentSegment.trim());
                currentSegment = '';
              }
              segments.push(trimmedLine);
            } else if (trimmedLine.startsWith('\t•') || trimmedLine.startsWith('•')) {
              // Bullet points - group multiple bullets together
              currentSegment += (currentSegment ? '\n' : '') + trimmedLine;
            } else {
              // Regular content
              if (currentSegment && currentSegment.length > 150) {
                // If current segment is getting long, finalize it
                segments.push(currentSegment.trim());
                currentSegment = trimmedLine;
              } else {
                currentSegment += (currentSegment ? '\n' : '') + trimmedLine;
              }
            }
          }
          
          if (currentSegment) {
            segments.push(currentSegment.trim());
          }
        } else {
          // Single line paragraph
          segments.push(lines[0].trim());
        }
      }
      
      // Ensure we have 6-10 segments by merging or splitting as needed
      let processedSegments = segments;
      if (processedSegments.length > 10) {
        // Merge smaller segments
        const merged: string[] = [];
        for (let i = 0; i < processedSegments.length; i += 2) {
          if (i + 1 < processedSegments.length && 
              processedSegments[i].length < 100 && 
              processedSegments[i + 1].length < 100) {
            merged.push(processedSegments[i] + '\n\n' + processedSegments[i + 1]);
          } else {
            merged.push(processedSegments[i]);
            if (i + 1 < processedSegments.length) {
              merged.push(processedSegments[i + 1]);
            }
          }
        }
        processedSegments = merged.slice(0, 10);
      } else if (processedSegments.length < 6) {
        // Split longer segments
        const expanded: string[] = [];
        for (const segment of processedSegments) {
          if (segment.length > 200) {
            const sentences = segment.split('. ');
            const mid = Math.ceil(sentences.length / 2);
            expanded.push(sentences.slice(0, mid).join('. ') + '.');
            expanded.push(sentences.slice(mid).join('. '));
          } else {
            expanded.push(segment);
          }
        }
        processedSegments = expanded;
      }
      
      setTextSections(processedSegments);
      console.log('🎯 Auto-generated text segments:', processedSegments.length, processedSegments);
    };

    processTextIntoSegments();
  }, [companySettings?.intro_custom_text]);

  // Calculate section timings when audio duration is available (only if no custom config)
  useEffect(() => {
    const scrollConfig = companySettings?.intro_scroll_timing_config as ScrollTimingConfig | null;
    
    // Skip auto timing calculation if we have custom configuration
    if (scrollConfig && scrollConfig.segments && scrollConfig.segments.length > 0) {
      // Initialize section refs array for custom config
      sectionRefs.current = new Array(textSections.length).fill(null);
      return;
    }
    
    if (audioDuration > 0 && textSections.length > 0) {
      const timings: number[] = [];
      
      // First section gets 20 seconds
      const firstSectionDuration = 20;
      timings.push(0); // First section starts at 0
      
      if (textSections.length > 1) {
        timings.push(firstSectionDuration); // Second section starts at 20 seconds
        
        // Distribute remaining time across other sections
        const remainingTime = Math.max(0, audioDuration - firstSectionDuration);
        const remainingSections = textSections.length - 1;
        const timePerRemainingSection = remainingTime / remainingSections;
        
        for (let i = 2; i < textSections.length; i++) {
          timings.push(firstSectionDuration + (i - 1) * timePerRemainingSection);
        }
      }
      
      setSectionTimings(timings);
      console.log('🎯 Auto-calculated section timings:', timings);
      // Initialize section refs array
      sectionRefs.current = new Array(textSections.length).fill(null);
    }
  }, [audioDuration, textSections, companySettings?.intro_scroll_timing_config]);

  useEffect(() => {
    // Test if audio URL is accessible
    if (companySettings?.intro_audio_url) {
      console.log('🎵 Testing audio URL accessibility:', companySettings.intro_audio_url);
      
      // Test with a proper audio request
      const testAudio = new Audio();
      testAudio.preload = 'metadata';
      
      testAudio.onloadedmetadata = () => {
        console.log('🎵 Audio metadata loaded successfully, duration:', testAudio.duration);
        setAudioAvailable(true);
        setAudioDuration(testAudio.duration);
      };
      
      testAudio.onerror = (e) => {
        console.error('🔊 Audio test failed:', e);
        setAudioError('Audio file not found or corrupted');
        setAudioAvailable(false);
        setAudioCompleted(true); // Allow proceeding without audio
      };
      
      testAudio.src = companySettings.intro_audio_url;
    } else {
      console.log('🔊 No audio URL provided');
      setAudioCompleted(true); // Allow proceeding without audio
    }

    // Preload SCORM player components when intro scene mounts
    const preloadScormPlayer = async () => {
      try {
        setIsPreloading(true);
        // Dynamic import to preload the SCORM player
        await import("@/components/ui/scorm-player");
        console.log("🚀 SCORM player preloaded successfully");
      } catch (error) {
        console.warn("Failed to preload SCORM player:", error);
      } finally {
        setIsPreloading(false);
      }
    };

    preloadScormPlayer();

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [companySettings]);

  // Detect manual scrolling
  const handleScroll = useCallback(() => {
    if (audioPlaying && !isManualScroll) {
      setIsManualScroll(true);
      setLastManualScrollTime(Date.now());
    }
  }, [audioPlaying, isManualScroll]);

  // Add scroll listener to container
  useEffect(() => {
    const container = textContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Resume sync functionality
  const handleResumeSync = () => {
    setIsManualScroll(false);
    if (audioRef.current && sectionTimings.length > 0) {
      const currentTime = audioRef.current.currentTime;
      const targetSection = sectionTimings.findIndex((timing, index) => 
        index === sectionTimings.length - 1 || currentTime < sectionTimings[index + 1]
      );
      setCurrentSection(Math.max(0, targetSection));
    }
  };

  // Segmented scroll to section using scrollIntoView
  const scrollToSection = useCallback((sectionIndex: number) => {
    const sectionRef = sectionRefs.current[sectionIndex];
    if (sectionRef && !isManualScroll) {
      sectionRef.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      setCurrentSection(sectionIndex);
    }
  }, [isManualScroll]);

  // Section-based audio sync animation
  const updateSectionPosition = useCallback(() => {
    if (!audioRef.current || audioDuration === 0 || sectionTimings.length === 0 || isManualScroll) return;
    
    const currentTime = audioRef.current.currentTime;
    const targetSection = sectionTimings.findIndex((timing, index) => 
      index === sectionTimings.length - 1 || currentTime < sectionTimings[index + 1]
    );
    
    if (targetSection !== -1 && targetSection !== currentSection) {
      console.log('🎯 Scrolling to section:', targetSection, 'at time:', currentTime);
      scrollToSection(targetSection);
    }
    
    // Update progress state for UI indicators
    const progress = Math.min(currentTime / audioDuration, 1);
    setScrollProgress(progress * 100);
    setAudioCurrentTime(currentTime);
  }, [audioDuration, sectionTimings, currentSection, scrollToSection, isManualScroll]);

  // Animation loop for section-based scrolling
  useEffect(() => {
    if (audioPlaying && audioRef.current) {
      const animate = () => {
        updateSectionPosition();
        if (audioPlaying) {
          scrollAnimationRef.current = requestAnimationFrame(animate);
        }
      };
      scrollAnimationRef.current = requestAnimationFrame(animate);
    } else if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
        scrollAnimationRef.current = null;
      }
    };
  }, [audioPlaying, updateSectionPosition]);

  const handleStartTraining = () => {
    console.log('🎵 handleStartTraining called');
    console.log('🎵 Audio URL:', companySettings?.intro_audio_url);
    console.log('🎵 Audio available:', audioAvailable);
    console.log('🎵 Audio started:', audioStarted);
    console.log('🎵 User agent:', navigator.userAgent);
    console.log('🎵 Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    if (companySettings?.intro_audio_url && audioAvailable && !audioStarted) {
      // Immediately set audio started to show the audio interface
      setAudioStarted(true);
      
      // Start audio with mobile-specific handling
      if (!audioRef.current) {
        audioRef.current = new Audio();
        
        // Mobile-specific audio setup
        audioRef.current.preload = 'metadata'; // Changed from 'auto' for mobile
        audioRef.current.volume = 1.0;
        
        // Add mobile-specific attributes
        audioRef.current.setAttribute('playsinline', 'true');
        audioRef.current.controls = false;
        
        audioRef.current.onplay = () => {
          console.log('🎵 Audio started playing');
          setAudioPlaying(true);
        };
        audioRef.current.onpause = () => {
          console.log('⏸️ Audio paused');
          setAudioPlaying(false);
        };
        audioRef.current.onended = () => {
          console.log('🎵 Audio ended');
          setAudioPlaying(false);
          setAudioCompleted(true);
          setScrollProgress(100);
          // DO NOT auto advance - wait for user to click continue
        };
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current) {
            console.log('🎵 Audio metadata loaded, duration:', audioRef.current.duration);
            setAudioDuration(audioRef.current.duration);
          }
        };
        audioRef.current.onerror = (e) => {
          console.error('🔊 Audio error:', e);
          console.error('🔊 Audio error details:', {
            code: audioRef.current?.error?.code,
            message: audioRef.current?.error?.message,
            networkState: audioRef.current?.networkState,
            readyState: audioRef.current?.readyState
          });
          setAudioError('Audio playback failed on mobile device');
          setAudioCompleted(true); // Allow proceeding if audio fails
        };
        audioRef.current.onloadstart = () => {
          console.log('🎵 Audio load started');
        };
        audioRef.current.oncanplay = () => {
          console.log('🎵 Audio can play');
        };
        audioRef.current.oncanplaythrough = () => {
          console.log('🎵 Audio can play through');
        };
        audioRef.current.onstalled = () => {
          console.log('🎵 Audio stalled');
        };
        audioRef.current.onsuspend = () => {
          console.log('🎵 Audio suspended');
        };
        audioRef.current.onwaiting = () => {
          console.log('🎵 Audio waiting');
        };
      }
      
      console.log('🎵 Setting audio source:', companySettings.intro_audio_url);
      audioRef.current.src = companySettings.intro_audio_url;
      
      // Mobile-specific loading approach
      audioRef.current.load(); // Force reload the audio source
      
      console.log('🎵 Attempting to play audio');
      
      // Add a small delay for mobile devices
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              console.log('🎵 Audio play succeeded');
              setAudioPlaying(true);
            })
            .catch(error => {
              console.error('🔊 Audio play failed:', error);
              console.error('🔊 Error name:', error.name);
              console.error('🔊 Error message:', error.message);
              
              // Handle specific mobile audio errors
              if (error.name === 'NotAllowedError') {
                setAudioError('Audio blocked by browser policy - please enable audio in your browser settings');
              } else if (error.name === 'NotSupportedError') {
                setAudioError('Audio format not supported on this device');
              } else {
                setAudioError('Audio playback failed: ' + error.message);
              }
              setAudioCompleted(true); // Allow proceeding if audio fails
            });
        }
      }, 100); // Small delay for mobile compatibility
      
    } else if (!companySettings?.intro_audio_url || !audioAvailable) {
      console.log('🔊 No audio available, proceeding directly');
      // No audio or audio not available, proceed directly
      setAudioStarted(true);
      setAudioCompleted(true);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current && audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
  };

  const handleResumeAudio = () => {
    if (audioRef.current && !audioPlaying) {
      audioRef.current.play()
        .then(() => {
          console.log('🎵 Audio resumed successfully');
          setAudioPlaying(true);
        })
        .catch(error => {
          console.error('🔊 Audio resume failed:', error);
          setAudioError('Audio resume failed: ' + error.message);
        });
    }
  };

  const handleNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    onNext();
  };

  // In testing mode, always allow proceeding without waiting for audio
  const canProceed = testingMode || !companySettings?.intro_audio_url || !audioAvailable || audioCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 relative">
      {/* Header with Easelearn logo */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <img
          src={easelearnLogoUrl}
          alt="Easelearn Logo"
          className="h-8 w-auto object-contain"
          onLoad={() => console.log('✅ Easelearn logo loaded successfully')}
          onError={(e) => {
            console.error('❌ Easelearn logo failed to load:', e);
            console.error('❌ Failed URL:', e.currentTarget.src);
          }}
        />
        <div className="text-sm text-muted-foreground">SB 553 Compliance Training</div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {!audioStarted ? (
          // Welcome Screen
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              
              {/* Company Logo and Name */}
              {companySettings.company_logo_url && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border inline-block">
                    <img
                      src={companySettings.company_logo_url}
                      alt={`${companySettings.company_name} logo`}
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-primary">{companySettings.company_name}</h2>
                </div>
              )}

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Workplace Violence Prevention Training
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Complete your required SB 553 compliance training and earn your certification
                </p>
              </div>

              {/* Training Features */}
              <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Compliance</div>
                  <div className="text-xs text-muted-foreground">SB 553 Required</div>
                </div>
                <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Quick</div>
                  <div className="text-xs text-muted-foreground">15 Minutes</div>
                </div>
                <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Interactive</div>
                  <div className="text-xs text-muted-foreground">Engaging Content</div>
                </div>
                <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
                  <Award className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-sm font-medium">Certified</div>
                  <div className="text-xs text-muted-foreground">Official Certificate</div>
                </div>
              </div>

              {/* Start Button */}
              <div className="space-y-6">
                <Button
                  onClick={() => {
                    console.log('🎵 Start Training button clicked');
                    handleStartTraining();
                  }}
                  size="lg"
                  className="px-12 py-6 text-xl font-semibold h-auto rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  disabled={isPreloading}
                >
                  {isPreloading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      <span>Preparing Training...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5" />
                      <span>{isCompleted ? "Continue Training" : "Begin Training"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                    <span className="text-sm font-medium">Welcome</span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">2</div>
                    <span className="text-sm text-muted-foreground">Training</span>
                  </div>
                  <div className="w-8 h-px bg-border"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">3</div>
                    <span className="text-sm text-muted-foreground">Completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Training Content Screen
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Company Header */}
            {companySettings.company_logo_url && (
              <div className="text-center">
                <img
                  src={companySettings.company_logo_url}
                  alt={`${companySettings.company_name} logo`}
                  className="h-12 w-auto mx-auto object-contain mb-2"
                />
                <h2 className="text-lg font-semibold">{companySettings.company_name}</h2>
              </div>
            )}

            {/* Audio Progress */}
            {audioAvailable && audioDuration > 0 && (
              <div className="bg-background/60 backdrop-blur rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Training Progress</span>
                  <span>{Math.round(scrollProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Content Display */}
            <div className="bg-background/60 backdrop-blur rounded-xl border border-border/50 overflow-hidden">
              
              {/* Section Progress */}
              {textSections.length > 0 && (
                <div className="p-4 border-b border-border/50">
                  <div className="flex justify-center gap-2">
                    {textSections.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentSection 
                            ? 'bg-primary scale-125' 
                            : index < currentSection 
                              ? 'bg-primary/60' 
                              : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div 
                ref={textContainerRef}
                className="h-64 overflow-y-auto p-6 relative scroll-smooth"
              >
                {/* Resume Sync Button */}
                {isManualScroll && audioPlaying && (
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      onClick={handleResumeSync}
                      size="sm"
                      variant="outline"
                      className="bg-background/90 backdrop-blur-sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Resume Sync
                    </Button>
                  </div>
                )}
                
                <div className="space-y-4 text-base leading-relaxed">
                  {textSections.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lg">Welcome to your SBW-9237 Workplace Violence Prevention Training</p>
                      <p className="text-muted-foreground mt-2">This training will help you understand workplace safety requirements and prevention strategies.</p>
                    </div>
                  ) : (
                    textSections.map((section, index) => (
                      <div
                        key={index}
                        ref={(el) => (sectionRefs.current[index] = el)}
                        className={`transition-opacity duration-300 ${
                          index === currentSection 
                            ? 'opacity-100' 
                            : index < currentSection 
                              ? 'opacity-70' 
                              : 'opacity-50'
                        }`}
                      >
                        {section.split('\n').map((line, lineIndex) => (
                          line.trim() === '' ? <br key={lineIndex} /> : <p key={lineIndex} className="mb-2">{line}</p>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Audio Status */}
              {audioPlaying && (
                <div className="p-4 border-t border-border/50 bg-muted/30">
                  <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio playing - content will advance automatically</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="text-center space-y-4">
              
              {/* Audio Controls */}
              {audioPlaying && (
                <Button
                  onClick={handlePauseAudio}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Audio
                </Button>
              )}
              
              {audioStarted && !audioPlaying && !audioCompleted && (
                <Button
                  onClick={handleResumeAudio}
                  size="lg"
                  className="px-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume Audio
                </Button>
              )}

              {/* Testing Mode */}
              {testingMode && (
                <div className="space-y-3">
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                    Testing Mode: Audio requirement bypassed
                  </div>
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Skip to Training
                  </Button>
                </div>
              )}

              {/* Continue Button */}
              {canProceed && audioCompleted && (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Training
                </Button>
              )}
              
              {audioStarted && !audioCompleted && !audioPlaying && !testingMode && (
                <p className="text-sm text-muted-foreground">
                  Complete the introduction audio to continue
                </p>
              )}
            </div>

            {/* Progress indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">
                  Step 1 of 3: Introduction
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};