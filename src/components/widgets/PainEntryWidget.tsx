import type { PainEntry } from "../../types";
import { ModernPainEntryForm } from "../pain-tracker/ModernPainEntryForm";
import { MobilePainEntryForm } from "../mobile/MobilePainEntryForm";
import { useResponsive } from "../../hooks/useMediaQuery";

interface PainEntryWidgetProps {
  onSubmit: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
  onCancel?: () => void;
}

export function PainEntryWidget({ onSubmit, onCancel }: PainEntryWidgetProps) {
  const { isMobile } = useResponsive();

  // On mobile devices, use the mobile-optimized form
  if (isMobile) {
    return <MobilePainEntryForm onSubmit={onSubmit} />;
  }

  // On desktop, use the new modern form
  return <ModernPainEntryForm onSubmit={onSubmit} onCancel={onCancel} />;
}