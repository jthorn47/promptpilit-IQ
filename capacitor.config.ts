import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.31db5322f57c4634bd32d8a53fc78a69',
  appName: 'haloiq',
  webDir: 'dist',
  server: {
    url: 'https://31db5322-f57c-4634-bd32-d8a53fc78a69.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;