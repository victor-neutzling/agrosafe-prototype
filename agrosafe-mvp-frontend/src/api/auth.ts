import { api } from "../lib/api";

export type LoginPayload = {
  CNPJ: string;
  senha: string;
};

export type RegisterPayload = {
  nome: string;
  CNPJ: string;
  regiao?: string;
  telefone?: string;
  email_corporativo?: string;
  senha: string;
};

export type Granja = {
  id: number;
  nome: string;
  CNPJ?: string;
};

export type LoginResponse = Granja & { mensagem: string };
export type RegisterResponse = Granja & { mensagem: string };
export type LogoutResponse = { mensagem: string };

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login/", payload);
  return data;
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/cadastrar/", payload);
  return data;
}

export async function logout(): Promise<LogoutResponse> {
  const { data } = await api.post<LogoutResponse>("/logout/");
  return data;
}

export function stripCnpj(value: string): string {
  return value.replace(/\D/g, "");
}
