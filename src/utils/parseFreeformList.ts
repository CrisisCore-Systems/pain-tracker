export function parseFreeformList(text: string): string[] {
  const normalized = text
    .split(/[,\n]/g)
    .map(item => item.trim())
    .filter(Boolean);

  // De-dupe while preserving order
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of normalized) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}
