"use client";
import { useState, useEffect, useCallback } from "react";
import { Notification, NotificationType } from "@/types/notification";
import { Log } from "@/lib/logger";

interface Options {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}

export function useNotifications(opts: Options = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    Log("frontend", "info", "hook", "Fetching notifications from API");

    try {
      const params = new URLSearchParams();
      if (opts.limit) params.set("limit", String(opts.limit));
      if (opts.page) params.set("page", String(opts.page));
      if (opts.notification_type) params.set("notification_type", opts.notification_type);

      const qs = params.toString();
      const res = await fetch(`/api/notifications${qs ? "?" + qs : ""}`);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list: Notification[] = data.notifications ?? [];
      setNotifications(list);
      setHasMore(data.hasMore ?? false);
      Log("frontend", "info", "hook", `Fetched ${list.length} notifications`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "fetch failed";
      setError(msg);
      Log("frontend", "error", "hook", `Fetch error: ${msg}`.slice(0, 48));
      setNotifications(fallbackData);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [opts.limit, opts.page, opts.notification_type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { notifications, loading, error, hasMore, refetch: fetchData };
}

const fallbackData: Notification[] = [
  { ID: "1",  Type: "Placement", Message: "TCS NQT drive registration open",        Timestamp: "2026-05-16 10:00:00" },
  { ID: "2",  Type: "Result",    Message: "end-sem examination results declared",   Timestamp: "2026-05-16 09:45:00" },
  { ID: "3",  Type: "Event",     Message: "national level hackathon registrations", Timestamp: "2026-05-16 09:30:00" },
  { ID: "4",  Type: "Placement", Message: "Infosys InfyTQ hiring batch 2026",       Timestamp: "2026-05-16 09:15:00" },
  { ID: "5",  Type: "Result",    Message: "internal assessment marks uploaded",     Timestamp: "2026-05-16 09:00:00" },
  { ID: "6",  Type: "Event",     Message: "alumni meet 2026 register by may 20",    Timestamp: "2026-05-16 08:45:00" },
  { ID: "7",  Type: "Placement", Message: "Wipro elite NLTH test scheduled",        Timestamp: "2026-05-16 08:30:00" },
  { ID: "8",  Type: "Result",    Message: "lab practical scores published",         Timestamp: "2026-05-16 08:15:00" },
  { ID: "9",  Type: "Event",     Message: "inter-college coding contest slot open", Timestamp: "2026-05-16 08:00:00" },
  { ID: "10", Type: "Placement", Message: "Cognizant GenC Next off-campus drive",   Timestamp: "2026-05-16 07:45:00" },
];
