import { z } from "zod";

const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const AccessControlFormSchema = z.object({
  document: z.string("CPF é obrigatório").min(11, "CPF é obrigatório"),
  visitationReason: z
    .string("motivo da visita é obrigatório")
    .min(2, "motivo da visita é obrigatório"),
  observations: z.string().optional(),
});

export const RegisterVisitorFormSchema = z.object({
  document: z.string("CPF é obrigatório").min(11, "CPF é obrigatório"),

  name: z.string("Nome é obrigatório").min(2, "Nome é obrigatório"),
  company: z
    .string("Nome da empresa é obrigatório")
    .min(2, "Nome da empresa é obrigatório"),

  accessLevel: selectOptionSchema,
});

export type AccessControlForm = z.infer<typeof AccessControlFormSchema>;
export type RegisterVisitorForm = z.infer<typeof RegisterVisitorFormSchema>;
