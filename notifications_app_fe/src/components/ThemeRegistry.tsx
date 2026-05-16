"use client";
import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: { main: "#6366f1" },
    secondary: { main: "#f59e0b" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  typography: { fontFamily: "'Inter', 'Segoe UI', sans-serif" },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
