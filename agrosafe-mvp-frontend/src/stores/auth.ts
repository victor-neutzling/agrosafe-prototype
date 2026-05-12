import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Granja } from "../api/auth";

type AuthState = {
  granja: Granja | null;
  setGranja: (granja: Granja | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      granja: null,
      setGranja: (granja) => set({ granja }),
      clear: () => set({ granja: null }),
    }),
    { name: "agrosafe-auth" },
  ),
);
