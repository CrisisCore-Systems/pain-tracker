export function buildExportDownloadedMessage(label: string): string {
  return `Your ${label} has been downloaded.`;
}

export function buildExportFailedMessage(label: string): string {
  return `Unable to generate the ${label}. Please try again.`;
}

export function buildExportNoDataMessage(scope: 'report' | 'entries'): string {
  if (scope === 'entries') {
    return 'There are no entries to include in this report.';
  }

  return 'There are no entries to export for the selected date range.';
}

export function buildClinicalExportNoEntriesMessage(): string {
  return 'There are no pain entries to include in this export yet.';
}

export function formatUpgradeTier(tier?: string): string {
  if (!tier) return 'a higher tier';
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} or higher`;
}

export function buildExportLimitMessage(upgradeRequired?: string): string {
  return `You have reached this plan's export limit. Upgrade to ${formatUpgradeTier(upgradeRequired)} for more export room.`;
}

export function buildExportWorkspaceMessage(label: string): string {
  return `${label} stays in Reports & Export. Open the Reports page to generate it.`;
}