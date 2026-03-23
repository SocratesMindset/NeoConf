"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { RootStore } from "@/stores/rootStore";

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<RootStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = new RootStore();
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) {
      return;
    }

    void store.authStore.hydrate().catch((error: unknown) => {
      console.error("Failed to hydrate auth state", error);
    });
    void store.conferenceStore.loadState().catch((error: unknown) => {
      console.error("Failed to load app state", error);
    });
  }, []);

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
