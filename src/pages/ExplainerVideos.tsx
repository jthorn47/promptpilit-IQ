import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Star, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';

const ExplainerVideos = () => {
  const [activeVideo, setActiveVideo] = useState('demo1');

  const features = [
    "Convert complex ideas into simple visuals",
    "Increase engagement rates by 80%",
    "Professional voice-over in 40+ languages",
    "Custom branding and animations",
    "Quick turnaround in 5-7 days",
    "Unlimited revisions included"
  ];

  const videoExamples = [
    {
      id: 'demo1',
      title: 'SaaS Product Demo',
      category: 'Product Explainer',
      thumbnail: '/placeholder-video-1.jpg'
    },
    {
      id: 'demo2',
      title: 'Service Introduction',
      category: 'Service Explainer',
      thumbnail: '/placeholder-video-2.jpg'
    },
    {
      id: 'demo3',
      title: 'App Walkthrough',
      category: 'App Demo',
      thumbnail: '/placeholder-video-3.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,76,231,0.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
        
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Star className="w-4 h-4" />
                  Marketing Videos That Convert
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Turn Your Ideas Into
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"> Powerful Explainers</span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create compelling explainer videos that convert prospects into customers. Professional animations, clear messaging, and proven storytelling frameworks.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-6">
                  Start Your Project
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  View Portfolio
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">500+ Companies Trust Us</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">98% Satisfaction Rate</span>
                </div>
              </div>
            </div>

            {/* Right Column - Video Player */}
            <div className="lg:pl-8">
              <div className="relative">
                {/* Main Video Player */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                    <Button 
                      size="lg" 
                      className="rounded-full w-20 h-20 bg-white/90 hover:bg-white text-primary shadow-lg"
                      onClick={() => {/* Play video logic */}}
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>Sample Explainer Video</span>
                        <span>2:30</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg border">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Conversion Increase</div>
                </div>

                <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg border">
                  <div className="text-2xl font-bold text-primary">2M+</div>
                  <div className="text-sm text-muted-foreground">Views Generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Examples Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See Our Work in Action</h2>
          <p className="text-lg text-muted-foreground">Examples of explainer videos that drive results</p>
        </div>

        <Tabs value={activeVideo} onValueChange={setActiveVideo} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-muted/50 backdrop-blur-sm border border-border/50">
            {videoExamples.map((video) => (
              <TabsTrigger 
                key={video.id} 
                value={video.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {video.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {videoExamples.map((video) => (
            <TabsContent key={video.id} value={video.id} className="mt-8">
              <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-br from-background to-background/80">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  <CardDescription>{video.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <Button 
                      size="lg" 
                      className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
                      onClick={() => {/* Play specific video logic */}}
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ExplainerVideos;