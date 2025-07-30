import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  HelpCircle,
  User,
  Home,
  Settings,
  LogOut,
  Building2,
  FileText,
  GraduationCap,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Mail,
  Menu,
  X,
  BarChart3,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import { AIHelpModal } from '@/components/modals/AIHelpModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { ContactModal } from '@/components/modals/ContactModal';
import { useTranslation } from 'react-i18next';
import { useNavigation } from './NavigationProvider';
import { NavigationItem } from '@/config/navigationConfig';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, userRoles, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const { state: sidebarState, isMobile } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get navigation from NavigationProvider (only used for mobile menu)
  const { navigation } = useNavigation();
  
  // TopNav should NOT display module navigation - that belongs in the sidebar only
  // Keep navigationLinks empty to prevent module items from appearing in header
  const navigationLinks: NavigationItem[] = [];

  // Remove dynamic width calculation to prevent layout shifts

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement smart search with suggestions
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    toast({
      title: t('common.language'),
      description: `${t('common.language')} changed to ${lng === 'en' ? t('common.english') : t('common.spanish')}`,
    });
  };

  const getUserDisplayName = () => {
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getCorrectLaunchpadPath = () => {
    if (isSuperAdmin) {
      return '/launchpad/system';
    }
    if (userRoles?.includes('company_admin')) {
      return '/launchpad/company-admin';
    }
    if (userRoles?.includes('admin')) {
      return '/launchpad/admin';
    }
    return '/';
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Logo size="sm" />
            <span className="font-semibold text-lg">Navigation</span>
          </div>
          {navigationLinks.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(item.url);
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="justify-start"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(item.url);
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge className="ml-auto h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav 
      className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
    >
      <div className="flex h-14 items-center justify-between px-4 py-2">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.url);
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="h-9"
                  onClick={() => navigate(item.url)}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  <span className="hidden lg:inline">{item.title}</span>
                  {item.badge && (
                    <Badge className="ml-2 h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>

        {/* Center-Right Section - Search with Sidebar Trigger */}
        <div className="flex items-center space-x-2 flex-1 max-w-lg ml-auto mr-6">
          {/* Sidebar Trigger - Desktop only, next to search */}
          {!isMobile && (
            <SidebarTrigger className="text-primary/70 hover:text-primary" />
          )}
          
          <div className="flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies, reports, help docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('navigation.language')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                {t('common.english')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('es')}>
                {t('common.spanish')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>{t('navigation.help')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Knowledge Base */}
              <DropdownMenuItem asChild>
                <a 
                  href="https://help.easelearn.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
                >
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Knowledge Base</div>
                    <div className="text-sm text-muted-foreground">Browse our help documentation</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </DropdownMenuItem>
              
              {/* AI Help */}
              <DropdownMenuItem 
                onClick={() => setIsAIHelpOpen(true)}
                className="flex items-start space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
              >
                <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">Ask AI</div>
                  <div className="text-sm text-muted-foreground">Get instant help from our AI assistant</div>
                </div>
              </DropdownMenuItem>
              
              {/* Feedback */}
              <DropdownMenuItem 
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-start space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
              >
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">Feedback</div>
                  <div className="text-sm text-muted-foreground">Share your thoughts and suggestions</div>
                </div>
              </DropdownMenuItem>
              
              {/* Contact Us */}
              <DropdownMenuItem 
                onClick={() => setIsContactOpen(true)}
                className="flex items-start space-x-3 p-3 hover:bg-muted/50 cursor-pointer"
              >
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">Contact Us</div>
                  <div className="text-sm text-muted-foreground">Get in touch with our support team</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>{t('navigation.notifications')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New employee onboarded</p>
                  <p className="text-xs text-muted-foreground">John Doe has completed onboarding</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Training reminder</p>
                  <p className="text-xs text-muted-foreground">5 employees have pending training</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">System update</p>
                  <p className="text-xs text-muted-foreground">New features available</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                  <AvatarFallback className="text-white font-medium" style={{ backgroundColor: '#655DC6' }}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {isSuperAdmin && (
                <DropdownMenuItem onClick={() => window.open('/admin/university', '_blank')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  HALO IQ-U
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Help Modals */}
      <AIHelpModal isOpen={isAIHelpOpen} onClose={() => setIsAIHelpOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </nav>
  );
};