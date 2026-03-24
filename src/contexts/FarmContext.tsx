import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEMO_SAFRAS, DEMO_TALHOES, Safra, Talhao } from "@/lib/demo-data";

interface FarmContextType {
  selectedSafraId: number | null;
  setSelectedSafraId: (id: number | null) => void;
  selectedTalhaoId: number | null;
  setSelectedTalhaoId: (id: number | null) => void;
  safras: Safra[];
  talhoes: Talhao[];
  isLoading: boolean;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [selectedSafraId, setSelectedSafraId] = useState<number | null>(4); // Default to Safra 25/26 (ID 4)
  const [selectedTalhaoId, setSelectedTalhaoId] = useState<number | null>(null);

  // In a real app we would use APIs. For now, we mock the delay with useQuery but use DEMO constants
  const { data: safras = DEMO_SAFRAS, isLoading: loadingSafras } = useQuery({
    queryKey: ["/safras-context"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return [...DEMO_SAFRAS];
    }
  });

  const { data: talhoes = DEMO_TALHOES, isLoading: loadingTalhoes } = useQuery({
    queryKey: ["/talhoes-context"],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return [...DEMO_TALHOES];
    }
  });

  return (
    <FarmContext.Provider value={{
      selectedSafraId,
      setSelectedSafraId,
      selectedTalhaoId,
      setSelectedTalhaoId,
      safras,
      talhoes,
      isLoading: loadingSafras || loadingTalhoes,
    }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
}
