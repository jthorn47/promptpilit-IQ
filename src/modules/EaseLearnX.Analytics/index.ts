export const EaseLearnXAnalyticsModule = {
  id: 'EaseLearnX.Analytics',
  name: 'EaseLearnX Analytics',
  description: 'Intelligent learning behavior analytics and insights',
  version: '1.0.0',
  category: 'easelearn',
  icon: 'BarChart3',
  color: '#8B5CF6',
  isActive: true,
  permissions: ['analytics:read', 'analytics:write'],
  routes: () => import('./routes'),
  components: {
    config: () => import('./components/AnalyticsConfig')
  },
  metadata: {
    requiredFeatures: ['behavior_tracking', 'analytics_dashboard'],
    dependencies: ['EaseLearn.Core'],
    experimental: true
  }
};