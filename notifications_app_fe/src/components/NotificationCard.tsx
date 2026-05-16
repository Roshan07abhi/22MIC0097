"use client";
import React from "react";
import { Card, CardContent, Typography, Chip, Box, IconButton, Tooltip } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Notification } from "@/types/notification";
import { TYPE_COLORS, TYPE_BG } from "@/utils/scoring";
import { useRead } from "@/context/ReadContext";
import { Log } from "@/lib/logger";

interface NotificationCardProps {
  notification: Notification;
  rank?: number;
  showScore?: boolean;
}

function formatDate(ts: string) {
  const d = new Date(ts.replace(" ", "T") + "Z");
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

export default function NotificationCard({ notification, rank, showScore }: NotificationCardProps) {
  const { readIds, markRead } = useRead();
  const isRead = readIds.has(notification.ID);

  const color = TYPE_COLORS[notification.Type];
  const bg = TYPE_BG[notification.Type];

  function handleClick(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!isRead) {
      markRead(notification.ID);
      Log("frontend", "info", "component", "Notification marked read");
    }
  }

  return (
    <Card
      elevation={isRead ? 0 : 2}
      onClick={handleClick}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        border: "1px solid",
        borderColor: isRead ? "#e2e8f0" : color,
        borderLeft: `4px solid ${color}`,
        opacity: isRead ? 0.65 : 1,
        bgcolor: isRead ? "#fff" : bg + "55",
        transition: "all 0.15s",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>

          {rank && (
            <Box
              sx={{
                minWidth: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                mt: 0.3,
                flexShrink: 0,
              }}
            >
              {rank}
            </Box>
          )}

          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              <Chip
                label={notification.Type}
                size="small"
                sx={{ bgcolor: color, color: "#fff", fontWeight: 600, fontSize: 11 }}
              />
              {!isRead && (
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
              )}
              {showScore && notification.score !== undefined && (
                <Chip
                  label={`Score: ${notification.score.toFixed(6)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: 10 }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              fontWeight={isRead ? 400 : 600}
              noWrap
              sx={{ textTransform: "capitalize", mb: 0.25 }}
            >
              {notification.Message}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatDate(notification.Timestamp)}
            </Typography>
          </Box>

          <Tooltip title={isRead ? "Already read" : "Mark as read"}>
            <IconButton
              size="small"
              onClick={handleClick}
              sx={{ color: isRead ? "#94a3b8" : color, flexShrink: 0 }}
            >
              <MarkEmailReadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
