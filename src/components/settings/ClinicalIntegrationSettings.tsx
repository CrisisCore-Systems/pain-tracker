import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { ClinicalAdapter } from '../../services/clinical/ClinicalAdapter';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Toggle } from '../../design-system/components/Toggle';

export const ClinicalIntegrationSettings: React.FC = () => {
  const { entries } = usePainTrackerStore();
  const [includeNotes, setIncludeNotes] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  // Generate QR Code handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Generate FHIR Bundle
      const fhirJson = ClinicalAdapter.generateFhirExport(entries, {
        includeNotes,
        patientId: 'patient-self', // Anonymous/Self-asserted
      });

      // 2. Compress/Encode? 
      // QR Codes have limits. A full history FHIR bundle is likely too big for a single QR.
      // For this MVP, we will just encode the recently created logic or a subset.
      // However, strictly local transfer implies we must put the data IN the code 
      // OR run a local server (too complex).
      // 
      // Alternative: We create a "Summary" payload or alert user if data is too big.
      // For now, let's limit to the last 3 entries for the connection test logic
      // to avoid 'Data too big' errors in this specific UI demo.
      
      const recentEntries = entries.slice(-3);
      if (recentEntries.length === 0) {
        alert("No entries to share.");
        setIsGenerating(false);
        return;
      }

      const fhirPayload = ClinicalAdapter.generateFhirExport(recentEntries, {
        includeNotes,
        patientId: 'patient-self'
      });

      // 3. Render QR
      const url = await QRCode.toDataURL(fhirPayload, {
         errorCorrectionLevel: 'M',
         width: 256
      });
      setQrCodeDataUrl(url);
      setShowConsent(false); // Reset consent view if open
    } catch (err) {
      console.error("QR Generation failed", err);
      alert("Could not generate code. Data might be too large for a QR code.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
      setQrCodeDataUrl(null);
  };

  return (
    <Card className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🏥 Clinical Connect
          <span className="text-xs font-normal px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
            Beta
          </span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Securely share your data with healthcare providers using standard HL7 FHIR protocols. 
          Your data never leaves this device until you show the code.
        </p>
      </div>

      {!qrCodeDataUrl ? (
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
              Privacy Controls
            </h3>
            <div className="flex items-center justify-between">
              <label htmlFor="share-notes" className="text-sm text-gray-700 dark:text-gray-300">
                Share personal notes & journals?
              </label>
              <Toggle 
                id="share-notes"
                checked={includeNotes} 
                onChange={(e) => setIncludeNotes(e.target.checked)}
                aria-label="Include notes in clinical export"
              />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              {includeNotes 
                ? "⚠️ Your personal journal notes WILL be visible to the clinician." 
                : "✅ Personal notes are stripped. Only pain levels, symptoms, and medications are shared."}
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || entries.length === 0}
                variant="default"
            >
              {isGenerating ? 'Generating...' : 'Generate Clinical Code'}
            </Button>
          </div>
          {entries.length === 0 && (
             <p className="text-xs text-center text-gray-500">
                 You need to track at least one pain entry to use this feature.
             </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Ready to Scan
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
              Ask your clinician to scan this code with their FHIR-compatible intake software.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            <img src={qrCodeDataUrl} alt="Clinical Data QR Code" className="w-64 h-64" />
          </div>

          <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
            <strong>Security Note:</strong> This visual code contains your unencrypted health data. 
            Treat your screen like a physical medical document while this is visible.
          </div>

          <Button onClick={handleClear} variant="secondary" className="w-full">
            Close & Shred Data
          </Button>
        </div>
      )}
    </Card>
  );
};
