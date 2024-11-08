import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { SubmitDmpId } from "./pages/SubmitDmpId";

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <SubmitDmpId />,
      },
    ],
  },
]);
