import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiErrorBody = { erro?: string };

export function extractApiError(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.erro ?? error.message ?? fallback;
  }
  return fallback;
}
