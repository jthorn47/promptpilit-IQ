import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { APP_CONFIG } from "@/config/app";

/**
 * Centralized analytics configuration
 */
export const AppAnalytics = () => {
  if (!APP_CONFIG.features.analytics) {
    return null;
  }

  return <GoogleAnalytics />;
};