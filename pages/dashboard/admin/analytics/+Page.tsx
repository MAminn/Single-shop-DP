import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import { Badge } from "#root/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import {
  BarChart,
  Bar,
  FunnelChart,
  Funnel,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Activity,
  BarChart3,
  Eye,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { AttributionModel } from "#root/shared/types/pixel-tracking";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OverviewMetric {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

interface ChannelRow {
  channel: string;
  sessions: number;
  conversions: number;
  revenue: number;
  roas: number;
}

interface PlatformHealth {
  platform: string;
  successRate: number;
  failedDeliveries: number;
  lastEventAt: string | null;
  status: "healthy" | "degraded" | "down";
}

// ─── Demo Data ──────────────────────────────────────────────────────────────
// In production, this would come from tRPC queries to the analytics service.

const OVERVIEW_METRICS: OverviewMetric[] = [
  {
    label: "Total Sessions (7d)",
    value: "12,847",
    change: "+14.2%",
    changeType: "positive",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    label: "Total Pageviews (7d)",
    value: "48,293",
    change: "+8.1%",
    changeType: "positive",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    change: "+0.3%",
    changeType: "positive",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Avg. Order Value",
    value: "$87.50",
    change: "-$2.10",
    changeType: "negative",
    icon: <CreditCard className="h-4 w-4" />,
  },
];

const FUNNEL_DATA: FunnelStage[] = [
  { name: "Page Viewed", value: 48293, fill: "#6366f1" },
  { name: "Product Viewed", value: 18742, fill: "#8b5cf6" },
  { name: "Added to Cart", value: 5621, fill: "#a78bfa" },
  { name: "Checkout Started", value: 2103, fill: "#c4b5fd" },
  { name: "Purchase Completed", value: 1562, fill: "#ddd6fe" },
];

const CHANNEL_DATA: Record<AttributionModel, ChannelRow[]> = {
  first_touch: [
    { channel: "Organic", sessions: 4200, conversions: 180, revenue: 15840, roas: 0 },
    { channel: "Paid Meta", sessions: 3100, conversions: 142, revenue: 12430, roas: 4.1 },
    { channel: "Paid Google", sessions: 2800, conversions: 128, revenue: 11200, roas: 3.7 },
    { channel: "Direct", sessions: 1500, conversions: 65, revenue: 5688, roas: 0 },
    { channel: "Email", sessions: 800, conversions: 48, revenue: 4200, roas: 8.4 },
    { channel: "Social", sessions: 447, conversions: 15, revenue: 1313, roas: 0 },
  ],
  last_touch: [
    { channel: "Direct", sessions: 4800, conversions: 210, revenue: 18375, roas: 0 },
    { channel: "Paid Meta", sessions: 2900, conversions: 130, revenue: 11375, roas: 3.8 },
    { channel: "Paid Google", sessions: 2600, conversions: 115, revenue: 10063, roas: 3.4 },
    { channel: "Organic", sessions: 1400, conversions: 58, revenue: 5075, roas: 0 },
    { channel: "Email", sessions: 700, conversions: 42, revenue: 3675, roas: 7.4 },
    { channel: "Social", sessions: 447, conversions: 23, revenue: 2013, roas: 0 },
  ],
  linear: [
    { channel: "Paid Meta", sessions: 3000, conversions: 136, revenue: 11903, roas: 3.9 },
    { channel: "Direct", sessions: 3150, conversions: 138, revenue: 12031, roas: 0 },
    { channel: "Paid Google", sessions: 2700, conversions: 122, revenue: 10631, roas: 3.5 },
    { channel: "Organic", sessions: 2800, conversions: 119, revenue: 10458, roas: 0 },
    { channel: "Email", sessions: 750, conversions: 45, revenue: 3938, roas: 7.9 },
    { channel: "Social", sessions: 447, conversions: 19, revenue: 1663, roas: 0 },
  ],
};

const PLATFORM_HEALTH: PlatformHealth[] = [
  {
    platform: "Meta (CAPI)",
    successRate: 99.8,
    failedDeliveries: 3,
    lastEventAt: new Date(Date.now() - 45000).toISOString(),
    status: "healthy",
  },
  {
    platform: "Google GA4 (MP)",
    successRate: 99.5,
    failedDeliveries: 8,
    lastEventAt: new Date(Date.now() - 120000).toISOString(),
    status: "healthy",
  },
  {
    platform: "TikTok Events",
    successRate: 97.2,
    failedDeliveries: 42,
    lastEventAt: new Date(Date.now() - 300000).toISOString(),
    status: "degraded",
  },
  {
    platform: "Snapchat CAPI",
    successRate: 99.9,
    failedDeliveries: 1,
    lastEventAt: new Date(Date.now() - 600000).toISOString(),
    status: "healthy",
  },
  {
    platform: "Pinterest CAPI",
    successRate: 0,
    failedDeliveries: 0,
    lastEventAt: null,
    status: "down",
  },
];

// ─── Page Component ─────────────────────────────────────────────────────────

export default function AnalyticsDashboardPage() {
  const [attributionModel, setAttributionModel] =
    useState<AttributionModel>("last_touch");

  const channelRows = useMemo(
    () => CHANNEL_DATA[attributionModel],
    [attributionModel],
  );

  const channelChartData = useMemo(
    () =>
      channelRows.map((row) => ({
        name: row.channel,
        revenue: row.revenue,
        conversions: row.conversions,
      })),
    [channelRows],
  );

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of marketing performance, conversions, and platform health.
        </p>
      </div>

      {/* ── Overview Cards ────────────────────────────────────────── */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="overview-cards"
      >
        {OVERVIEW_METRICS.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.change && (
                  <p
                    className={`text-xs ${
                      metric.changeType === "positive"
                        ? "text-green-600"
                        : metric.changeType === "negative"
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {metric.change} vs prev. period
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Conversion Funnel ─────────────────────────────────────── */}
      <Card data-testid="conversion-funnel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            Drop-off at each stage of the purchase journey (last 7 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-5 gap-2">
            {FUNNEL_DATA.map((stage, idx) => {
              const prevValue = idx > 0 ? FUNNEL_DATA[idx - 1]!.value : stage.value;
              const dropOff =
                idx > 0
                  ? ((1 - stage.value / prevValue) * 100).toFixed(1)
                  : null;
              return (
                <div key={stage.name} className="text-center">
                  <p className="text-xs text-muted-foreground">{stage.name}</p>
                  <p className="text-lg font-bold">
                    {stage.value.toLocaleString()}
                  </p>
                  {dropOff && (
                    <p className="text-xs text-red-500">
                      -{dropOff}% drop
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FUNNEL_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={130} />
              <Tooltip
                formatter={(value) => (typeof value === "number" ? value.toLocaleString() : String(value))}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {FUNNEL_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Channel Performance ───────────────────────────────────── */}
      <Card data-testid="channel-breakdown">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Channel Performance
              </CardTitle>
              <CardDescription>
                Revenue and conversions by marketing channel
              </CardDescription>
            </div>
            <Select
              value={attributionModel}
              onValueChange={(v) =>
                setAttributionModel(v as AttributionModel)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Attribution Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_touch">First Touch</SelectItem>
                <SelectItem value="last_touch">Last Touch</SelectItem>
                <SelectItem value="linear">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={channelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#6366f1"
                name="Revenue ($)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="conversions"
                fill="#22c55e"
                name="Conversions"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">ROAS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelRows.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell className="font-medium">{row.channel}</TableCell>
                  <TableCell className="text-right">
                    {row.sessions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.conversions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${row.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.roas > 0 ? `${row.roas.toFixed(1)}x` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Platform Health ───────────────────────────────────────── */}
      <Card data-testid="platform-health">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Health
          </CardTitle>
          <CardDescription>
            Server-side delivery status for each pixel platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Last Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLATFORM_HEALTH.map((ph) => (
                <TableRow key={ph.platform}>
                  <TableCell className="font-medium">{ph.platform}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ph.status === "healthy"
                          ? "default"
                          : ph.status === "degraded"
                            ? "secondary"
                            : "destructive"
                      }
                      className="gap-1"
                    >
                      {ph.status === "healthy" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {ph.status === "degraded" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {ph.status === "down" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {ph.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {ph.successRate > 0
                      ? `${ph.successRate.toFixed(1)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {ph.failedDeliveries}
                  </TableCell>
                  <TableCell className="text-right">
                    {ph.lastEventAt ? (
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(ph.lastEventAt)}
                      </span>
                    ) : (
                      "Never"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
