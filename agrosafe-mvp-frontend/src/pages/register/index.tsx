import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Link from "@mui/joy/Link";
import Alert from "@mui/joy/Alert";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useRegister } from "../../hooks/use-auth";
import { stripCnpj } from "../../api/auth";
import { extractApiError } from "../../lib/api";

export default function Cadastro() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setValidationError("As senhas não coincidem.");
      return;
    }

    const cnpj = stripCnpj(String(formData.get("cnpj") ?? ""));
    const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
    const cidade = String(formData.get("cidade") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telefone = String(formData.get("telefone") ?? "").trim();

    registerMutation.mutate(
      {
        nome: razaoSocial,
        CNPJ: cnpj,
        regiao: cidade || undefined,
        telefone: telefone || undefined,
        email_corporativo: email || undefined,
        senha: password,
      },
      {
        onSuccess: () => {
          navigate("/");
        },
      },
    );
  };

  const errorMessage =
    validationError ??
    (registerMutation.isError
      ? extractApiError(registerMutation.error, "Não foi possível cadastrar.")
      : null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.level1",
        p: 2,
      }}
    >
      <Sheet
        variant="outlined"
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: "md",
          boxShadow: "lg",
        }}
      >
        <Box sx={{ mb: 1 }}>
          <Typography level="h3" component="h1">
            Cadastro de Granja
          </Typography>
          <Typography level="body-sm">
            Configure o perfil administrativo da sua unidade.
          </Typography>
        </Box>

        {errorMessage && (
          <Alert color="danger" variant="soft">
            {errorMessage}
          </Alert>
        )}

        {registerMutation.isSuccess && (
          <Alert color="success" variant="soft">
            Cadastro realizado com sucesso! Redirecionando...
          </Alert>
        )}

        <Divider>Dados da Empresa</Divider>

        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          <Grid xs={12}>
            <FormControl required>
              <FormLabel>Razão social</FormLabel>
              <Input name="razaoSocial" placeholder="Nome jurídico da granja" />
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl required>
              <FormLabel>CNPJ</FormLabel>
              <Input name="cnpj" placeholder="00.000.000/0000-00" />
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl>
              <FormLabel>Telefone</FormLabel>
              <Input name="telefone" placeholder="(11) 99999-9999" />
            </FormControl>
          </Grid>

          <Grid xs={12} md={8}>
            <FormControl>
              <FormLabel>Localização (Endereço)</FormLabel>
              <Input name="endereco" placeholder="Rua, KM ou Logradouro" />
            </FormControl>
          </Grid>

          <Grid xs={12} md={4}>
            <FormControl required>
              <FormLabel>Cidade/UF</FormLabel>
              <Input name="cidade" placeholder="Curitiba - PR" />
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 2 }}>Acesso do Administrador</Divider>

        <Stack gap={2}>
          <FormControl required>
            <FormLabel>E-mail administrativo</FormLabel>
            <Input name="email" type="email" placeholder="admin@granja.com" />
          </FormControl>

          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl required>
                <FormLabel>Senha</FormLabel>
                <Input name="password" type="password" placeholder="••••••••" />
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl required>
                <FormLabel>Confirmar senha</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </FormControl>
            </Grid>
          </Grid>
        </Stack>

        <Button
          type="submit"
          size="lg"
          sx={{ mt: 3 }}
          loading={registerMutation.isPending}
        >
          Finalizar cadastro
        </Button>

        <Typography level="body-sm" sx={{ alignSelf: "center", mt: 1 }}>
          Já possui cadastro? <Link href="/">Fazer login</Link>
        </Typography>
      </Sheet>
    </Box>
  );
}
