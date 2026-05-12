import { create } from "zustand";

type TempImageStore = {
  imageSrc: string;
  setImageSrc: (newSrc: string) => void;
  clearImageSrc: () => void;
};

export const useTempImageStore = create<TempImageStore>((set) => ({
  imageSrc: "",
  setImageSrc: (newSrc) => set({ imageSrc: newSrc }),
  clearImageSrc: () => set({ imageSrc: "" }),
}));
