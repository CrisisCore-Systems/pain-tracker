import React from 'react';
import { REPORT_TEMPLATES } from '../features/export/templates';

function downloadTemplate(templateId: string) {
  const content = `Template: ${templateId}\nGenerated: ${new Date().toISOString()}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${templateId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportTemplates() {
  return (
    <div className="p-4 bg-card rounded-md border">
      <h3 className="text-lg font-semibold mb-2">Report Templates</h3>
      <div className="space-y-2">
        {Object.values(REPORT_TEMPLATES).map(t => (
          <div key={t.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-muted-foreground">{t.description}</div>
            </div>
            <div>
              <button onClick={() => downloadTemplate(t.id)} className="btn btn-sm">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
