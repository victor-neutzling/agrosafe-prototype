import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVisitor,
  lookupVisitor,
  manualReview,
  verifyVisitor,
  type CreateVisitorPayload,
  type CreateVisitorResponse,
  type ManualReviewPayload,
  type ManualReviewResponse,
  type VerifyPayload,
  type VerifyResponse,
  type Visitor,
} from "../api/visitors";

export const visitorKeys = {
  all: ["visitors"] as const,
  byDocument: (documento: string) =>
    [...visitorKeys.all, "byDocument", documento] as const,
};

export function useVisitorLookup(documento: string, enabled = true) {
  return useQuery<Visitor | null>({
    queryKey: visitorKeys.byDocument(documento),
    queryFn: () => lookupVisitor(documento),
    enabled: enabled && documento.length >= 11,
    staleTime: 30_000,
  });
}

export function useCreateVisitor() {
  const qc = useQueryClient();
  return useMutation<CreateVisitorResponse, unknown, CreateVisitorPayload>({
    mutationFn: createVisitor,
    onSuccess: (data) => {
      qc.setQueryData(
        visitorKeys.byDocument(data.visitante.documento),
        data.visitante,
      );
    },
  });
}

export function useVerifyVisitor(id: number | null) {
  return useMutation<VerifyResponse, unknown, VerifyPayload>({
    mutationFn: (payload) => {
      if (id === null) {
        return Promise.reject(new Error("Visitante não selecionado."));
      }
      return verifyVisitor(id, payload);
    },
  });
}

export function useManualReview(id: number | null) {
  return useMutation<ManualReviewResponse, unknown, ManualReviewPayload>({
    mutationFn: (payload) => {
      if (id === null) {
        return Promise.reject(new Error("Visitante não selecionado."));
      }
      return manualReview(id, payload);
    },
  });
}
