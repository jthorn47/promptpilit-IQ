import DOMPurify from 'dompurify';
import { useEffect, useRef } from 'react';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * Safely renders HTML content with DOMPurify sanitization
 * This prevents XSS attacks while preserving safe HTML
 */
export const SafeHtmlRenderer = ({ 
  html, 
  className = "",
  allowedTags,
  allowedAttributes
}: SafeHtmlRendererProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && html) {
      // Configure DOMPurify options
      const config: any = {
        ALLOWED_TAGS: allowedTags || [
          'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'table', 'tr', 'td', 'th',
          'thead', 'tbody', 'blockquote', 'code', 'pre'
        ],
        ALLOWED_ATTR: allowedAttributes || [
          'href', 'src', 'alt', 'title', 'class', 'id', 'style'
        ],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
        FORCE_BODY: true,
        SANITIZE_DOM: true
      };

      // Sanitize and set HTML
      const cleanHTML = DOMPurify.sanitize(html, config);
      ref.current.innerHTML = String(cleanHTML);
    }
  }, [html, allowedTags, allowedAttributes]);

  return <div ref={ref} className={className} />;
};

/**
 * Hook for sanitizing HTML content
 */
export const useSanitizedHtml = (html: string, options?: any) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    FORBID_TAGS: ['script', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    ...options
  });
};