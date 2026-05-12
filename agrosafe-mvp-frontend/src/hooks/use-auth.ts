import { useMutation } from "@tanstack/react-query";
import {
  login,
  logout,
  register,
  type LoginPayload,
  type LoginResponse,
  type LogoutResponse,
  type RegisterPayload,
  type RegisterResponse,
} from "../api/auth";
import { useAuthStore } from "../stores/auth";

export function useLogin() {
  const setGranja = useAuthStore((s) => s.setGranja);

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: login,
    onSuccess: (data) => {
      setGranja({ id: data.id, nome: data.nome });
    },
  });
}

export function useRegister() {
  return useMutation<RegisterResponse, unknown, RegisterPayload>({
    mutationFn: register,
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);

  return useMutation<LogoutResponse, unknown, void>({
    mutationFn: logout,
    onSuccess: () => clear(),
  });
}
