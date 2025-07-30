import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Plus, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ScrollSegment {
  id: string;
  text: string;
  startTime: number;
  label: string;
}

interface ScrollTimingConfig {
  segments: ScrollSegment[];
  audioDuration: number;
  lastUpdated: string;
}

interface ScrollTimingEditorProps {
  initialText: string;
  audioUrl: string | null;
  config: ScrollTimingConfig | null;
  onConfigChange: (config: ScrollTimingConfig) => void;
}

export const ScrollTimingEditor: React.FC<ScrollTimingEditorProps> = ({
  initialText,
  audioUrl,
  config,
  onConfigChange
}) => {
  const [fullText, setFullText] = useState(initialText);
  const [segments, setSegments] = useState<ScrollSegment[]>([]);
  const [audioDuration, setAudioDuration] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize segments from config or create default segments
  useEffect(() => {
    if (config && config.segments.length > 0) {
      setSegments(config.segments);
      setAudioDuration(config.audioDuration || 60);
      setFullText(config.segments.map(s => s.text).join('\n\n'));
    } else {
      // Auto-segment the text
      createDefaultSegments();
    }
  }, [config, initialText]);

  // Load audio duration when audio URL changes
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
      };
      
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.load();
      
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audioUrl]);

  // Track audio playback time
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const updateTime = () => setCurrentTime(audio.currentTime);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
      };
    }
  }, []);

  const createDefaultSegments = () => {
    const paragraphs = fullText.split('\n\n').filter(p => p.trim());
    const segmentDuration = audioDuration / paragraphs.length;
    
    const defaultSegments: ScrollSegment[] = paragraphs.map((paragraph, index) => ({
      id: `segment-${index + 1}`,
      text: paragraph.trim(),
      startTime: parseFloat((index * segmentDuration).toFixed(1)),
      label: `Segment ${index + 1}`
    }));
    
    setSegments(defaultSegments);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedSegments = Array.from(segments);
    const [removed] = reorderedSegments.splice(result.source.index, 1);
    reorderedSegments.splice(result.destination.index, 0, removed);
    
    setSegments(reorderedSegments);
  };

  const updateSegment = (id: string, field: keyof ScrollSegment, value: string | number) => {
    setSegments(prev => prev.map(segment => 
      segment.id === id ? { ...segment, [field]: value } : segment
    ));
  };

  const addSegment = () => {
    const newSegment: ScrollSegment = {
      id: `segment-${Date.now()}`,
      text: '',
      startTime: segments.length > 0 ? segments[segments.length - 1].startTime + 5 : 0,
      label: `Segment ${segments.length + 1}`
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(segment => segment.id !== id));
  };

  const handleSave = () => {
    const newConfig: ScrollTimingConfig = {
      segments,
      audioDuration,
      lastUpdated: new Date().toISOString()
    };
    onConfigChange(newConfig);
  };

  const handlePreview = () => {
    if (!audioUrl) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
      setIsPreviewMode(true);
    }
  };

  const getCurrentSegment = () => {
    return segments.find((segment, index) => {
      const nextSegment = segments[index + 1];
      return currentTime >= segment.startTime && 
             (!nextSegment || currentTime < nextSegment.startTime);
    });
  };

  const validateTiming = () => {
    const errors: string[] = [];
    
    // Check for sequential timing
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].startTime <= segments[i - 1].startTime) {
        errors.push(`Segment ${i + 1} start time must be after Segment ${i}`);
      }
    }
    
    // Check duration bounds
    segments.forEach((segment, index) => {
      if (segment.startTime < 0) {
        errors.push(`Segment ${index + 1} start time cannot be negative`);
      }
      if (segment.startTime >= audioDuration) {
        errors.push(`Segment ${index + 1} start time exceeds audio duration`);
      }
    });
    
    return errors;
  };

  const validationErrors = validateTiming();
  const currentSegment = getCurrentSegment();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intro Scroll Timing Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Text Editor */}
          <div>
            <Label htmlFor="fullText">Full Introduction Script</Label>
            <Textarea
              id="fullText"
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              placeholder="Paste your complete introduction script here..."
              className="h-32"
            />
            <Button
              onClick={createDefaultSegments}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Auto-Segment Text
            </Button>
          </div>

          <Separator />

          {/* Audio Duration Display */}
          <div className="flex items-center gap-4">
            <Label>Audio Duration:</Label>
            <span className="font-mono text-sm">{audioDuration.toFixed(1)}s</span>
            {audioUrl && (
              <Button
                onClick={handlePreview}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Preview'} Scroll Sync
              </Button>
            )}
          </div>

          {/* Timeline Visualization */}
          {segments.length > 0 && (
            <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex">
                {segments.map((segment, index) => {
                  const width = index < segments.length - 1 
                    ? ((segments[index + 1].startTime - segment.startTime) / audioDuration) * 100
                    : ((audioDuration - segment.startTime) / audioDuration) * 100;
                  const left = (segment.startTime / audioDuration) * 100;
                  
                  return (
                    <div
                      key={segment.id}
                      className={`absolute h-full border-l-2 ${
                        currentSegment?.id === segment.id ? 'bg-primary/30 border-primary' : 'bg-muted-foreground/20 border-muted-foreground'
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <div className="text-xs p-1 truncate">
                        {segment.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Current time indicator */}
              {isPreviewMode && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{ left: `${(currentTime / audioDuration) * 100}%` }}
                />
              )}
            </div>
          )}

          {/* Segments Editor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Scroll Segments</Label>
              <Button onClick={addSegment} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Segment
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="segments">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {segments.map((segment, index) => (
                      <Draggable key={segment.id} draggableId={segment.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`${
                              currentSegment?.id === segment.id ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps} className="mt-2">
                                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Input
                                      value={segment.label}
                                      onChange={(e) => updateSegment(segment.id, 'label', e.target.value)}
                                      placeholder="Segment label"
                                      className="w-32"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Label htmlFor={`start-${segment.id}`} className="text-sm">
                                        Start:
                                      </Label>
                                      <Input
                                        id={`start-${segment.id}`}
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max={audioDuration}
                                        value={segment.startTime}
                                        onChange={(e) => updateSegment(segment.id, 'startTime', parseFloat(e.target.value) || 0)}
                                        className="w-20"
                                      />
                                      <span className="text-xs text-muted-foreground">s</span>
                                    </div>
                                    <Button
                                      onClick={() => removeSegment(segment.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  <Textarea
                                    value={segment.text}
                                    onChange={(e) => updateSegment(segment.id, 'text', e.target.value)}
                                    placeholder="Segment text content..."
                                    className="h-20"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-semibold text-destructive mb-2">Timing Validation Errors:</h4>
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={validationErrors.length > 0 || segments.length === 0}
            >
              Save Timing Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
        />
      )}
    </div>
  );
};