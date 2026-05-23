import { useMemo, useState } from 'react';

type GscRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type TrendPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

type PropertyMetrics = {
  property: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topPages: GscRow[];
  topQueries: GscRow[];
  trend: TrendPoint[];
};

const API_ENDPOINT = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

async function fetchDimensionRows(accessToken: string, siteUrl: string, dimensions: string[], startDate: string, endDate: string) {
  const encodedSite = encodeURIComponent(siteUrl);
  const response = await fetch(`${API_ENDPOINT}/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit: dimensions.includes('date') ? 90 : 25,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search Console API error for ${siteUrl}: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { rows?: GscRow[] };
  return data.rows ?? [];
}

export function SeoSearchConsoleDashboardPage() {
  const [accessToken, setAccessToken] = useState('');
  const [propertiesInput, setPropertiesInput] = useState('sc-domain:example.com\nhttps://example.com/');
  const [daysBack, setDaysBack] = useState(28);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PropertyMetrics[]>([]);

  const totals = useMemo(() => {
    const clicks = results.reduce((sum, entry) => sum + entry.clicks, 0);
    const impressions = results.reduce((sum, entry) => sum + entry.impressions, 0);
    return {
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
    };
  }, [results]);

  const runDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - daysBack + 1);

      const propertyList = propertiesInput
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const dashboard = await Promise.all(propertyList.map(async (property) => {
        const [pages, queries, dates] = await Promise.all([
          fetchDimensionRows(accessToken, property, ['page'], startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)),
          fetchDimensionRows(accessToken, property, ['query'], startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)),
          fetchDimensionRows(accessToken, property, ['date'], startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)),
        ]);

        const clicks = dates.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
        const impressions = dates.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
        const weightedPositionTotal = dates.reduce((sum, row) => sum + ((row.position ?? 0) * (row.impressions ?? 0)), 0);

        return {
          property,
          clicks,
          impressions,
          ctr: impressions > 0 ? clicks / impressions : 0,
          avgPosition: impressions > 0 ? weightedPositionTotal / impressions : 0,
          topPages: pages,
          topQueries: queries,
          trend: dates.map((row) => ({
            date: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
          })),
        } satisfies PropertyMetrics;
      }));

      setResults(dashboard);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Unknown error');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="text-3xl font-semibold">Live Google Search Console SEO Dashboard</h1>
        <p className="text-sm text-slate-300">Local-only session: your OAuth token stays in this browser tab and is never persisted by the app.</p>

        <section className="grid gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 md:grid-cols-3">
          <label className="md:col-span-3 text-sm font-medium">OAuth Access Token (scope: webmasters.readonly)</label>
          <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="md:col-span-3 rounded border border-slate-600 bg-slate-950 p-2" placeholder="ya29..." />
          <label className="text-sm">Days Back</label>
          <input type="number" min={7} max={90} value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-950 p-2" />
          <button type="button" onClick={runDashboard} disabled={loading || !accessToken} className="rounded bg-emerald-600 p-2 font-medium disabled:opacity-50">
            {loading ? 'Loading…' : 'Load Live SEO'}
          </button>
          <label className="md:col-span-3 text-sm font-medium">Properties (one per line, e.g. sc-domain:example.com)</label>
          <textarea value={propertiesInput} onChange={(e) => setPropertiesInput(e.target.value)} rows={5} className="md:col-span-3 rounded border border-slate-600 bg-slate-950 p-2" />
        </section>

        {error && <p className="rounded border border-rose-700 bg-rose-950 p-3 text-sm text-rose-200">{error}</p>}

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Total Clicks" value={totals.clicks.toLocaleString()} />
          <MetricCard label="Total Impressions" value={totals.impressions.toLocaleString()} />
          <MetricCard label="Blended CTR" value={`${(totals.ctr * 100).toFixed(2)}%`} />
        </section>

        {results.map((property) => (
          <section key={property.property} className="space-y-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
            <h2 className="text-xl font-semibold">{property.property}</h2>
            <p className="text-sm text-slate-300">Clicks {property.clicks.toLocaleString()} · Impressions {property.impressions.toLocaleString()} · CTR {(property.ctr * 100).toFixed(2)}% · Avg Position {property.avgPosition.toFixed(1)}</p>

            <div className="grid gap-4 lg:grid-cols-2">
              <MetricTable title="Top Pages" rows={property.topPages} />
              <MetricTable title="Top Queries" rows={property.topQueries} />
            </div>

            <div>
              <h3 className="mb-2 font-medium">Trend (daily)</h3>
              <div className="max-h-56 overflow-auto rounded border border-slate-700">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800">
                    <tr><th className="p-2">Date</th><th className="p-2">Clicks</th><th className="p-2">Impressions</th></tr>
                  </thead>
                  <tbody>
                    {property.trend.map((point) => (
                      <tr key={point.date} className="border-t border-slate-800">
                        <td className="p-2">{point.date}</td>
                        <td className="p-2">{point.clicks.toLocaleString()}</td>
                        <td className="p-2">{point.impressions.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-slate-700 bg-slate-900 p-4"><p className="text-sm text-slate-300">{label}</p><p className="text-2xl font-semibold">{value}</p></article>;
}

function MetricTable({ title, rows }: { title: string; rows: GscRow[] }) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <div className="max-h-72 overflow-auto rounded border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800">
            <tr><th className="p-2">Key</th><th className="p-2">Clicks</th><th className="p-2">Impressions</th><th className="p-2">CTR</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.keys?.[0] ?? 'row'}-${index}`} className="border-t border-slate-800">
                <td className="max-w-xl truncate p-2">{row.keys?.[0] ?? '—'}</td>
                <td className="p-2">{(row.clicks ?? 0).toLocaleString()}</td>
                <td className="p-2">{(row.impressions ?? 0).toLocaleString()}</td>
                <td className="p-2">{((row.ctr ?? 0) * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
