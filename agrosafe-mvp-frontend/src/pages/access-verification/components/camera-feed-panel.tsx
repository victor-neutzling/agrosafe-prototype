import { Box, Button, Typography } from "@mui/joy";
import { useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useTempImageStore } from "../../../stores/use-temp-image-store";

type CameraFeedPanelProps = {
  onCapture?: () => void;
};

export function CameraFeedPanel({ onCapture }: CameraFeedPanelProps) {
  const webcamRef = useRef<Webcam | null>(null);

  const { setImageSrc, imageSrc } = useTempImageStore();

  const capture = useCallback(() => {
    if (!webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    setImageSrc(screenshot);
    onCapture?.();
  }, [onCapture, setImageSrc]);

  const retake = () => {
    setImageSrc("");
  };

  return (
    <Box
      sx={{
        bgcolor: "background.surface",
        border: "1px solid",
        borderColor: "neutral.300",
        borderRadius: "12px",
        boxShadow: "sm",
        width: "50%",
      }}
    >
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "neutral.200",
          py: 1,
          px: 2,
          bgcolor: "primary.50",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Typography fontWeight="lg" sx={{ color: "primary.700" }}>
          Câmera
        </Typography>
      </Box>

      <Box
        sx={{
          m: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "neutral.50",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Captured"
            style={{ width: "100%", borderRadius: 8 }}
          />
        ) : (
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, pb: 2 }}>
        {!imageSrc ? (
          <Button
            sx={{
              width: 156,
              bgcolor: "primary.600",
              color: "#fff",
              "&:hover": {
                bgcolor: "primary.700",
              },
            }}
            onClick={capture}
          >
            tirar foto
          </Button>
        ) : (
          <Button onClick={retake}>tirar outra</Button>
        )}
      </Box>
    </Box>
  );
}
