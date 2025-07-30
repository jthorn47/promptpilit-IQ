import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { ChevronDown, Home, FileText, Users, DollarSign, HelpCircle, BookOpen } from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const AccessibleNavigation: React.FC<AccessibleNavigationProps> = ({
  items,
  className = '',
  orientation = 'horizontal'
}) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const handleArrowNavigation = (direction: 'next' | 'prev') => {
    setIsKeyboardNavigating(true);
    const increment = direction === 'next' ? 1 : -1;
    const newIndex = (focusedIndex + increment + items.length) % items.length;
    setFocusedIndex(newIndex);
  };

  const handleEnter = () => {
    if (focusedIndex >= 0 && focusedIndex < items.length) {
      const link = navRef.current?.querySelector(`[data-nav-index="${focusedIndex}"]`) as HTMLAnchorElement;
      link?.click();
    }
  };

  useKeyboardNavigation({
    onArrowDown: orientation === 'vertical' ? () => handleArrowNavigation('next') : undefined,
    onArrowUp: orientation === 'vertical' ? () => handleArrowNavigation('prev') : undefined,
    onArrowRight: orientation === 'horizontal' ? () => handleArrowNavigation('next') : undefined,
    onArrowLeft: orientation === 'horizontal' ? () => handleArrowNavigation('prev') : undefined,
    onEnter: handleEnter,
  });

  useEffect(() => {
    if (isKeyboardNavigating && focusedIndex >= 0) {
      const focusedElement = navRef.current?.querySelector(`[data-nav-index="${focusedIndex}"]`) as HTMLElement;
      focusedElement?.focus();
    }
  }, [focusedIndex, isKeyboardNavigating]);

  const handleMouseEnter = () => {
    setIsKeyboardNavigating(false);
    setFocusedIndex(-1);
  };

  return (
    <nav 
      ref={navRef}
      className={`${className}`}
      role="navigation"
      aria-label="Main navigation"
      onMouseEnter={handleMouseEnter}
    >
      <ul 
        className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-1`}
        role="menubar"
        aria-orientation={orientation}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          const isFocused = focusedIndex === index;
          
          return (
            <li key={item.href} role="none">
              <Link
                to={item.href}
                data-nav-index={index}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  focus-visible:bg-accent focus-visible:text-accent-foreground
                  ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}
                  ${isFocused ? 'bg-accent text-accent-foreground' : ''}
                `}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-describedby={item.description ? `nav-desc-${index}` : undefined}
                tabIndex={isKeyboardNavigating ? (isFocused ? 0 : -1) : 0}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.description && (
                  <span id={`nav-desc-${index}`} className="sr-only">
                    {item.description}
                  </span>
                )}
                {isActive && (
                  <span className="sr-only">Current page</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// Predefined navigation configurations
export const MainNavigation: React.FC<{ className?: string }> = ({ className }) => {
  const mainNavItems: NavigationItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Go to homepage'
    },
    {
      href: '/resources',
      label: 'Resources',
      icon: BookOpen,
      description: 'View learning resources and materials'
    },
    {
      href: '/pricing',
      label: 'Pricing',
      icon: DollarSign,
      description: 'View pricing plans and options'
    },
    {
      href: '/blog',
      label: 'Blog',
      icon: FileText,
      description: 'Read our latest blog posts'
    },
    {
      href: '/faq',
      label: 'FAQ',
      icon: HelpCircle,
      description: 'Frequently asked questions'
    }
  ];

  return <AccessibleNavigation items={mainNavItems} className={className} />;
};

// Skip to content link component
export const SkipToContent: React.FC = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView();
        }
      }}
    >
      Skip to main content
    </a>
  );
};