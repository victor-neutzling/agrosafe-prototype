import { Box, Typography } from "@mui/joy";
import { useState } from "react";

export function ZoomableImage({ title, src }: { title: string; src?: string }) {
  const [transformOrigin, setTransformOrigin] = useState("center");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ mb: 1, fontWeight: 500 }}>{title}</Typography>

      <Box
        onMouseMove={handleMouseMove}
        sx={{
          bgcolor: "neutral.900",
          borderRadius: "12px",
          overflow: "hidden",
          width: "100%",
          maxHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "zoom-in",
        }}
      >
        {src && (
          <img
            src={src}
            alt={title}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
              transition: "transform 0.2s ease",
              transformOrigin,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.transformOrigin = "center";
            }}
          />
        )}
      </Box>
    </Box>
  );
}
