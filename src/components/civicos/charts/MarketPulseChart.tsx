import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, ComposedChart, Bar,
} from "recharts";
import type { TrendPoint } from "@/lib/civicos/types";

export function MarketPulseChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="neonFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.92 0.20 122)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="oklch(0.92 0.20 122)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="oklch(0.27 0 0)" strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="t" tick={{ fill: "oklch(0.66 0 0)", fontSize: 11 }}
          axisLine={false} tickLine={false} minTickGap={32}
        />
        <YAxis
          tick={{ fill: "oklch(0.66 0 0)", fontSize: 11 }}
          axisLine={false} tickLine={false} width={36}
        />
        <Tooltip
          cursor={{ stroke: "oklch(0.92 0.20 122)", strokeDasharray: "2 2", strokeOpacity: 0.6 }}
          contentStyle={{
            background: "oklch(0.19 0 0)", border: "1px solid oklch(0.27 0 0)",
            borderRadius: 8, fontSize: 12, color: "oklch(0.97 0 0)",
          }}
          labelStyle={{ color: "oklch(0.66 0 0)" }}
          formatter={(v) => [`+${v}`, "value"]}
        />
        <Bar dataKey="volume" fill="oklch(0.27 0 0)" radius={[2, 2, 0, 0]} maxBarSize={3} />
        <Area
          type="monotone" dataKey="value" stroke="oklch(0.92 0.20 122)"
          strokeWidth={2.25} fill="url(#neonFill)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({ data, color = "oklch(0.92 0.20 122)" }: { data: { value: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.6} fill={`url(#sg-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniLine({ data }: { data: { value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <ComposedChart data={data}>
        <Line type="monotone" dataKey="value" stroke="oklch(0.66 0 0)" strokeWidth={1.4} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
