<<<<<<< HEAD

## Repository Structure
├── logging_middleware/            # Reusable logging middleware
│   └── logger.py
├── notification_app_be/           # Stage 1 — Python backend
│   └── priority_inbox.py
├── notification_app_fe/           # Stage 2 — Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx
│       │   ├── priority/page.tsx
│       │   └── api/notifications/route.ts
│       ├── components/
│       ├── hooks/
│       ├── context/
│       ├── lib/logger.ts
│       └── utils/
├── notification_system_design.md  # Stage 1 — System design
├── .gitignore
└── README.md
```

---

## Pre-Test

![Pre-Test](./screenshots/pretest.png)

---

## Stage 1 — Priority Inbox (Python)

Run with:
```bash
pip install requests
python notification_app_be/priority_inbox.py
```

### How it works

- Fetches notifications from the evaluation API
- Scores each notification: `score = type_weight / (1 + seconds_elapsed)`
- Weights: Placement = 3, Result = 2, Event = 1
- Uses a min-heap of size N for O(m log n) efficiency

### Screenshot

![Stage 1 Output](./screenshots/stage1.png)

---

## Stage 2 — Frontend (Next.js)

Run with:
```bash
cd notification_app_fe
npm install
npm run dev
```

Opens at: http://localhost:3000

### Pages

- **All Notifications** (`/`) — lists all notifications with type filter and pagination
- **Priority Inbox** (`/priority`) — top N notifications ranked by priority score with slider

### Screenshots

**All Notifications Page**
![All Notifications](./screenshots/stage2_all.png)

**Priority Inbox Page**
![Priority Inbox](./screenshots/stage2_priority.png)

**Mobile View**
![Mobile View](./screenshots/stage2_mobile.png)

---

## Logging Middleware

Reusable `Log` function in `logging_middleware/logger.py` (backend) and `notification_app_fe/src/lib/logger.ts` (frontend).

**API:** `POST http://4.224.186.213/evaluation-service/logs`

**Signature:** `Log(stack, level, package, message)`

| Field | Allowed Values |
|-------|---------------|
| `stack` | `"backend"` / `"frontend"` |
| `level` | `"debug"` / `"info"` / `"warn"` / `"error"` / `"fatal"` |
| `package` (backend) | `"cache"` / `"controller"` / `"cron_job"` / `"db"` / `"domain"` |
| `package` (frontend) | `"api"` / `"component"` / `"hook"` / `"utils"` / `"page"` |
| `message` | 5–48 characters |

### Python usage
```python
from logging_middleware.logger import Log

Log("backend", "info",  "controller", "Fetching notifications")
Log("backend", "error", "domain",     "API connection failed")
```

### TypeScript usage
```ts
import { Log } from "@/lib/logger";

Log("frontend", "info",  "page", "All notifications page loaded");
Log("frontend", "error", "hook", "Fetch failed: HTTP 401");
```
=======
# 22MIC0097<img width="1916" height="876" alt="image" src="https://github.com/user-attachments/assets/b3b1ce30-cbe2-410f-9182-825c8bb11a11" />
>>>>>>> eee545e212e3d8cba2e747fbfcf3167c5769796d
