import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format as formatDate, parseISO } from 'date-fns';
import type { PainEntry } from '../../../types';

interface TreatmentOverlayProps {
  entries: PainEntry[];
}

interface ChartDataPoint {
  date: string;
  pain: number;
  treatment?: string;
  medication?: string;
}

interface TreatmentEvent {
  date: string;
  type: 'treatment' | 'medication';
  description: string;
}

export const TreatmentOverlay: React.FC<TreatmentOverlayProps> = ({ entries }) => {
  const { chartData, treatmentEvents } = useMemo(() => {
    if (!entries.length) return { chartData: [], treatmentEvents: [] };

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const chartData: ChartDataPoint[] = sortedEntries.map(entry => ({
      date: formatDate(parseISO(entry.timestamp), 'MMM dd'),
      pain: entry.baselineData.pain,
      treatment: entry.treatments.recent.length > 0 ? 'Treatment' : undefined,
      medication: entry.medications.changes ? 'Med Change' : undefined
    }));

    const treatmentEvents: TreatmentEvent[] = [];
    
    sortedEntries.forEach(entry => {
      const date = formatDate(parseISO(entry.timestamp), 'MMM dd');
      
      if (entry.treatments.recent.length > 0) {
        entry.treatments.recent.forEach(treatment => {
          treatmentEvents.push({
            date,
            type: 'treatment',
            description: `${treatment.type} - ${treatment.provider}`
          });
        });
      }
      
      if (entry.medications.changes) {
        treatmentEvents.push({
          date,
          type: 'medication',
          description: `Medication change: ${entry.medications.changes}`
        });
      }
    });

    return { chartData, treatmentEvents };
  }, [entries]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const events = treatmentEvents.filter(event => event.date === label);

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-blue-600">Pain Level: {data.pain}/10</p>
        {events.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-sm">Events:</p>
            {events.map((event, index) => (
              <div key={index} className="text-xs mt-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  event.type === 'treatment' ? 'bg-green-500' : 'bg-orange-500'
                }`}></span>
                {event.description}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!entries.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Treatment Overlay Chart</h2>
        <p className="text-gray-600">No data available for treatment overlay.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Pain Timeline with Treatment Overlay</h2>
      
      <div className="space-y-6">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 10]} 
                tick={{ fontSize: 12 }}
                label={{ value: 'Pain Level', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line
                type="monotone"
                dataKey="pain"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                name="Pain Level"
              />

              {/* Treatment markers */}
              {chartData.map((point, index) => {
                if (point.treatment) {
                  return (
                    <ReferenceLine
                      key={`treatment-${index}`}
                      x={point.date}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              })}

              {/* Medication markers */}
              {chartData.map((point, index) => {
                if (point.medication) {
                  return (
                    <ReferenceLine
                      key={`medication-${index}`}
                      x={point.date}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span>Pain Level</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
            <span>Treatment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-orange-500 border-dotted border-t-2 border-orange-500"></div>
            <span>Medication Change</span>
          </div>
        </div>

        {/* Treatment Events Summary */}
        {treatmentEvents.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Treatment Timeline</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {treatmentEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <div className={`w-3 h-3 rounded-full mt-0.5 ${
                    event.type === 'treatment' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.date}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Treatment Impact Analysis</h3>
          <div className="text-sm space-y-1">
            {(() => {
              const treatmentDates = new Set(treatmentEvents.filter(e => e.type === 'treatment').map(e => e.date));
              const medicationDates = new Set(treatmentEvents.filter(e => e.type === 'medication').map(e => e.date));
              
              return (
                <>
                  <div>• Total treatments recorded: {treatmentDates.size}</div>
                  <div>• Medication changes recorded: {medicationDates.size}</div>
                  <div>• Pain range: {Math.min(...chartData.map(d => d.pain))} - {Math.max(...chartData.map(d => d.pain))}/10</div>
                  <div>• Average pain level: {(chartData.reduce((sum, d) => sum + d.pain, 0) / chartData.length).toFixed(1)}/10</div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
