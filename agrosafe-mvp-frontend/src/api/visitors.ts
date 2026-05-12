import { api } from "../lib/api";

export type VisitorLevel = "trabalhador" | "prestador_servico" | "visitante";

export type Visitor = {
  id: number;
  nome: string;
  documento: string;
  empresa: string;
  nivel: VisitorLevel;
  foto_base64: string | null;
  criado_em: string | null;
};

export type LookupResponse =
  | { encontrado: true; visitante: Visitor }
  | { encontrado: false };

export type CreateVisitorPayload = {
  nome: string;
  documento: string;
  empresa: string;
  nivel: VisitorLevel;
  foto: string;
  motivo?: string;
  observacao?: string;
};

export type CreateVisitorResponse = {
  mensagem: string;
  visitante: Visitor;
  entrada_permitida: boolean;
};

export type VerifyPayload = {
  foto: string;
  motivo?: string;
  observacao?: string;
};

export type VerifyResponse =
  | {
      status: "match";
      entrada_permitida: true;
      score: number;
      threshold: number;
      mensagem: string;
    }
  | {
      status: "bloqueado";
      entrada_permitida: false;
      score: number;
      threshold: number;
      segundos_restantes: number;
      mensagem: string;
    }
  | {
      status: "sem_match";
      entrada_permitida: false;
      score: number;
      threshold: number;
      mensagem: string;
      visitante: Visitor;
      foto_capturada: string;
    };

export type ManualReviewPayload = {
  decisao: "aprovar" | "negar";
  motivo?: string;
  observacao?: string;
  score?: number;
};

export type ManualReviewResponse = {
  status: "aprovado" | "negado";
  entrada_permitida: boolean;
  mensagem: string;
};

export function stripDoc(value: string): string {
  return value.replace(/\D/g, "");
}

export async function lookupVisitor(documento: string): Promise<Visitor | null> {
  try {
    const { data } = await api.get<LookupResponse>("/visitantes/lookup/", {
      params: { documento },
    });
    return data.encontrado ? data.visitante : null;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "isAxiosError" in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

export async function createVisitor(
  payload: CreateVisitorPayload,
): Promise<CreateVisitorResponse> {
  const { data } = await api.post<CreateVisitorResponse>(
    "/visitantes/",
    payload,
  );
  return data;
}

export async function verifyVisitor(
  id: number,
  payload: VerifyPayload,
): Promise<VerifyResponse> {
  const { data } = await api.post<VerifyResponse>(
    `/visitantes/${id}/verificar/`,
    payload,
  );
  return data;
}

export async function manualReview(
  id: number,
  payload: ManualReviewPayload,
): Promise<ManualReviewResponse> {
  const { data } = await api.post<ManualReviewResponse>(
    `/visitantes/${id}/revisao-manual/`,
    payload,
  );
  return data;
}
