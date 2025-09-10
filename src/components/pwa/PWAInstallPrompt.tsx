import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { pwaManager } from '../../utils/pwa-utils';
import { Card, CardContent, Button } from '../../design-system';

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
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg border-primary md:left-auto md:right-4 md:max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Install Pain Tracker
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add to your home screen for quick access and offline use
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <Button
                size="sm"
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>{isInstalling ? 'Installing...' : 'Install'}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-4 pt-3 border-t border-muted">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span>Works offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span>Fast app-like experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span>Reminder notifications</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}