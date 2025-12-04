import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Wifi, Zap, Bell } from 'lucide-react';
import { pwaManager } from '../../utils/pwa-utils';
import { Button } from '../../design-system';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      if (!pwaManager.isAppInstalled()) {
        setShowPrompt(true);
      }
    };

    const handleInstalled = () => {
      setShowPrompt(false);
      setIsInstalling(false);
    };

    // Check if install prompt is already available
    if (pwaManager.isInstallPromptAvailable() && !pwaManager.isAppInstalled()) {
      setShowPrompt(true);
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaManager.showInstallPrompt();
      if (!success) {
        setIsInstalling(false);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-50 max-w-sm w-[min(92%,420px)]"
      role="dialog"
      aria-label="Install Pain Tracker"
    >
      {/* Glow effect behind card */}
      <div 
        className="absolute -inset-2 rounded-3xl opacity-60 blur-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%)' 
        }}
      />
      
      {/* Main card */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.15)',
        }}
      >
        {/* Gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                boxShadow: '0 8px 20px rgba(56, 189, 248, 0.2)',
              }}
            >
              <Smartphone className="h-6 w-6 text-sky-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Install Pain Tracker</h3>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Add to your home screen for quick access and offline tracking
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-3 mt-4">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="relative px-5 py-2.5 text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 20px rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
                </Button>

                <button
                  onClick={handleDismiss}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors duration-200"
                  aria-label="Dismiss"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Benefits list */}
          <div 
            className="mt-5 pt-4 grid grid-cols-3 gap-3"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            {[
              { icon: Wifi, label: 'Works offline', color: '#34d399' },
              { icon: Zap, label: 'Lightning fast', color: '#38bdf8' },
              { icon: Bell, label: 'Reminders', color: '#a855f7' },
            ].map((benefit) => (
              <div key={benefit.label} className="flex flex-col items-center text-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5"
                  style={{ background: `${benefit.color}20` }}
                >
                  <benefit.icon className="h-4 w-4" style={{ color: benefit.color }} />
                </div>
                <span className="text-[11px] text-slate-400">{benefit.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
