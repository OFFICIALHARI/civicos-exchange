import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  ComposedChart,
  Bar,
} from "recharts";
import type { TrendPoint } from "@/lib/civicos/types";

export function MarketPulseChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="forestFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} opacity={0.4} />
        <XAxis
          dataKey="t"
          tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: "var(--primary)", strokeDasharray: "4 4", strokeOpacity: 0.4 }}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
            fontSize: 12,
            color: "var(--foreground)",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4, fontWeight: 600 }}
          itemStyle={{ color: "var(--primary)", padding: 0 }}
          formatter={(v) => [`${v}`, "Value"]}
        />
        <Bar dataKey="volume" fill="var(--primary)" opacity={0.1} radius={[1, 1, 0, 0]} maxBarSize={4} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#forestFill)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({
  data,
  color = "var(--primary)",
}: {
  data: { value: number }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace(/[()#]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color.replace(/[()#]/g, '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniLine({ data }: { data: { value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <ComposedChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--muted-foreground)"
          strokeWidth={1.2}
          opacity={0.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
