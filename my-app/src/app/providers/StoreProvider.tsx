"use client";

import { createContext, type ReactNode, useContext, useRef } from "react";
import { RootStore } from "@/stores/rootStore";

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<RootStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return store;
}
