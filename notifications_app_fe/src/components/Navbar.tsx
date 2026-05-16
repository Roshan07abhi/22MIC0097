"use client";
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  unreadCount?: number;
}

export default function Navbar({ unreadCount = 0 }: NavbarProps) {
  const pathname = usePathname();

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#0f172a", borderBottom: "1px solid #1e293b" }}>
      <Toolbar>
        <NotificationsIcon sx={{ color: "#6366f1", mr: 1 }} />
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ flexGrow: 1, color: "#f8fafc" }}
        >
          Campus<span style={{ color: "#6366f1" }}>Notify</span>
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            component={Link}
            href="/"
            startIcon={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon />
              </Badge>
            }
            sx={{
              color: pathname === "/" ? "#fff" : "#94a3b8",
              bgcolor: pathname === "/" ? "#6366f1" : "transparent",
              borderRadius: 2,
              "&:hover": {
                bgcolor: pathname === "/" ? "#4f46e5" : "#1e293b",
              },
            }}
          >
            All
          </Button>

          <Button
            component={Link}
            href="/priority"
            startIcon={<StarIcon />}
            sx={{
              color: pathname === "/priority" ? "#fff" : "#94a3b8",
              bgcolor: pathname === "/priority" ? "#f59e0b" : "transparent",
              borderRadius: 2,
              "&:hover": {
                bgcolor: pathname === "/priority" ? "#d97706" : "#1e293b",
              },
            }}
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
