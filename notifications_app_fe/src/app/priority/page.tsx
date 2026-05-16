"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Box, Container, Typography, CircularProgress, Alert, Slider, Stack, Chip, Tooltip, IconButton, Paper, Divider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useRead } from "@/context/ReadContext";
import { getTopN } from "@/utils/scoring";
import { NotificationType } from "@/types/notification";
import { Log } from "@/lib/logger";

export default function PriorityPage() {
  const [topN, setTopN] = useState(10);
  const [filterType, setFilterType] = useState<NotificationType | "">("");

  const { notifications, loading, error, refetch } = useNotifications();
  const { readIds } = useRead();

  useEffect(() => {
    Log("frontend", "info", "page", "Priority inbox page loaded");
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.has(n.ID)).length;
  }, [notifications, readIds]);

  const filtered = useMemo(() => {
    if (!filterType) return notifications;
    return notifications.filter(n => n.Type === filterType);
  }, [notifications, filterType]);

  const topNotifications = useMemo(() => getTopN(filtered, topN), [filtered, topN]);

  function handleFilterChange(_: React.MouseEvent<HTMLElement>, val: NotificationType | "") {
    setFilterType(val ?? "");
    Log("frontend", "debug", "page", `Priority filter: ${val || "all"}`);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
          <div>
            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
              <StarIcon sx={{ color: "#f59e0b" }} />
              <Typography variant="h5" fontWeight={700}>Priority Inbox</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Top {topN} notifications ranked by type weight and recency
            </Typography>
          </div>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={refetch}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fffbeb" }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1}>
            <InfoOutlinedIcon fontSize="small" sx={{ color: "#f59e0b" }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              score = type_weight / (1 + seconds_elapsed)
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label="Placement — 3x weight" size="small" variant="outlined" sx={{ fontSize: 11, color: "#10b981", borderColor: "#10b981" }} />
            <Chip label="Result — 2x weight" size="small" variant="outlined" sx={{ fontSize: 11, color: "#6366f1", borderColor: "#6366f1" }} />
            <Chip label="Event — 1x weight" size="small" variant="outlined" sx={{ fontSize: 11, color: "#f59e0b", borderColor: "#f59e0b" }} />
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            Show top{" "}
            <span style={{ color: "#6366f1", fontSize: 18, fontWeight: 700 }}>{topN}</span>
            {" "}notifications
          </Typography>
          <Slider
            value={topN}
            min={5}
            max={20}
            step={5}
            marks={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 15, label: "15" },
              { value: 20, label: "20" },
            ]}
            onChange={(_, val) => setTopN(val as number)}
            sx={{ color: "#6366f1" }}
          />
        </Paper>

        <Box mb={2}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleFilterChange}
            size="small"
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="Placement">Placement</ToggleButton>
            <ToggleButton value="Result">Result</ToggleButton>
            <ToggleButton value="Event">Event</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Could not reach live API — showing sample data.
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : topNotifications.length === 0 ? (
          <Alert severity="info">No notifications available.</Alert>
        ) : (
          topNotifications.map((n, i) => (
            <NotificationCard key={n.ID} notification={n} rank={i + 1} showScore />
          ))
        )}
      </Container>
    </Box>
  );
}
