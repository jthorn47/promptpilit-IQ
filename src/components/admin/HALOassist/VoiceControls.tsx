import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  Play,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlsProps {
  conversationId: string | null;
  userType: 'client' | 'employee' | 'internal_ops';
  companyId?: string;
  onSendMessage: (message: string, conversationId: string) => Promise<void>;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  conversationId,
  userType,
  companyId,
  onSendMessage
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        
        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();

      // Set up recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly for better recognition",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Unable to access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64 for transmission
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Mock transcription for demo - in real implementation, this would call
        // the voice transcription edge function
        setTimeout(() => {
          const mockTranscript = "Can you show me the current payroll status and any pending tasks?";
          setTranscript(mockTranscript);
          setIsProcessing(false);
          
          // Auto-send the transcribed message
          if (conversationId) {
            onSendMessage(mockTranscript, conversationId);
          }
        }, 2000);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      toast({
        title: "Processing Failed",
        description: "Unable to process audio",
        variant: "destructive"
      });
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const audioLevelBars = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="w-1 bg-primary rounded-full"
      animate={{
        height: isRecording ? `${Math.max(4, (audioLevel / 255) * 40 + Math.random() * 10)}px` : '4px',
        opacity: isRecording ? 0.7 + (audioLevel / 255) * 0.3 : 0.3
      }}
      transition={{ duration: 0.1 }}
    />
  ));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
      {/* Voice Status */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">Voice Assistant</h3>
        <p className="text-muted-foreground">
          {isRecording 
            ? "Listening... Speak clearly about payroll questions"
            : isProcessing 
            ? "Processing your request..."
            : "Press and hold to speak with HALOassist"
          }
        </p>
      </div>

      {/* Audio Visualization */}
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-end justify-center space-x-1 h-20">
            {audioLevelBars}
          </div>
          
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Badge variant={isRecording ? "default" : "secondary"}>
              {isRecording ? "Recording" : "Ready"}
            </Badge>
            {isProcessing && (
              <Badge variant="outline">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <div className="flex items-center space-x-4">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className="h-16 w-16 rounded-full"
          onMouseDown={!isRecording ? startRecording : undefined}
          onMouseUp={isRecording ? stopRecording : undefined}
          onTouchStart={!isRecording ? startRecording : undefined}
          onTouchEnd={isRecording ? stopRecording : undefined}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full"
          onClick={isSpeaking ? stopSpeaking : () => speakText("Hello! I'm HALOassist, your AI payroll copilot. How can I help you today?")}
        >
          {isSpeaking ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Recent Transcript */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Last transcript:</div>
              <p className="text-foreground italic">"{transcript}"</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Voice Tips */}
      <div className="text-center space-y-2 max-w-md">
        <h4 className="font-medium text-foreground">Voice Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Mention specific payroll terms for better accuracy</li>
          <li>• Ask about payroll runs, tax calculations, or employee data</li>
          <li>• Use "Hey HALOassist" to get my attention</li>
        </ul>
      </div>
    </div>
  );
};