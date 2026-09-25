import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Dropdown from './Dropdown.jsx';
import { getStockSummary } from '../lib/api.js';

const RADIAN = Math.PI / 180;

function renderPercentLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
      {value}%
    </text>
  );
}

function renderLegend({ payload }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function StockDonut() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const summary = await getStockSummary();
        setData(summary);
      } catch (err) {
        console.error('Stock summary error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] transition-shadow hover:shadow-[0_6px_16px_rgba(16,24,40,0.10)] lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Stock Overview</h3>
      </div>

      <div className="h-[220px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">Loading…</div>
        ) : data.every(d => d.value === 0) ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">No product data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={58} outerRadius={85} paddingAngle={3} stroke="#ffffff" strokeWidth={2}
                label={renderPercentLabel} labelLine={false} isAnimationActive>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend content={renderLegend} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
