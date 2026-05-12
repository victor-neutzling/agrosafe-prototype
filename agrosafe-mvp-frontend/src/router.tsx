import Login from "./pages/login";
import Register from "./pages/register";
import { createBrowserRouter } from "react-router";
import AccessVerification from "./pages/access-verification";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/cadastro",
    element: <Register />,
  },
  {
    path: "/access-verification",
    element: <AccessVerification />,
  },
]);

export default router;
