import { RouterProvider } from "react-router";
import router from "./router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { theme } from "./theme";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CssVarsProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </CssVarsProvider>
    </QueryClientProvider>
  );
}
