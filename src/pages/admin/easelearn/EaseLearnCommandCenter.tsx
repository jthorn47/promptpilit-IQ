import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertTriangle, Zap, Clock } from "lucide-react";
import { Suspense, lazy } from "react";

// Lazy load components to prevent blocking
const LifecycleFunnelTile = lazy(() => import("./components/LifecycleFunnelTile").then(module => ({
  default: module.LifecycleFunnelTile
})));
const NewLMSClientsTile = lazy(() => import("./components/NewLMSClientsTile").then(module => ({
  default: module.NewLMSClientsTile
})));
const TrainingExceptionsTile = lazy(() => import("./components/TrainingExceptionsTile").then(module => ({
  default: module.TrainingExceptionsTile
})));
const QuickActionsTile = lazy(() => import("./components/QuickActionsTile").then(module => ({
  default: module.QuickActionsTile
})));
const RecentActivityTile = lazy(() => import("./components/RecentActivityTile").then(module => ({
  default: module.RecentActivityTile
})));
const ChatInsightsTile = lazy(() => import("./components/ChatInsightsTile").then(module => ({
  default: module.ChatInsightsTile
})));

// Loading fallback component
const TileLoader = () => (
  <Card>
    <CardContent className="p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-muted rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

export const EaseLearnCommandCenter = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Tactical dashboard for monitoring and managing the complete EaseLearn customer journey
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Row 1: Lifecycle Funnel + New Clients */}
        <div className="lg:col-span-3">
          <Suspense fallback={<TileLoader />}>
            <LifecycleFunnelTile />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<TileLoader />}>
            <NewLMSClientsTile />
          </Suspense>
        </div>

        {/* Row 2: Training Exceptions + Admin Shortcuts */}
        <div className="lg:col-span-3">
          <Suspense fallback={<TileLoader />}>
            <TrainingExceptionsTile />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<TileLoader />}>
            <QuickActionsTile />
          </Suspense>
        </div>

        {/* Row 3: Chat Insights + Recent Activity */}
        <div className="lg:col-span-2">
          <Suspense fallback={<TileLoader />}>
            <ChatInsightsTile />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<TileLoader />}>
            <RecentActivityTile />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default EaseLearnCommandCenter;