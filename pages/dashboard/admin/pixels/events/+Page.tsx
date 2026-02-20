import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "#root/components/ui/card";
import { Badge } from "#root/components/ui/badge";
import { Button } from "#root/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#root/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#root/components/ui/select";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "#root/shared/trpc/client";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  sessionId: string;
  eventName: string;
  eventId: string;
  pageUrl: string | null;
  deviceType: string | null;
  createdAt: Date;
  deliveryId: string | null;
  platform: string | null;
  sent: boolean | null;
  sentAt: Date | null;
  error: string | null;
}

interface DeliveryStats {
  events24h: number;
  events7d: number;
  events30d: number;
  platformStats: { platform: string; sent: boolean; total: number }[];
}

const PAGE_SIZE = 25;

const PLATFORM_LABELS: Record<string, string> = {
  meta: "Meta",
  google_ga4: "Google GA4",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  custom: "Custom",
};

const PLATFORM_COLORS: Record<string, string> = {
  meta: "bg-blue-100 text-blue-800",
  google_ga4: "bg-amber-100 text-amber-800",
  tiktok: "bg-stone-100 text-stone-800",
  snapchat: "bg-yellow-100 text-yellow-800",
  pinterest: "bg-red-100 text-red-800",
  custom: "bg-gray-100 text-gray-800",
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPixelEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<DeliveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "failed">("all");

  // ── Fetch events ────────────────────────────────────────────

  const fetchEvents = async () => {
    try {
      const result = await trpc.pixelTracking.events.list.query({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        status: statusFilter,
      });

      if (result.success) {
        setEvents(result.result.events as unknown as EventRow[]);
        setTotal(result.result.total);
      }
    } catch (err) {
      toast.error("Failed to load events");
    }
  };

  const fetchStats = async () => {
    try {
      const result = await trpc.pixelTracking.events.stats.query();
      if (result.success) {
        setStats(result.result as DeliveryStats);
      }
    } catch {
      // Stats are non-critical
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchStats()]).finally(() => setLoading(false));
  }, [page, statusFilter]);

  // ── Stats helpers ───────────────────────────────────────────

  const getSuccessRate = (platform: string): number => {
    if (!stats) return 0;
    const platformItems = stats.platformStats.filter((s) => s.platform === platform);
    const sent = platformItems.find((s) => s.sent)?.total ?? 0;
    const failed = platformItems.find((s) => !s.sent)?.total ?? 0;
    const total = sent + failed;
    return total === 0 ? 100 : Math.round((sent / total) * 100);
  };

  const getFailedCount = (): number => {
    if (!stats) return 0;
    return stats.platformStats
      .filter((s) => !s.sent)
      .reduce((sum, s) => sum + s.total, 0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Render ──────────────────────────────────────────────────

  if (loading && events.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Event Delivery Log</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Monitor pixel event tracking and delivery status across all platforms.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-50 rounded-lg'>
                  <Zap className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Events (24h)</p>
                  <p className='text-2xl font-bold'>{stats.events24h.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-50 rounded-lg'>
                  <BarChart3 className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Events (7d)</p>
                  <p className='text-2xl font-bold'>{stats.events7d.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-purple-50 rounded-lg'>
                  <Activity className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Events (30d)</p>
                  <p className='text-2xl font-bold'>{stats.events30d.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <div className={`p-2 rounded-lg ${getFailedCount() > 0 ? "bg-red-50" : "bg-green-50"}`}>
                  {getFailedCount() > 0 ? (
                    <AlertTriangle className='w-5 h-5 text-red-600' />
                  ) : (
                    <CheckCircle2 className='w-5 h-5 text-green-600' />
                  )}
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Failed (7d)</p>
                  <p className='text-2xl font-bold'>{getFailedCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Success Rates */}
      {stats && stats.platformStats.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Platform Success Rates (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-4'>
              {[...new Set(stats.platformStats.map((s) => s.platform))].map((platform) => (
                <div key={platform} className='flex items-center gap-2'>
                  <Badge className={PLATFORM_COLORS[platform] ?? "bg-gray-100 text-gray-800"}>
                    {PLATFORM_LABELS[platform] ?? platform}
                  </Badge>
                  <span className='text-sm font-medium'>{getSuccessRate(platform)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters + Table */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>Event Log</CardTitle>
            <div className='flex items-center gap-2'>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as "all" | "sent" | "failed");
                  setPage(0);
                }}
              >
                <SelectTrigger className='w-[140px] h-8'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All</SelectItem>
                  <SelectItem value='sent'>Sent</SelectItem>
                  <SelectItem value='failed'>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            {total.toLocaleString()} events total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <Activity className='w-10 h-10 mb-3 opacity-50' />
              <p className='text-sm'>No tracking events recorded yet.</p>
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[180px]'>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='hidden md:table-cell'>Page URL</TableHead>
                      <TableHead className='hidden lg:table-cell'>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event, idx) => (
                      <TableRow key={`${event.id}-${event.deliveryId ?? idx}`}>
                        <TableCell className='text-xs text-muted-foreground whitespace-nowrap'>
                          {new Date(event.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className='text-xs bg-muted px-1.5 py-0.5 rounded'>
                            {event.eventName}
                          </code>
                        </TableCell>
                        <TableCell>
                          {event.platform ? (
                            <Badge
                              variant='secondary'
                              className={PLATFORM_COLORS[event.platform] ?? ""}
                            >
                              {PLATFORM_LABELS[event.platform] ?? event.platform}
                            </Badge>
                          ) : (
                            <span className='text-xs text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.deliveryId == null ? (
                            <Badge variant='outline' className='text-muted-foreground'>
                              <Clock className='w-3 h-3 mr-1' />
                              Pending
                            </Badge>
                          ) : event.sent ? (
                            <Badge variant='outline' className='text-green-700 border-green-200 bg-green-50'>
                              <CheckCircle2 className='w-3 h-3 mr-1' />
                              Sent
                            </Badge>
                          ) : (
                            <Badge variant='outline' className='text-red-700 border-red-200 bg-red-50'>
                              <XCircle className='w-3 h-3 mr-1' />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='hidden md:table-cell max-w-[250px] truncate text-xs text-muted-foreground'>
                          {event.pageUrl ?? "—"}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell max-w-[200px] truncate text-xs text-red-600'>
                          {event.error ?? ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <p className='text-sm text-muted-foreground'>
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
