import React from 'react';
import { Button } from '../../design-system';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="z-10 w-full max-w-xl bg-background rounded-xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-2">Need help now?</h2>
        <p className="text-sm text-muted-foreground mb-4">If you are in immediate danger or need urgent medical help, call your local emergency services. If you need to speak to someone right away, here are crisis hotline numbers you can call.</p>

        <ul className="list-disc pl-5 mb-4 text-sm">
          <li>Emergency services: 911</li>
          <li>Canada (24/7): 1-833-456-4566</li>
          <li>US (24/7): 988</li>
        </ul>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={() => { window.open('https://www.who.int', '_blank'); }}>Find local resources</Button>
        </div>
      </div>
    </div>
  );
}

export default CrisisModal;
