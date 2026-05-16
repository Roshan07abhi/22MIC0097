import { Notification, NotificationType } from "@/types/notification";

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function scoreNotification(notif: Notification): number {
  const weight = TYPE_WEIGHT[notif.Type] ?? 1;
  const dt = new Date(notif.Timestamp.replace(" ", "T") + "Z");
  const secondsElapsed = Math.max((Date.now() - dt.getTime()) / 1000, 0);
  return weight / (1 + secondsElapsed);
}

export function getTopN(notifications: Notification[], n: number): Notification[] {
  return [...notifications]
    .map((n) => ({ ...n, score: scoreNotification(n) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, n);
}

export const TYPE_COLORS: Record<NotificationType, string> = {
  Placement: "#10b981",
  Result: "#6366f1",
  Event: "#f59e0b",
};

export const TYPE_BG: Record<NotificationType, string> = {
  Placement: "#d1fae5",
  Result: "#e0e7ff",
  Event: "#fef3c7",
};
