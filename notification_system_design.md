# Stage 1

## Priority Inbox — System Design

### Problem

Users lose track of important notifications in a high-volume stream. We need to surface the top **n** most important *unread* notifications, where importance is determined by both **type** (Placement > Result > Event) and **recency** (newer = more important).

---

## Approach

### Scoring Formula

Each notification receives a **priority score**:

```
score = type_weight / (1 + seconds_elapsed)
```

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

- **type_weight** encodes business priority. A Placement notification is 3× more important than an Event.
- **recency term** `1 / (1 + seconds_elapsed)` decays toward 0 as the notification ages, ensuring fresher notifications beat stale ones of the same type.
- The combination means a *very recent* Event can outrank an *old* Placement — recency always matters.

### Why this formula?

- It is a single continuous score, so items can be compared directly.
- No arbitrary thresholds or buckets.
- Naturally handles the "new notifications keep coming in" requirement: recency re-ranks everything each time we evaluate.

---

## Maintaining Top-N Efficiently (Streaming)

As new notifications arrive continuously, we use a **min-heap of size n**:

```
for each incoming notification:
    compute score
    push onto min-heap
    if heap size > n:
        pop (removes the lowest-score item)
```

**Complexity:**
- Each insertion/pop: **O(log n)**
- For m total notifications: **O(m log n)**
- Space: **O(n)** — only top-n ever kept in memory

This is far more efficient than sorting all notifications each time (**O(m log m)**), and scales to millions of notifications with a tiny constant memory footprint.

### Comparison: Approaches Considered

| Approach | Time | Space | Streaming? |
|---|---|---|---|
| Sort all, slice top-n | O(m log m) | O(m) | ❌ Re-sort on each arrival |
| Min-heap of size n (chosen) | O(m log n) | O(n) | ✅ Push each new item |
| Sorted list insert | O(m·n) | O(n) | ❌ Slow insertion |

---

## Handling New Notifications Arriving

Since recency is computed **at evaluation time** (not stored), the heap must be **rebuilt** (or at minimum the new notification pushed in) whenever a fresh notification arrives. Options:

1. **Periodic re-evaluation** (e.g., every 30 seconds): Simple. Re-fetch API, rebuild heap. Suitable for polling-based APIs.
2. **Incremental push**: On each new notification event (websocket/SSE), push into heap and pop excess. Heap always reflects current top-n.

For this API (REST GET), **periodic re-evaluation** is the correct strategy.

---

## Output

Running `python priority_inbox.py` prints the top 10 notifications ranked by priority score, showing rank, type, score, message, and timestamp.
