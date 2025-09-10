import { brand } from '../../design-system/brand';

interface BrandedLogoProps {
  variant?: 'primary' | 'wordmark' | 'icon' | 'iconWhite';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { width: 120, height: 28 },
  md: { width: 200, height: 48 },
  lg: { width: 280, height: 64 },
  xl: { width: 400, height: 96 }
};

const iconSizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 }
};

export function BrandedLogo({ 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}: BrandedLogoProps) {
  const isIcon = variant === 'icon' || variant === 'iconWhite';
  const dimensions = isIcon ? iconSizeMap[size] : sizeMap[size];
  
  const logoSrc = (() => {
    switch (variant) {
      case 'wordmark': return brand.logos.wordmark;
      case 'icon': return brand.logos.icon;
      case 'iconWhite': return brand.logos.iconWhite;
      default: return brand.logos.primary;
    }
  })();

  return (
    <img 
      src={logoSrc}
      alt="Pain Tracker Pro"
      width={dimensions.width}
      height={dimensions.height}
      className={`${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        objectFit: 'contain'
      }}
    />
  );
}

// Inline SVG Logo Component for better performance and customization
export function InlineBrandedLogo({ 
  size = 'md', 
  className = '',
  primaryColor = brand.colors.primary[500],
  secondaryColor = brand.colors.secondary[500]
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const dimensions = sizeMap[size];
  
  return (
    <svg 
      width={dimensions.width} 
      height={dimensions.height} 
      viewBox="0 0 200 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="24" cy="24" r="20" fill={primaryColor} stroke="#ffffff" strokeWidth="2"/>
      
      {/* Medical Cross */}
      <rect x="20" y="12" width="8" height="24" rx="2" fill="white"/>
      <rect x="12" y="20" width="24" height="8" rx="2" fill="white"/>
      
      {/* Analytics Pulse Line */}
      <path 
        d="M6 30 Q12 24 18 30 T30 26 Q36 22 42 26" 
        stroke={secondaryColor} 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Brand Text */}
      <text 
        x="52" 
        y="20" 
        fontFamily={brand.typography.fonts.sans.join(', ')} 
        fontSize="18" 
        fontWeight="700" 
        fill="#0f172a"
      >
        Pain Tracker
      </text>
      <text 
        x="52" 
        y="34" 
        fontFamily={brand.typography.fonts.sans.join(', ')} 
        fontSize="11" 
        fontWeight="500" 
        fill="#64748b"
      >
        AI-POWERED PAIN MANAGEMENT
      </text>
      
      {/* Pro Badge */}
      <rect x="174" y="8" width="24" height="12" rx="6" fill="#a855f7"/>
      <text 
        x="186" 
        y="17" 
        fontFamily={brand.typography.fonts.sans.join(', ')} 
        fontSize="8" 
        fontWeight="600" 
        fill="white" 
        textAnchor="middle"
      >
        PRO
      </text>
    </svg>
  );
}

// Simple Icon Component
export function PainTrackerIcon({ 
  size = 24, 
  className = '',
  color = brand.colors.primary[500]
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="24" cy="24" r="22" fill={color}/>
      
      {/* Medical Cross */}
      <rect x="19" y="10" width="10" height="28" rx="3" fill="white"/>
      <rect x="10" y="19" width="28" height="10" rx="3" fill="white"/>
      
      {/* Analytics Wave */}
      <path 
        d="M8 32 Q12 26 16 32 T24 28 Q28 24 32 28 T40 30" 
        stroke={brand.colors.secondary[500]} 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* AI Indicator */}
      <circle cx="36" cy="12" r="3" fill={brand.colors.accent[500]}/>
    </svg>
  );
}