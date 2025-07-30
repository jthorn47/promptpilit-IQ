import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SBW9237PlanViewerSceneProps {
  companySettings: any;
  wpvPlan: any;
  onComplete: () => void;
  testingMode?: boolean; // New prop to bypass timing restrictions
}

export const SBW9237PlanViewerScene = ({ 
  companySettings, 
  wpvPlan, 
  onComplete,
  testingMode = false
}: SBW9237PlanViewerSceneProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [planContent, setPlanContent] = useState<string | null>(null);
  const [isIframeContent, setIsIframeContent] = useState(false);
  const [iframeViewTime, setIframeViewTime] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer for iframe content progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isIframeContent && audioStarted && !hasScrolledToBottom) {
      // For iframe content, simulate progress over 30 seconds
      timer = setInterval(() => {
        setIframeViewTime(prev => {
          const newTime = prev + 1;
          const progressPercent = Math.min((newTime / 30) * 100, 100);
          setScrollProgress(progressPercent);
          
          if (progressPercent >= 95) {
            setHasScrolledToBottom(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isIframeContent, audioStarted, hasScrolledToBottom]);

  useEffect(() => {
    console.log('🎯 PlanViewerScene useEffect - wpvPlan:', wpvPlan);
    console.log('🎯 PlanViewerScene useEffect - companySettings:', companySettings);
    
    // Check if WPV plan audio URL exists - check both wpvPlan and companySettings
    const audioUrl = wpvPlan?.wpv_plan_audio_url || companySettings?.wpv_plan_audio_url;
    if (audioUrl) {
      console.log('🎵 WPV plan audio URL found:', audioUrl);
      setAudioAvailable(true);
      setAudioError(null);
    } else {
      console.log('🔊 No WPV plan audio URL provided');
      setAudioCompleted(true); // Allow proceeding without audio
      setAudioAvailable(false);
    }
    
    if (wpvPlan) {
      // Check if this is from client_sbw9237_modules (has wpv_plan_* fields)
      if (wpvPlan.wpv_plan_file_url || wpvPlan.wpv_plan_content || wpvPlan.wpv_plan_type) {
        const content = wpvPlan.wpv_plan_content || null;
        const fileUrl = wpvPlan.wpv_plan_file_url || null;
        const planType = wpvPlan.wpv_plan_type || 'html';
        
        console.log('🎯 Using wpvPlan data:', { content, fileUrl, planType });
        
        // If it's a website type and we have a URL, use that
        if (planType === 'website' && fileUrl) {
          console.log('🎯 Setting plan content to website URL:', fileUrl);
          setPlanContent(fileUrl);
          setIsIframeContent(true);
        } else if (content) {
          console.log('🎯 Setting plan content to HTML content');
          setPlanContent(content);
          setIsIframeContent(false);
        } else {
          console.log('🎯 No content found in wpvPlan data');
          setPlanContent(null);
          setIsIframeContent(false);
        }
      } else {
        // This is from wpv_plans table, use the old logic
        console.log('🎯 Using wpv_plans table data, fetching content');
        fetchPlanContent();
      }
    } else {
      console.log('🎯 No wpvPlan data, using company settings fallback');
      // Use fallback content from company settings - check for both URL and content
      const content = companySettings.wpv_plan_content || null;
      const fileUrl = companySettings.wpv_plan_file_url || null;
      const planType = companySettings.wpv_plan_type || 'html';
      
      console.log('🎯 Company settings fallback:', { content, fileUrl, planType });
      
      // If it's a website type and we have a URL, use that
      if (planType === 'website' && fileUrl) {
        setPlanContent(fileUrl);
        setIsIframeContent(true);
      } else {
        setPlanContent(content);
        setIsIframeContent(false);
      }
    }

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [wpvPlan, companySettings]);

  const handleStartAudio = () => {
    console.log('🎵 handleStartAudio called');
    const audioUrl = wpvPlan?.wpv_plan_audio_url || companySettings?.wpv_plan_audio_url;
    console.log('🎵 WPV Plan Audio URL:', audioUrl);
    console.log('🎵 Audio available:', audioAvailable);
    console.log('🎵 Audio started:', audioStarted);
    console.log('🎵 User agent:', navigator.userAgent);
    console.log('🎵 Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    if (audioUrl && audioAvailable && !audioStarted) {
      // Immediately set audio started to show the audio interface
      setAudioStarted(true);
      
      // Start audio with mobile-specific handling
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = 'anonymous'; // Add CORS support
        audioRef.current.preload = 'metadata';
        
        // Set loading timeout to prevent infinite spinning
        let loadingTimeout: NodeJS.Timeout;
        
        audioRef.current.onloadstart = () => {
          console.log('🎵 WPV Plan Audio load started');
          loadingTimeout = setTimeout(() => {
            console.log('🔊 Audio loading timeout - stopping spinner');
            setAudioError('Audio loading timed out');
            setAudioCompleted(true);
          }, 10000); // 10 second timeout
        };
        
        audioRef.current.onplay = () => {
          console.log('🎵 WPV Plan Audio started playing');
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setAudioPlaying(true);
          setAudioError(null);
        };
        
        audioRef.current.onpause = () => {
          console.log('⏸️ WPV Plan Audio paused');
          setAudioPlaying(false);
        };
        
        audioRef.current.onended = () => {
          console.log('🎵 WPV Plan Audio ended');
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setAudioPlaying(false);
          setAudioCompleted(true);
        };
        
        audioRef.current.onerror = (e) => {
          console.error('🔊 WPV Plan Audio error:', e);
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setAudioError('Audio format not supported by this browser');
          setAudioCompleted(true);
          setAudioPlaying(false);
        };
        
        audioRef.current.oncanplay = () => {
          console.log('🎵 WPV Plan Audio can play');
          if (loadingTimeout) clearTimeout(loadingTimeout);
        };
        
        audioRef.current.onloadeddata = () => {
          console.log('🎵 WPV Plan Audio loaded data');
          if (loadingTimeout) clearTimeout(loadingTimeout);
        };
        
        audioRef.current.onstalled = () => {
          console.log('🎵 WPV Plan Audio stalled');
          setAudioError('Audio connection stalled - you can continue without audio');
          setAudioCompleted(true);
        };
        
        audioRef.current.onsuspend = () => {
          console.log('🎵 WPV Plan Audio suspended');
        };
        
        audioRef.current.onwaiting = () => {
          console.log('🎵 WPV Plan Audio waiting for data');
        };
        
        audioRef.current.onabort = () => {
          console.log('🎵 WPV Plan Audio aborted');
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setAudioError('Audio loading was aborted');
          setAudioCompleted(true);
        };
      }
      
      console.log('🎵 Setting WPV Plan audio source:', audioUrl);
      audioRef.current.src = audioUrl;
      
      // Mobile-specific loading approach
      audioRef.current.load(); // Force reload the audio source
      
      console.log('🎵 Attempting to play WPV Plan audio');
      
      // Add a small delay for mobile devices
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              console.log('🎵 WPV Plan Audio play succeeded');
            })
            .catch(error => {
              console.error('🔊 WPV Plan Audio play failed:', error);
              if (error.name === 'NotAllowedError') {
                console.log('🔊 Audio autoplay blocked, user interaction required');
                setAudioError('Click the button below to play audio');
                setAudioCompleted(false); // Don't mark as completed yet
                setAudioStarted(false); // Reset so user can try again
              } else {
                setAudioError('WPV plan audio playback failed: ' + error.message);
                setAudioCompleted(true); // Allow proceeding if audio fails
              }
            });
        }
      }, 100); // Small delay for mobile compatibility
      
    } else if (!audioUrl || !audioAvailable) {
      console.log('🔊 No WPV Plan audio available, proceeding directly');
      // No audio or audio not available, proceed directly
      setAudioStarted(true);
      setAudioCompleted(true);
    }
  };

  const fetchPlanContent = async () => {
    if (!wpvPlan) return;

    try {
      if (wpvPlan.file_type === 'application/pdf') {
        // For PDF files, we'll display in an iframe
        const { data } = await supabase.storage
          .from('wpv-plans')
          .getPublicUrl(wpvPlan.file_path);
        
        setPlanContent(data.publicUrl);
        setIsIframeContent(true);
      } else {
        // For text/HTML content, we'll fetch and display directly
        const { data, error } = await supabase.storage
          .from('wpv-plans')
          .download(wpvPlan.file_path);

        if (error) throw error;

        const text = await data.text();
        setPlanContent(text);
        setIsIframeContent(false);
      }
    } catch (error) {
      console.error("Error fetching WPV plan content:", error);
      // Fallback to company settings content
      setPlanContent(companySettings.wpv_plan_content || null);
    }
  };

  const handleScroll = () => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
    
    setScrollProgress(Math.min(scrollPercent, 100));
    
    // Consider "bottom" reached when user has scrolled to 95% or more
    if (scrollPercent >= 95 && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCertificationChange = (checked: boolean) => {
    setIsCertified(checked);
  };

  const handleComplete = () => {
    if (testingMode || (hasScrolledToBottom && isCertified)) {
      onComplete();
    }
  };

  // In testing mode, bypass scroll requirement
  const canComplete = testingMode || (hasScrolledToBottom && isCertified);

  const renderPlanContent = () => {
    if (!planContent) {
      return (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-900 mb-2">No WPV Plan Available</h3>
                <p className="text-sm text-orange-700 mb-4">
                  No Workplace Violence Prevention plan has been uploaded for {companySettings.company_name} yet.
                </p>
                <div className="space-y-2 text-sm text-orange-700">
                  <p><strong>What this means:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Your company should upload a WPV plan to complete this training</li>
                    <li>The plan should include workplace-specific policies and procedures</li>
                    <li>Contact your administrator to upload the plan</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Handle PDF content or website URLs (displayed in iframe)
    if (wpvPlan?.file_type === 'application/pdf' || 
        wpvPlan?.wpv_plan_type === 'website' ||
        companySettings.wpv_plan_type === 'website' || 
        (planContent && planContent.startsWith('http'))) {
      return (
        <div className="border rounded-lg overflow-hidden relative">
          <style>
            {`
              iframe[src*=".pdf"] {
                border: none !important;
              }
              iframe[src*=".pdf"]::-webkit-scrollbar {
                display: none !important;
              }
            `}
          </style>
          <iframe
            src={`${planContent}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
            className="w-full h-[600px] border-0"
            title={companySettings.wpv_plan_type === 'website' ? "WPV Plan Website" : "WPV Plan PDF"}
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
            style={{ border: 'none', outline: 'none' }}
          />
        </div>
      );
    }

    // Handle HTML/text content
    return (
      <Card>
        <CardContent className="p-6">
          <div 
            className="prose max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: planContent }}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">

        {/* Audio Section - temporarily disabled due to browser compatibility issues */}
        {false && (wpvPlan?.wpv_plan_audio_url || companySettings?.wpv_plan_audio_url) && audioAvailable && !audioError && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audio Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Listen to the audio introduction for this WPV plan.
                </p>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      console.log('🎵 WPV Plan Start Audio button clicked');
                      handleStartAudio();
                    }}
                    disabled={audioStarted && audioPlaying}
                    variant={(audioStarted && !audioError) ? "secondary" : "default"}
                  >
                    {audioPlaying ? "Playing..." : 
                     audioStarted && !audioError ? "Audio Started" : 
                     audioError ? "Try Playing Audio" : "Start Audio"}
                  </Button>
                  {audioStarted && !audioError && (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${audioPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm text-muted-foreground">
                        {audioPlaying ? "Playing" : audioCompleted ? "Completed" : "Paused"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reading Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(scrollProgress)}%
            </span>
          </div>
          <Progress value={scrollProgress} className="h-2" />
        </div>

        {/* Scrollable content area */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="max-h-[600px] overflow-y-auto mb-6 pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {renderPlanContent()}
        </div>

        {/* Completion section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Plan Certification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Testing mode indicator */}
              {testingMode && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Testing Mode: Scroll requirement bypassed</span>
                </div>
              )}
              
              {!testingMode && !hasScrolledToBottom && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Please scroll through the entire plan above</span>
                </div>
              )}
              
              {!testingMode && hasScrolledToBottom && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Plan review completed</span>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="certification"
                  checked={isCertified}
                  onCheckedChange={handleCertificationChange}
                  disabled={!testingMode && !hasScrolledToBottom}
                />
                <label
                  htmlFor="certification"
                  className={`text-sm leading-relaxed ${
                    !testingMode && !hasScrolledToBottom ? 'text-muted-foreground' : 'cursor-pointer'
                  }`}
                >
                  I certify that I have read and understand this Workplace Violence Prevention plan. 
                  I acknowledge my responsibility to follow these policies and procedures to maintain 
                  a safe workplace environment.
                </label>
              </div>

              <Button
                onClick={handleComplete}
                disabled={!canComplete}
                size="lg"
                className="w-full mt-6"
              >
                {canComplete ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Training
                  </>
                ) : (
                  "Complete Reading and Check Certification"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Step 3 of 3: WPV Plan Review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};