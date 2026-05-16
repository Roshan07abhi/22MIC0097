import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import { ReadProvider } from "@/context/ReadContext";

export const metadata: Metadata = {
  title: "CampusNotify",
  description: "Campus Notifications Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f8fafc" }}>
        <ThemeRegistry>
          <ReadProvider>
            {children}
          </ReadProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
