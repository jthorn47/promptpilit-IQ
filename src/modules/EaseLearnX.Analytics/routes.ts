import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import React from 'react';

const BehaviorAnalytics = lazy(() => import('./pages/BehaviorAnalytics'));
const LearnerInsights = lazy(() => import('./pages/LearnerInsights'));
const ContentEffectiveness = lazy(() => import('./pages/ContentEffectiveness'));

export const routes: RouteObject[] = [
  {
    path: 'behavior-analytics',
    element: React.createElement(BehaviorAnalytics),
  },
  {
    path: 'learner-insights',
    element: React.createElement(LearnerInsights),
  },
  {
    path: 'content-effectiveness',
    element: React.createElement(ContentEffectiveness),
  },
];

export default routes;