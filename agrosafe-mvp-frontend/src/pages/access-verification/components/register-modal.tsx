import {
  Modal,
  ModalDialog,
  Box,
  Button,
  FormLabel,
  Input,
  Typography,
  Autocomplete,
  Tooltip,
  FormHelperText,
  Alert,
} from "@mui/joy";
import FormGroup from "@mui/material/FormGroup";
import InfoIcon from "@mui/icons-material/InfoOutlineRounded";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import {
  type RegisterVisitorForm,
  RegisterVisitorFormSchema,
} from "../access-verification.schema";
import { REGISTER_VISITOR_FORM_DEFAULT_VALUES } from "../access-verification.constants";
import { useCreateVisitor } from "../../../hooks/use-visitors";
import {
  stripDoc,
  type Visitor,
  type VisitorLevel,
} from "../../../api/visitors";
import { extractApiError } from "../../../lib/api";

const LEVEL_OPTIONS: { label: string; value: string }[] = [
  { label: "1 - Funcionário", value: "1" },
  { label: "2 - Prestador de serviço", value: "2" },
  { label: "3 - Visitante", value: "3" },
];

const LEVEL_VALUE_TO_BACKEND: Record<string, VisitorLevel> = {
  "1": "trabalhador",
  "2": "prestador_servico",
  "3": "visitante",
};

interface Props {
  open: boolean;
  onClose: () => void;
  defaultDocument?: string;
  capturedPhoto?: string;
  motivo?: string;
  observacao?: string;
  onSuccess?: (visitor: Visitor) => void;
}

export function RegisterModal({
  open,
  onClose,
  defaultDocument,
  capturedPhoto,
  motivo,
  observacao,
  onSuccess,
}: Props) {
  const form = useForm<RegisterVisitorForm>({
    resolver: zodResolver(RegisterVisitorFormSchema),
    defaultValues: REGISTER_VISITOR_FORM_DEFAULT_VALUES,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const createMutation = useCreateVisitor();

  useEffect(() => {
    if (open) {
      reset({
        ...REGISTER_VISITOR_FORM_DEFAULT_VALUES,
        document: defaultDocument ?? "",
      });
      createMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDocument]);

  const photoMissing = !capturedPhoto;

  const onSubmit = (data: RegisterVisitorForm) => {
    if (!capturedPhoto) return;

    const nivel = LEVEL_VALUE_TO_BACKEND[data.accessLevel.value];
    if (!nivel) return;

    createMutation.mutate(
      {
        nome: data.name,
        documento: stripDoc(data.document),
        empresa: data.company,
        nivel,
        foto: capturedPhoto,
        motivo,
        observacao,
      },
      {
        onSuccess: (response) => {
          onSuccess?.(response.visitante);
        },
      },
    );
  };

  const errorMessage = createMutation.isError
    ? extractApiError(createMutation.error, "Falha ao cadastrar visitante.")
    : null;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          width: 600,
          maxWidth: "90vw",
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
              py: 1,
            }}
          >
            <Typography fontWeight="bold">Cadastro do visitante</Typography>
          </Box>

          <Box sx={{ p: 2, display: "grid", gap: 2 }}>
            {photoMissing && (
              <Alert color="warning" variant="soft">
                Tire uma foto na câmera antes de cadastrar.
              </Alert>
            )}
            {errorMessage && (
              <Alert color="danger" variant="soft">
                {errorMessage}
              </Alert>
            )}

            <FormGroup>
              <FormLabel>Nome do visitante</FormLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Insira o nome do visitante" />
                )}
              />
              {errors.name && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.name.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>CPF</FormLabel>
              <Controller
                name="document"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="000.000.000-00" />
                )}
              />
              {errors.document && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.document.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>Empresa</FormLabel>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="insira o nome da empresa" />
                )}
              />
              {errors.company && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  {errors.company.message}
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <FormLabel>Nível de acesso</FormLabel>
                <Tooltip
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 1 - Colaboradores
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso para colaboradores da rotina diária da granja.
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 2 - Prestadores de serviço
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso para profissionais externos (técnicos,
                        veterinários, manutenção, entregas).
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "common.white",
                        }}
                      >
                        Nível 3 - Visitantes
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "common.white" }}
                      >
                        Acesso pontual para inspeções e auditorias, incluindo
                        fiscais do governo, cooperativas ou clientes.
                      </Typography>
                    </Box>
                  }
                >
                  <InfoIcon sx={{ width: 18 }} />
                </Tooltip>
              </Box>

              <Controller
                name="accessLevel"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    placeholder="selecione o nível de acesso"
                    options={LEVEL_OPTIONS}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />

              {errors.accessLevel && (
                <FormHelperText sx={{ color: "#FF0000" }}>
                  Campo obrigatório
                </FormHelperText>
              )}
            </FormGroup>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Button
                sx={{ flex: 1 }}
                onClick={handleSubmit(onSubmit)}
                loading={createMutation.isPending}
                disabled={photoMissing}
              >
                Salvar e liberar entrada
              </Button>
              <Button sx={{ flex: 1 }} variant="soft" onClick={onClose}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
