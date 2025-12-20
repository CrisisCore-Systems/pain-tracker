export function entriesToCsv(entries: unknown[]) {
  if (!entries || entries.length === 0) return '';
  const first = entries[0] as Record<string, unknown>;
  const keys = Object.keys(first);
  const header = keys.join(',');
  const rows = entries.map(e =>
    keys
      .map(k => {
        const v = (e as Record<string, unknown>)[k];
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return '"' + JSON.stringify(v).replace(/"/g, '""') + '"';
        return '"' + String(v).replace(/"/g, '""') + '"';
      })
      .join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
