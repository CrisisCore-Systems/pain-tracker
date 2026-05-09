import { useMemo, useState } from 'react';

type SeoRow = {
  propertyLabel: string;
  propertyUrl: string;
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousClicks: number;
  previousImpressions: number;
  clickDelta: number;
  impressionDelta: number;
  opportunityScore: number;
};

type SeoPayload = {
  ok: boolean;
  generatedAt?: string;
  dateWindow?: {
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
    days: number;
  };
  totals?: {
    clicks: number;
    impressions: number;
    previousClicks: number;
    previousImpressions: number;
    ctr: number;
    previousCtr: number;
    clickDelta: number;
    impressionDelta: number;
  };
  rows?: SeoRow[];
  errors?: Array<{ property: string; error: string }>;
  error?: string;
};

type PageRollup = {
  propertyLabel: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  clickDelta: number;
  impressionDelta: number;
  opportunityScore: number;
  topQuery: string;
};

type QueryRollup = {
  propertyLabel: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  pages: number;
  clickDelta: number;
  impressionDelta: number;
  opportunityScore: number;
};

function number(value = 0): string {
  return new Intl.NumberFormat('en-CA').format(Math.round(value));
}

function percent(value = 0): string {
  return `${(value * 100).toFixed(1)}%`;
}

function delta(value = 0): string {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${number(rounded)}` : number(rounded);
}

function hostPath(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function weightedPosition(rows: SeoRow[]): number {
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  if (impressions <= 0) return 0;
  return rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions;
}

function rollupPages(rows: SeoRow[]): PageRollup[] {
  const groups = new Map<string, SeoRow[]>();
  rows.forEach(row => {
    const key = `${row.propertyLabel}\n${row.page}`;
    groups.set(key, [...(groups.get(key) || []), row]);
  });

  return [...groups.values()].map(group => {
    const first = group[0];
    const clicks = group.reduce((sum, row) => sum + row.clicks, 0);
    const impressions = group.reduce((sum, row) => sum + row.impressions, 0);
    const topQuery = [...group].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)[0]?.query || '';
    return {
      propertyLabel: first.propertyLabel,
      page: first.page,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      position: weightedPosition(group),
      clickDelta: group.reduce((sum, row) => sum + row.clickDelta, 0),
      impressionDelta: group.reduce((sum, row) => sum + row.impressionDelta, 0),
      opportunityScore: group.reduce((sum, row) => sum + row.opportunityScore, 0),
      topQuery,
    };
  });
}

function rollupQueries(rows: SeoRow[]): QueryRollup[] {
  const groups = new Map<string, SeoRow[]>();
  rows.forEach(row => {
    const key = `${row.propertyLabel}\n${row.query}`;
    groups.set(key, [...(groups.get(key) || []), row]);
  });

  return [...groups.values()].map(group => {
    const first = group[0];
    const clicks = group.reduce((sum, row) => sum + row.clicks, 0);
    const impressions = group.reduce((sum, row) => sum + row.impressions, 0);
    return {
      propertyLabel: first.propertyLabel,
      query: first.query,
      clicks,
      impressions,
      ctr: impressions > 0 ? clicks / impressions : 0,
      position: weightedPosition(group),
      pages: new Set(group.map(row => row.page)).size,
      clickDelta: group.reduce((sum, row) => sum + row.clickDelta, 0),
      impressionDelta: group.reduce((sum, row) => sum + row.impressionDelta, 0),
      opportunityScore: group.reduce((sum, row) => sum + row.opportunityScore, 0),
    };
  });
}

function status(row: SeoRow): string {
  if (row.clickDelta < 0 && row.impressions >= 25) return 'decaying';
  if (row.impressions >= 100 && row.ctr < 0.02 && row.position <= 20) return 'underperforming';
  if (row.impressionDelta > 0 && row.clicks <= 2) return 'emerging';
  return 'working';
}

export function SeoDashboardPage() {
  const [token, setToken] = useState(() => localStorage.getItem('seo-dashboard-token') || '');
  const [days, setDays] = useState('28');
  const [property, setProperty] = useState('all');
  const [needle, setNeedle] = useState('');
  const [payload, setPayload] = useState<SeoPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    localStorage.setItem('seo-dashboard-token', token);

    try {
      const response = await fetch(`/api/seo/gsc-performance?days=${encodeURIComponent(days)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const next = (await response.json()) as SeoPayload;
      if (!response.ok || !next.ok) throw new Error(next.error || `Request failed with ${response.status}`);
      setPayload(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load Search Console performance');
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => payload?.rows || [], [payload]);
  const properties = useMemo(() => ['all', ...new Set(rows.map(row => row.propertyLabel))], [rows]);
  const filtered = useMemo(() => {
    const q = needle.trim().toLowerCase();
    return rows.filter(row => {
      const propertyMatch = property === 'all' || row.propertyLabel === property;
      const textMatch = !q || `${row.page} ${row.query}`.toLowerCase().includes(q);
      return propertyMatch && textMatch;
    });
  }, [needle, property, rows]);

  const pageRows = useMemo(() => rollupPages(filtered).sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 40), [filtered]);
  const queryRows = useMemo(() => rollupQueries(filtered).sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 40), [filtered]);
  const working = useMemo(() => [...filtered].sort((a, b) => b.clicks - a.clicks).slice(0, 15), [filtered]);
  const underperforming = useMemo(() => filtered.filter(row => status(row) === 'underperforming').slice(0, 15), [filtered]);
  const decaying = useMemo(() => filtered.filter(row => status(row) === 'decaying').slice(0, 15), [filtered]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Search Console command view</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Live SEO dashboard</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            A private operator surface for pages, queries, clicks, impressions, CTR, rank position, trend deltas, and content opportunities across owned properties.
          </p>
          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_160px_180px]">
            <input
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:ring-4 focus:ring-cyan-400/30"
              type="password"
              value={token}
              onChange={event => setToken(event.target.value)}
              placeholder="SEO_DASHBOARD_TOKEN"
            />
            <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3" value={days} onChange={event => setDays(event.target.value)}>
              <option value="7">7 days</option>
              <option value="28">28 days</option>
              <option value="90">90 days</option>
            </select>
            <button className="rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 disabled:opacity-50" onClick={refresh} disabled={loading || token.trim().length === 0}>
              {loading ? 'Pulling...' : 'Refresh'}
            </button>
          </div>
          {payload?.generatedAt && payload.dateWindow && (
            <p className="mt-4 text-xs text-slate-400">
              Generated {new Date(payload.generatedAt).toLocaleString()} · {payload.dateWindow.startDate} to {payload.dateWindow.endDate} · previous {payload.dateWindow.previousStartDate} to {payload.dateWindow.previousEndDate}
            </p>
          )}
        </header>

        {error && <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-100">{error}</div>}
        {payload?.errors?.length ? <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-100">{payload.errors.map(item => `${item.property}: ${item.error}`).join(' | ')}</div> : null}

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Clicks" value={number(payload?.totals?.clicks)} note={delta(payload?.totals?.clickDelta)} />
          <Metric title="Impressions" value={number(payload?.totals?.impressions)} note={delta(payload?.totals?.impressionDelta)} />
          <Metric title="CTR" value={percent(payload?.totals?.ctr)} note={`prev ${percent(payload?.totals?.previousCtr)}`} />
          <Metric title="Rows" value={number(filtered.length)} note="page/query pairs" />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3" value={needle} onChange={event => setNeedle(event.target.value)} placeholder="Filter page or query" />
            <select className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3" value={property} onChange={event => setProperty(event.target.value)}>
              {properties.map(item => <option key={item} value={item}>{item === 'all' ? 'All properties' : item}</option>)}
            </select>
          </div>
        </section>

        <RollupTable title="Highest opportunity pages" rows={pageRows.map(row => [row.propertyLabel, <a className="text-cyan-200 hover:underline" href={row.page} target="_blank" rel="noreferrer">{hostPath(row.page)}</a>, row.topQuery, number(row.clicks), number(row.impressions), percent(row.ctr), row.position.toFixed(1), row.opportunityScore.toFixed(1)])} headers={['Property', 'Page', 'Top query', 'Clicks', 'Impr.', 'CTR', 'Pos.', 'Opp.']} />
        <RollupTable title="Queries to steer from" rows={queryRows.map(row => [row.propertyLabel, row.query, number(row.clicks), number(row.impressions), percent(row.ctr), row.position.toFixed(1), number(row.pages), row.opportunityScore.toFixed(1)])} headers={['Property', 'Query', 'Clicks', 'Impr.', 'CTR', 'Pos.', 'Pages', 'Opp.']} />

        <section className="grid gap-4 xl:grid-cols-3">
          <PairList title="Working now" rows={working} />
          <PairList title="Underperforming" rows={underperforming} />
          <PairList title="Decaying" rows={decaying} />
        </section>
      </div>
    </main>
  );
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">{title}</p><p className="mt-2 text-3xl font-black text-white">{value}</p><p className="mt-1 text-sm text-cyan-200">{note}</p></div>;
}

function RollupTable({ title, headers, rows }: { title: string; headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
      <h2 className="border-b border-slate-800 p-5 text-xl font-black text-white">{title}</h2>
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400"><tr>{headers.map(header => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} className="px-4 py-8 text-slate-400">No rows yet.</td></tr> : rows.map((row, index) => <tr key={index} className="border-t border-slate-800/80 hover:bg-slate-800/40">{row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-[520px] px-4 py-3 align-top text-slate-200">{cell}</td>)}</tr>)}</tbody></table></div>
    </section>
  );
}

function PairList({ title, rows }: { title: string; rows: SeoRow[] }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <div className="mt-4 space-y-3">{rows.length === 0 ? <p className="text-sm text-slate-400">No matching rows.</p> : rows.map(row => <article key={`${row.page}-${row.query}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-cyan-100">{row.query}</p><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{row.propertyLabel}</span></div><a className="mt-2 block truncate text-xs text-slate-400 hover:text-cyan-200 hover:underline" href={row.page} target="_blank" rel="noreferrer">{hostPath(row.page)}</a><div className="mt-3 grid grid-cols-4 gap-2 text-xs text-slate-300"><span>{number(row.clicks)} clicks</span><span>{number(row.impressions)} impr.</span><span>{percent(row.ctr)}</span><span>{row.position.toFixed(1)} pos</span></div></article>)}</div>
    </section>
  );
}

export default SeoDashboardPage;
