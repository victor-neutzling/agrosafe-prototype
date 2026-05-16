import { Modal, ModalDialog, Box, Button, Typography, Alert } from "@mui/joy";
import { ZoomableImage } from "./zoomable-image";
import { useManualReview } from "../../../hooks/use-visitors";
import { extractApiError } from "../../../lib/api";
import { toast } from "sonner";

interface ManualVerificationModalProps {
  open: boolean;
  onClose: () => void;
  visitorId: number | null;
  referencePhoto?: string;
  capturedPhoto?: string;
  score?: number;
  motivo?: string;
  observacao?: string;
  onResolved?: (decision: "aprovar" | "negar", message: string) => void;
}

export function ManualVerificationModal({
  open,
  onClose,
  visitorId,
  referencePhoto,
  capturedPhoto,
  score,
  motivo,
  observacao,
  onResolved,
}: ManualVerificationModalProps) {
  const reviewMutation = useManualReview(visitorId);

  const submitDecision = (decisao: "aprovar" | "negar") => {
    if (visitorId === null) return;
    reviewMutation.mutate(
      { decisao, motivo, observacao, score },
      {
        onSuccess: (response) => {
          onResolved?.(decisao, response.mensagem);
          toast(decisao === "aprovar" ? "Acesso permitido" : "Acesso negado", {
            position: "top-right",
          });
        },
      },
    );
  };

  const errorMessage = reviewMutation.isError
    ? extractApiError(reviewMutation.error, "Falha ao registrar decisão.")
    : null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: 1000,
          maxWidth: "98vw",
          borderRadius: "md",
          p: 0,
        }}
      >
        <Box>
          <Box
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              px: 2,
              py: 1.5,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold">Verificação manual</Typography>
          </Box>

          {errorMessage && (
            <Box sx={{ px: 3, pt: 2 }}>
              <Alert color="danger" variant="soft">
                {errorMessage}
              </Alert>
            </Box>
          )}

          <Box
            sx={{
              p: 3,
              display: "flex",
              gap: 3,
            }}
          >
            <ZoomableImage title="Foto cadastrada" src={referencePhoto} />
            <ZoomableImage title="Foto capturada" src={capturedPhoto} />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              px: 3,
              pb: 2,
            }}
          >
            <Button
              color="danger"
              variant="outlined"
              onClick={() => submitDecision("negar")}
              loading={
                reviewMutation.isPending &&
                reviewMutation.variables?.decisao === "negar"
              }
              disabled={reviewMutation.isPending}
            >
              negar acesso
            </Button>

            <Button
              color="primary"
              onClick={() => submitDecision("aprovar")}
              loading={
                reviewMutation.isPending &&
                reviewMutation.variables?.decisao === "aprovar"
              }
              disabled={reviewMutation.isPending}
            >
              validar acesso
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
