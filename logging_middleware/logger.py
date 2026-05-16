"""
Logging Middleware — Campus Notifications
Reusable Log function that sends log entries to the evaluation server.

Usage:
    from logger import Log

    Log("backend",  "info",  "controller", "Fetching notifications")
    Log("frontend", "info",  "api",        "API call succeeded")
    Log("backend",  "error", "db",         "Connection timeout")

Signature:
    Log(stack, level, package, message)

Allowed values (lowercase only):
    stack   : "backend" | "frontend"
    level   : "debug" | "info" | "warn" | "error" | "fatal"

    package (backend)  : "cache" | "controller" | "cron_job" | "db" | "domain"
    package (frontend) : "api"   | "component"  | "hook"     | "utils" | "page"

    message : 5–48 characters
"""

import requests

# ── Config ───────────────────────────────────────────────────────────────────
LOG_API_URL = "http://4.224.186.213/evaluation-service/logs"
AUTH_TOKEN  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJyb3NoYW5hYmhpc2hlay5wMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTM0MTMxLCJpYXQiOjE3Nzg5MzMyMzEsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI1MDE4YWJhOC05YWMxLTQ2OGUtOTNhZi0wNTY0YmE1NWI5ZGIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJyb3NoYW4gYWJoaXNoZWsgcCIsInN1YiI6ImFlNWYzYjIxLTFhY2EtNDNkNC1hYmFjLWUyOWI3ZGQzODAwMSJ9LCJlbWFpbCI6InJvc2hhbmFiaGlzaGVrLnAyMDIyQHZpdHN0dWRlbnQuYWMuaW4iLCJuYW1lIjoicm9zaGFuIGFiaGlzaGVrIHAiLCJyb2xsTm8iOiIyMm1pYzAwOTciLCJhY2Nlc3NDb2RlIjoiU2ZGdVdnIiwiY2xpZW50SUQiOiJhZTVmM2IyMS0xYWNhLTQzZDQtYWJhYy1lMjliN2RkMzgwMDEiLCJjbGllbnRTZWNyZXQiOiJWZFRqQ3BUdHN4TllYWkVQIn0.HiuSChaDARaNlYQMvzU8cuq2qYnTBNAZSDeGByH9w6M"

# ── Validation sets ───────────────────────────────────────────────────────────
VALID_STACKS = {"backend", "frontend"}
VALID_LEVELS = {"debug", "info", "warn", "error", "fatal"}
VALID_PACKAGES = {
    "backend":  {"cache", "controller", "cron_job", "db", "domain"},
    "frontend": {"api", "component", "hook", "utils", "page"},
}

# ── Log function ──────────────────────────────────────────────────────────────
def Log(stack: str, level: str, package: str, message: str) -> None:
    """
    Send a log entry to the evaluation server.

    Args:
        stack   : "backend" or "frontend"
        level   : "debug" | "info" | "warn" | "error" | "fatal"
        package : backend → "cache"|"controller"|"cron_job"|"db"|"domain"
                  frontend → "api"|"component"|"hook"|"utils"|"page"
        message : 5–48 characters
    """
    # ── Local console output (always printed) ────────────────────────────────
    print(f"[{level.upper()}] [{stack}:{package}] {message}")

    # ── Validation ────────────────────────────────────────────────────────────
    if stack not in VALID_STACKS:
        print(f"[LOGGER WARNING] Invalid stack '{stack}'")
        return
    if level not in VALID_LEVELS:
        print(f"[LOGGER WARNING] Invalid level '{level}'")
        return
    if package not in VALID_PACKAGES.get(stack, set()):
        print(f"[LOGGER WARNING] Invalid package '{package}' for stack '{stack}'")
        return

    # Enforce message length: 5–48 chars
    msg = message.strip()
    if len(msg) < 5:
        msg = msg.ljust(5)
    msg = msg[:48]

    # ── Send to evaluation server ─────────────────────────────────────────────
    payload = {
        "stack":   stack,
        "level":   level,
        "package": package,
        "message": msg,
    }
    headers = {
        "Authorization": f"Bearer {AUTH_TOKEN}",
        "Content-Type":  "application/json",
    }

    try:
        response = requests.post(LOG_API_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 401:
            print("[LOGGER WARNING] Token expired — update AUTH_TOKEN in logger.py")
        elif not response.ok:
            print(f"[LOGGER WARNING] Log API {response.status_code}: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[LOGGER WARNING] Could not reach log API: {e}")
