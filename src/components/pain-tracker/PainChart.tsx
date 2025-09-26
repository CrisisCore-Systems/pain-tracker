import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "../../design-system/utils/accessibility";
import type { PainEntry } from "../../types";

interface ChartData {
  timestamp: string;
  pain: number;
}

interface PainChartProps {
  entries: Pick<PainEntry, "timestamp" | "baselineData">[];
}

export function PainChart({ entries }: PainChartProps) {
  const prefersReducedMotion = useReducedMotion();

  const chartData: ChartData[] = [...entries]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(entry => ({
      timestamp: format(new Date(entry.timestamp), "MM/dd HH:mm"),
      pain: entry.baselineData.pain,
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Pain History Chart</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="timestamp" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="pain"
              stroke="#3b82f6"
              strokeWidth={2}
              isAnimationActive={!prefersReducedMotion}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
