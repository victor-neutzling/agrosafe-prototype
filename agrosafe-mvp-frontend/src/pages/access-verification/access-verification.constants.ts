import type {
  AccessControlForm,
  RegisterVisitorForm,
} from "./access-verification.schema";

export const ACCESS_CONTROL_FORM_DEFAULT_VALUES: AccessControlForm = {
  document: "",
  visitationReason: "",
  observations: "",
};

export const REGISTER_VISITOR_FORM_DEFAULT_VALUES: RegisterVisitorForm = {
  name: "",
  document: "",
  company: "",
  accessLevel: { label: "", value: "" },
};
