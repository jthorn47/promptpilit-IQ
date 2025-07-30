
import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePreloader } from '@/utils/routePreloader';

export const useRoutePreloader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Track navigation and predict next routes
  useEffect(() => {
    const predictions = routePreloader.predictNextRoutes(location.pathname);
    predictions.forEach(route => routePreloader.enqueueRoute(route));
  }, [location.pathname]);

  // Preload route on hover
  const preloadOnHover = useCallback((route: string) => {
    routePreloader.onRouteHover(route);
  }, []);

  // Get preloader stats for debugging
  const getStats = useCallback(() => {
    return routePreloader.getStats();
  }, []);

  return {
    preloadOnHover,
    getStats
  };
};
