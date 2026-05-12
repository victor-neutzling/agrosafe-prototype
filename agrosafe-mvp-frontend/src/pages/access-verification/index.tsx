import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  FormHelperText,
  FormLabel,
  Input,
  Textarea,
  Typography,
  Snackbar,
  Alert,
  Chip,
} from "@mui/joy";
import FormGroup from "@mui/material/FormGroup";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageBase } from "../../components/page-base";
import { Navbar } from "../../components/navbar";
import { RegisterModal } from "./components/register-modal";
import { ManualVerificationModal } from "./components/manual-verification-modal";

import {
  type AccessControlForm,
  AccessControlFormSchema,
} from "./access-verification.schema";
import { ACCESS_CONTROL_FORM_DEFAULT_VALUES } from "./access-verification.constants";
import { CameraFeedPanel } from "./components/camera-feed-panel";
import { useTempImageStore } from "../../stores/use-temp-image-store";
import {
  useVerifyVisitor,
  useVisitorLookup,
} from "../../hooks/use-visitors";
import { stripDoc, type Visitor } from "../../api/visitors";
import { extractApiError } from "../../lib/api";

type ResultBanner =
  | { kind: "success"; message: string }
  | { kind: "danger"; message: string }
  | { kind: "warning"; message: string };

export default function AccessVerification() {
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openManualModal, setOpenManualModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [result, setResult] = useState<ResultBanner | null>(null);

  const { imageSrc, clearImageSrc } = useTempImageStore();
  const hasPhoto = imageSrc.length > 0;

  const form = useForm<AccessControlForm>({
    resolver: zodResolver(AccessControlFormSchema),
    defaultValues: ACCESS_CONTROL_FORM_DEFAULT_VALUES,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const watchedDocument = useWatch({ control, name: "document" }) ?? "";
  const normalizedDoc = useMemo(() => stripDoc(watchedDocument), [watchedDocument]);

  const lookupQuery = useVisitorLookup(normalizedDoc, normalizedDoc.length >= 11);
  const visitor: Visitor | null = lookupQuery.data ?? null;
  const visitorMissing =
    normalizedDoc.length >= 11 &&
    lookupQuery.isFetched &&
    !lookupQuery.isFetching &&
    !visitor;

  const verifyMutation = useVerifyVisitor(visitor?.id ?? null);

  useEffect(() => {
    setResult(null);
    verifyMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedDoc]);

  const resetVerification = () => {
    clearImageSrc();
    form.reset(ACCESS_CONTROL_FORM_DEFAULT_VALUES);
    verifyMutation.reset();
  };

  const onSubmit = (data: AccessControlForm) => {
    if (!hasPhoto) {
      setShowSnackbar(true);
      return;
    }
    if (!visitor) {
      // Visitor doesn't exist yet → open the register modal with the photo we have.
      setOpenRegisterModal(true);
      return;
    }

    setResult(null);
    verifyMutation.mutate(
      {
        foto: imageSrc,
        motivo: data.visitationReason,
        observacao: data.observations,
      },
      {
        onSuccess: (response) => {
          if (response.status === "match") {
            setResult({ kind: "success", message: response.mensagem });
            resetVerification();
          } else if (response.status === "bloqueado") {
            setResult({ kind: "warning", message: response.mensagem });
            resetVerification();
          } else {
            // sem_match → manual review; clear only after the gatekeeper resolves the modal
            setOpenManualModal(true);
          }
        },
        onError: (err) => {
          setResult({
            kind: "danger",
            message: extractApiError(err, "Falha ao verificar acesso."),
          });
          resetVerification();
        },
      },
    );
  };

  const handleRegisterSuccess = (newVisitor: Visitor) => {
    setOpenRegisterModal(false);
    setResult({
      kind: "success",
      message: `Visitante ${newVisitor.nome} cadastrado e entrada permitida.`,
    });
    resetVerification();
  };

  const lastVerifyResult = verifyMutation.data;
  const verifyScore =
    lastVerifyResult && "score" in lastVerifyResult
      ? lastVerifyResult.score
      : undefined;

  return (
    <PageBase>
      <Navbar title="registro" />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          px: 2,
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "50%",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.surface",
              border: "1px solid",
              borderColor: "neutral.300",
              borderRadius: "12px",
              boxShadow: "sm",
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
                Informações do visitante
              </Typography>
            </Box>

            <Box sx={{ p: 2, display: "grid", gap: 2 }}>
              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>CPF</FormLabel>
                <Controller
                  name="document"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="000.000.000-00"
                      variant="outlined"
                      sx={{ bgcolor: "background.surface" }}
                      endDecorator={
                        lookupQuery.isFetching ? (
                          <Chip size="sm" variant="soft">
                            buscando...
                          </Chip>
                        ) : visitor ? (
                          <Chip size="sm" color="success" variant="soft">
                            cadastrado
                          </Chip>
                        ) : visitorMissing ? (
                          <Chip size="sm" color="warning" variant="soft">
                            não cadastrado
                          </Chip>
                        ) : null
                      }
                    />
                  )}
                />
                {errors.document && (
                  <FormHelperText sx={{ color: "danger.500" }}>
                    {errors.document.message}
                  </FormHelperText>
                )}
                {visitor && (
                  <FormHelperText sx={{ color: "neutral.600" }}>
                    {visitor.nome} • {visitor.empresa} • nível {visitor.nivel}
                  </FormHelperText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>
                  Motivo da visita
                </FormLabel>
                <Controller
                  name="visitationReason"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="insira o motivo da visita" />
                  )}
                />
                {errors.visitationReason && (
                  <FormHelperText sx={{ color: "danger.500" }}>
                    {errors.visitationReason.message}
                  </FormHelperText>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel sx={{ color: "neutral.700" }}>Observações</FormLabel>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => <Textarea {...field} minRows={2} />}
                />
                <FormHelperText sx={{ color: "neutral.500" }}>
                  (Opcional)
                </FormHelperText>
              </FormGroup>
            </Box>
          </Box>

          {result && (
            <Alert color={result.kind} variant="soft">
              {result.message}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              sx={{ flex: 1 }}
              onClick={handleSubmit(onSubmit)}
              disabled={!hasPhoto || lookupQuery.isFetching}
              loading={verifyMutation.isPending}
              color="primary"
              variant="solid"
            >
              {visitor ? "Verificar Acesso" : "Cadastrar visitante"}
            </Button>

            {visitorMissing && (
              <Button
                sx={{ flex: 1 }}
                variant="soft"
                color="warning"
                disabled={!hasPhoto}
                onClick={() => setOpenRegisterModal(true)}
              >
                Cadastrar manualmente
              </Button>
            )}
          </Box>
        </Box>

        <CameraFeedPanel />
      </Box>

      <RegisterModal
        open={openRegisterModal}
        onClose={() => setOpenRegisterModal(false)}
        defaultDocument={normalizedDoc}
        capturedPhoto={imageSrc}
        observacao={form.getValues("observations") ?? ""}
        motivo={form.getValues("visitationReason") ?? ""}
        onSuccess={handleRegisterSuccess}
      />

      <ManualVerificationModal
        open={openManualModal}
        onClose={() => setOpenManualModal(false)}
        visitorId={visitor?.id ?? null}
        referencePhoto={visitor?.foto_base64 ?? undefined}
        capturedPhoto={imageSrc}
        score={verifyScore}
        motivo={form.getValues("visitationReason") ?? ""}
        observacao={form.getValues("observations") ?? ""}
        onResolved={(decision, message) => {
          setOpenManualModal(false);
          setResult({
            kind: decision === "aprovar" ? "success" : "danger",
            message,
          });
          resetVerification();
        }}
      />

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        color="warning"
        variant="soft"
      >
        Tire uma foto antes de verificar o acesso.
      </Snackbar>
    </PageBase>
  );
}
