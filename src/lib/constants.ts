// Application-wide constants

export const QUERY_STALE_TIME = 30000; // 30 seconds
export const QUERY_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const STATUS_COLORS = {
  active: "bg-primary/20 text-primary border-primary/30",
  lead: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  finished: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  suspended: "bg-muted/20 text-muted-foreground border-muted/30",
  bad: "bg-red-600/20 text-red-500 border-red-600/30",
  name_change: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  other: "bg-muted/20 text-muted-foreground border-muted/30",
} as const;

export const PRIORITY_COLORS = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/20 text-yellow-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
} as const;

export const TASK_STATUS_COLORS = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  blocked: "bg-red-500/20 text-red-400",
} as const;

export const PROCESSING_MODE_COLORS = {
  standard: "bg-muted text-muted-foreground",
  expedited: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  vip: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  vip_plus: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
} as const;

export const PROCESSING_MODE_LABELS = {
  standard: "Standard",
  expedited: "Expedited",
  vip: "VIP",
  vip_plus: "VIP+",
} as const;
