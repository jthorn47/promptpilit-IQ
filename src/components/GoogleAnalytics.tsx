import { useEffect } from 'react';

export const GoogleAnalytics = () => {
  useEffect(() => {
    // Google Analytics 4 setup
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=G-TWJXDYQW69`;
    document.head.appendChild(script);

    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TWJXDYQW69', {
        page_title: document.title,
        page_location: window.location.href
      });
    `;
    document.head.appendChild(inlineScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(inlineScript);
    };
  }, []);

  return null;
};

// Track specific events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-TWJXDYQW69', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};