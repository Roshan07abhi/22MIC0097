"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup, CircularProgress, Alert, Button, Stack, Tooltip, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Navbar from "@/components/Navbar";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useRead } from "@/context/ReadContext";
import { NotificationType } from "@/types/notification";
import { Log } from "@/lib/logger";

export default function Home() {
  const [filterType, setFilterType] = useState<NotificationType | "">("");
  const [page, setPage] = useState(1);

  const { notifications, loading, error, hasMore, refetch } = useNotifications({
    notification_type: filterType || undefined,
    limit: 10,
    page: page,
  });

  const { readIds, markAllRead } = useRead();

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readIds.has(n.ID)).length;
  }, [notifications, readIds]);

  useEffect(() => {
    Log("frontend", "info", "page", "All notifications page loaded");
  }, []);

  function handleTypeChange(_: React.MouseEvent<HTMLElement>, val: NotificationType | "") {
    setFilterType(val ?? "");
    setPage(1);
    Log("frontend", "debug", "page", `Filter: ${val || "all"}`);
  }

  function handleMarkAll() {
    markAllRead(notifications.map(n => n.ID));
    Log("frontend", "info", "page", "All notifications marked as read");
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar unreadCount={unreadCount} />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
          <div>
            <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              Page {page} &middot; {unreadCount} unread
            </Typography>
          </div>

          <Stack direction="row" gap={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={refetch}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box mb={2}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={handleTypeChange}
            size="small"
          >
            <ToggleButton value="">All</ToggleButton>
            <ToggleButton value="Placement">Placement</ToggleButton>
            <ToggleButton value="Result">Result</ToggleButton>
            <ToggleButton value="Event">Event</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Could not reach live API — showing sample data.
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Alert severity="info">No notifications found.</Alert>
        ) : (
          <div>
            {notifications.map(n => (
              <NotificationCard key={n.ID} notification={n} />
            ))}

            <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={3}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackIcon />}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </Button>
              <Typography variant="body2" color="text.secondary">
                Page {page}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowForwardIcon />}
                disabled={!hasMore}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </Box>
          </div>
        )}
      </Container>
    </Box>
  );
}
