"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface ReadContextType {
  readIds: Set<string>;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
}

const ReadContext = createContext<ReadContextType>({
  readIds: new Set(),
  markRead: () => {},
  markAllRead: () => {},
});

export function ReadProvider({ children }: { children: React.ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const markAllRead = useCallback((ids: string[]) => {
    setReadIds((prev) => new Set([...prev, ...ids]));
  }, []);

  return (
    <ReadContext.Provider value={{ readIds, markRead, markAllRead }}>
      {children}
    </ReadContext.Provider>
  );
}

export const useRead = () => useContext(ReadContext);
