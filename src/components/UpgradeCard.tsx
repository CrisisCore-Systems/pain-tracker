import React, { useId, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import type { ModuleId } from '../config/modules';
import { MODULES } from '../config/modules';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../design-system';

interface UpgradeCardProps {
  moduleId: ModuleId;
  className?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ moduleId, className = '' }) => {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const module = MODULES[moduleId];
  let accountLine = 'An account or external identity may be required for some setups.';
  if (module.accountRequirement === 'none') {
    accountLine = 'No account required for unlock.';
  } else if (module.accountRequirement === 'required') {
    accountLine = 'An account or external identity may be required for unlock.';
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <span>{module.label}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{module.description}</p>
        <p className="text-sm text-muted-foreground">
          This is optional. Your data stays on your device.
        </p>
        <p className="text-sm text-muted-foreground">{accountLine}</p>

        {moduleId === 'sync_encrypted' && (
          <p className="text-sm text-muted-foreground">
            Sync is different: it can involve ongoing service costs and may use an external identity.
            Core tracking remains fully usable without sync.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => (globalThis.location.href = '/pricing')}>
            View pricing
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImportMessage(null);
              fileInputRef.current?.click();
            }}
          >
            Import license
          </Button>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="application/json,text/plain"
            className="sr-only"
            onChange={() => {
              // Stub for now: license import will verify signature and write local entitlements.
              setImportMessage('License import is not available yet.');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          />
        </div>

        {importMessage && (
          <output className="text-sm text-muted-foreground" aria-live="polite">
            {importMessage}
          </output>
        )}
      </CardContent>
    </Card>
  );
};
