"""
Priority Inbox - Campus Notifications
Stage 1: Fetch notifications from API and display top N by priority score.

Priority Score = type_weight / (1 + seconds_elapsed)
  - type_weight: Placement=3, Result=2, Event=1
  - recency_score: 1 / (1 + seconds_since_notification)

Uses a min-heap (via heapq) to efficiently maintain top-N as new notifications arrive.
"""

import heapq
import requests
from datetime import datetime, timezone
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'logging_middleware'))
from logger import Log

# ── Config ──────────────────────────────────────────────────────────────────
API_URL = "http://4.224.186.213/evaluation-service/notifications"
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyb3NoYW5hYmhpc2hlay5wMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTM0MTMxLCJpYXQiOjE3Nzg5MzMyMzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1MDE4YWJhOC05YWMxLTQ2OGUtOTNhZi0wNTY0YmE1NWI5ZGIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyb3NoYW4gYWJoaXNoZWsgcCIsInN1YiI6ImFlNWYzYjIxLTFhY2EtNDNkNC1hYmFjLWUyOWI3ZGQzODAwMSJ9LCJlbWFpbCI6InJvc2hhbmFiaGlzaGVrLnAyMDIyQHZpdHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoicm9zaGFuIGFiaGlzaGVrIHAiLCJyb2xsTm8iOiIyMm1pYzAwOTciLCJhY2Nlc3NDb2RlIjoiU2ZGdVdnIiwiY2xpZW50SUQiOiJhZTVmM2IyMS0xYWNhLTQzZDQtYWJhYy1lMjliN2RkMzgwMDEiLCJjbGllbnRTZWNyZXQiOiJWZFRqQ3BUdHN4TllYWkVQIn0.HiuSChaDARaNlYQMvzU8cuq2qYnTBNAZSDeGByH9w6M"
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}
TOP_N = 10

TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}

# ── Scoring ──────────────────────────────────────────────────────────────────
def parse_timestamp(ts: str) -> datetime:
    """Parse ISO-like timestamp into an aware datetime (UTC assumed if no tz)."""
    try:
        dt = datetime.fromisoformat(ts)
    except ValueError:
        dt = datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def score_notification(notification: dict, now: datetime) -> float:
    """
    Combined priority score:
      score = type_weight / (1 + seconds_elapsed)
    """
    weight = TYPE_WEIGHT.get(notification["Type"], 1)
    dt = parse_timestamp(notification["Timestamp"])
    seconds_elapsed = max((now - dt).total_seconds(), 0)
    recency = 1.0 / (1.0 + seconds_elapsed)
    score = weight * recency

    Log("backend", "debug", "domain",
        f"Scored notification ID={notification['ID']} type={notification['Type']} "
        f"elapsed={seconds_elapsed:.0f}s score={score:.6f}")

    return score


# ── Heap-based Top-N ─────────────────────────────────────────────────────────
def get_top_n(notifications: list[dict], n: int, now: datetime) -> list[dict]:
    """
    Maintain a min-heap of size n to find top-n scored notifications in O(m log n).
    """
    Log("backend", "info", "controller",
        f"Building min-heap for top-{n} from {len(notifications)} notifications")

    heap = []

    for idx, notif in enumerate(notifications):
        s = score_notification(notif, now)
        heapq.heappush(heap, (s, idx, notif))
        if len(heap) > n:
            evicted = heapq.heappop(heap)
            Log("backend", "debug", "cache",
                f"Evicted low-priority notification ID={evicted[2]['ID']} score={evicted[0]:.6f}")

    top = sorted(heap, key=lambda x: x[0], reverse=True)

    Log("backend", "info", "controller",
        f"Top-{n} selection complete — highest score={top[0][0]:.6f} lowest score={top[-1][0]:.6f}")

    return [(item[2], item[0]) for item in top]


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    Log("backend", "info", "controller", "Priority inbox started — fetching notifications")

    print("Fetching notifications from API...")
    try:
        response = requests.get(API_URL, headers=HEADERS, timeout=10)
        response.raise_for_status()
        data = response.json()

        Log("backend", "info", "controller",
            f"API responded {response.status_code} — received {len(data.get('notifications', []))} notifications")

    except requests.exceptions.ConnectionError as e:
        Log("backend", "error", "domain",
            f"Connection error reaching notifications API: {e}")
        print(f"[ERROR] Could not reach API: {e}")
        print("\nRunning with sample data for demonstration...\n")
        data = {
            "notifications": [
                {"ID": "1",  "Type": "Placement", "Message": "TCS NQT drive registration open",        "Timestamp": "2026-05-16 10:00:00"},
                {"ID": "2",  "Type": "Result",    "Message": "end-sem examination results declared",   "Timestamp": "2026-05-16 09:45:00"},
                {"ID": "3",  "Type": "Event",     "Message": "national level hackathon registrations", "Timestamp": "2026-05-16 09:30:00"},
                {"ID": "4",  "Type": "Placement", "Message": "Infosys InfyTQ hiring batch 2026",       "Timestamp": "2026-05-16 09:15:00"},
                {"ID": "5",  "Type": "Result",    "Message": "internal assessment marks uploaded",     "Timestamp": "2026-05-16 09:00:00"},
                {"ID": "6",  "Type": "Event",     "Message": "alumni meet 2026 register by may 20",    "Timestamp": "2026-05-16 08:45:00"},
                {"ID": "7",  "Type": "Placement", "Message": "Wipro elite NLTH test scheduled",        "Timestamp": "2026-05-16 08:30:00"},
                {"ID": "8",  "Type": "Result",    "Message": "lab practical scores published",         "Timestamp": "2026-05-16 08:15:00"},
                {"ID": "9",  "Type": "Event",     "Message": "inter-college coding contest slot open", "Timestamp": "2026-05-16 08:00:00"},
                {"ID": "10", "Type": "Placement", "Message": "Cognizant GenC Next off-campus drive",   "Timestamp": "2026-05-16 07:45:00"},
            ]
        }

    except requests.exceptions.Timeout:
        Log("backend", "error", "domain",
            "Notifications API request timed out after 10s")
        print("[ERROR] Request timed out.")
        return

    except requests.exceptions.HTTPError as e:
        Log("backend", "error", "controller",
            f"HTTP error from notifications API: {e} — status {response.status_code}")
        print(f"[ERROR] HTTP error: {e}")
        return

    notifications = data.get("notifications", [])
    total = len(notifications)

    if total == 0:
        Log("backend", "warn", "controller",
            "Notifications list is empty — nothing to rank")
        print("No notifications found.")
        return

    Log("backend", "info", "controller",
        f"Processing {total} notifications to find top {TOP_N}")

    print(f"Total notifications fetched: {total}\n")

    now = datetime.now(timezone.utc)
    top_notifications = get_top_n(notifications, TOP_N, now)

    print("-" * 70)
    print(f"  TOP {TOP_N} PRIORITY NOTIFICATIONS")
    print("-" * 70)
    print(f"  {'#':<4} {'Type':<12} {'Score':>10}  {'Message':<30} {'Timestamp'}")
    print("-" * 70)

    for rank, (notif, score) in enumerate(top_notifications, start=1):
        Log("backend", "info", "domain",
            f"Rank {rank}: ID={notif['ID']} type={notif['Type']} score={score:.6f} message='{notif['Message']}'")
        print(
            f"  {rank:<4} {notif['Type']:<12} {score:>10.6f}  "
            f"{notif['Message']:<30} {notif['Timestamp']}"
        )

    print("-" * 70)
    print(f"\nScoring formula: score = type_weight / (1 + seconds_elapsed)")
    print(f"Weights → Placement: 3 | Result: 2 | Event: 1")
    print(f"Evaluated at: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")

    Log("backend", "info", "controller",
        f"Priority inbox completed — top {TOP_N} notifications displayed successfully")


if __name__ == "__main__":
    main()
