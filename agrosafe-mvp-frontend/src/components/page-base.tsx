import * as React from "react";
import { Box } from "@mui/joy";

type PageBaseProps = {
  children: React.ReactNode;
};

export function PageBase({ children }: PageBaseProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        bgcolor: "neutral.100",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: 2,
          bgcolor: "background.surface",
          borderLeft: "1px solid",
          borderRight: "1px solid",
          borderColor: "neutral.300",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
