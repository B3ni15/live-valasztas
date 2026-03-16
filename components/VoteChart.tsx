"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PARTIES } from "@/lib/election-data";

interface VoteChartProps {
  percents: Record<string, number>;
}

export default function VoteChart({ percents }: VoteChartProps) {
  const data = PARTIES.filter((p) => p.id !== "egyeb").map((p) => ({
    name: p.shortName,
    value: percents[p.id] || 0,
    color: p.color,
    id: p.id,
    threshold: p.threshold,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#374151" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 60]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Szavazatarány"]}
          labelStyle={{ fontWeight: "bold" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
          }}
        />
        <ReferenceLine
          y={5}
          stroke="#ef4444"
          strokeDasharray="4 4"
          label={{
            value: "5% küszöb",
            position: "insideTopRight",
            fill: "#ef4444",
            fontSize: 11,
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={entry.color}
              opacity={entry.value >= entry.threshold ? 1 : 0.35}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
