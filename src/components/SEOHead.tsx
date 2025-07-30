import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schemaData?: any;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonicalUrl,
  schemaData,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription
}: SEOHeadProps) => {
  useEffect(() => {
    console.log('🔍 SEOHead updating meta tags:', { title, ogTitle, twitterTitle, canonicalUrl });
    
    // Update document title
    if (title) {
      document.title = title;
      console.log('✅ Updated document title:', title);
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph tags
    const finalOgTitle = ogTitle || title;
    const finalOgDescription = ogDescription || description;
    
    if (finalOgTitle) {
      let ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (!ogTitleTag) {
        ogTitleTag = document.createElement('meta');
        ogTitleTag.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleTag);
      }
      ogTitleTag.setAttribute('content', finalOgTitle);
    }

    if (finalOgDescription) {
      let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
      if (!ogDescriptionTag) {
        ogDescriptionTag = document.createElement('meta');
        ogDescriptionTag.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescriptionTag);
      }
      ogDescriptionTag.setAttribute('content', finalOgDescription);
    }

    if (ogImage) {
      let ogImageTag = document.querySelector('meta[property="og:image"]');
      if (!ogImageTag) {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageTag);
      }
      ogImageTag.setAttribute('content', ogImage);
    }

    // Update og:url
    if (canonicalUrl) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalUrl);
    }

    // Update Twitter Card tags
    const finalTwitterTitle = twitterTitle || title;
    const finalTwitterDescription = twitterDescription || description;
    
    if (finalTwitterTitle) {
      let twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitleTag) {
        twitterTitleTag = document.createElement('meta');
        twitterTitleTag.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitleTag);
      }
      twitterTitleTag.setAttribute('content', finalTwitterTitle);
    }

    if (finalTwitterDescription) {
      let twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescriptionTag) {
        twitterDescriptionTag = document.createElement('meta');
        twitterDescriptionTag.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescriptionTag);
      }
      twitterDescriptionTag.setAttribute('content', finalTwitterDescription);
    }

    if (ogImage) {
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute('content', ogImage);
    }

    // Update twitter:url
    if (canonicalUrl) {
      let twitterUrl = document.querySelector('meta[name="twitter:url"]');
      if (!twitterUrl) {
        twitterUrl = document.createElement('meta');
        twitterUrl.setAttribute('name', 'twitter:url');
        document.head.appendChild(twitterUrl);
      }
      twitterUrl.setAttribute('content', canonicalUrl);
    }

    // Update canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }

    // Add structured data
    if (schemaData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaData);
    }
  }, [title, description, keywords, ogImage, canonicalUrl, schemaData, ogTitle, ogDescription, twitterTitle, twitterDescription]);

  return null;
};