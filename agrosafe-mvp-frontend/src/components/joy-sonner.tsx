import { Toaster as SonnerToaster } from "sonner";

export function JoyToaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      toastOptions={{
        className: "joy-toast",
        style: {
          background: "var(--joy-palette-background-surface)",
          color: "var(--joy-palette-text-primary)",
          border: "1px solid var(--joy-palette-neutral-outlinedBorder)",
          borderRadius: "var(--joy-radius-md)",
          fontFamily: "var(--joy-fontFamily-body)",
          boxShadow: "var(--joy-shadow-md)",
          padding: "12px 16px",
        },
      }}
    />
  );
}
