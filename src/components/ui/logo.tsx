import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { logger } from '@/lib/logger';
import easeworksLogo from '@/assets/easeworks-logo.png';

const easelearnLogoImage = "/lovable-uploads/438db28b-3492-43f0-8609-ce63c778e329.png";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className = '', size = 'md' }: LogoProps) => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { canManageSystem } = usePermissionContext();
  
  // Check if we're on EaseWorks domain
  const currentDomain = window.location.hostname;
  const isEaseWorksDomain = currentDomain === 'score.easeworks.com' || 
                           currentDomain === 'easeworks.com' ||
                           currentDomain === 'www.easeworks.com' ||
                           currentDomain.includes('easeworks');
  
  // Choose logo and alt text based on domain
  const logoSrc = isEaseWorksDomain ? easeworksLogo : easelearnLogoImage;
  const altText = isEaseWorksDomain ? "EaseWorks" : "ease.learn";
  
  console.log('🏢 Global Logo Component:', {
    currentDomain,
    isEaseWorksDomain,
    logoSrc,
    altText
  });
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16'
  };

  const handleLogoClick = () => {
    logger.ui.debug('Logo clicked', { isSuperAdmin, canManageSystem });
    if (canManageSystem) {
      logger.ui.debug('Navigating to /launchpad/system');
      navigate('/launchpad/system');
    } else {
      logger.ui.debug('Navigating to /');
      navigate('/');
    }
  };

  return (
    <img 
      src={`${logoSrc}?v=${Date.now()}`}
      alt={altText}
      className={`w-auto ${sizeClasses[size]} ${className} cursor-pointer hover:opacity-80 transition-opacity`}
      style={{ minWidth: '120px', minHeight: '32px' }}
      onClick={handleLogoClick}
      onLoad={() => {
        console.log('✅ Global Logo loaded successfully:', { domain: currentDomain, isEaseWorks: isEaseWorksDomain, logoSrc });
      }}
      onError={(e) => {
        console.error('❌ Logo failed to load:', { logoSrc, domain: currentDomain, error: e });
        // Fallback to a simple text logo if image fails
        if (e.currentTarget) {
          e.currentTarget.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.textContent = altText;
          fallback.className = 'font-bold text-primary cursor-pointer hover:opacity-80 text-lg';
          fallback.onclick = handleLogoClick;
          e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
        }
      }}
    />
  );
};