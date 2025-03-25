import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { SubmitDmpId } from "./pages/SubmitDmpId";
import { SubmitDmpText } from "./pages/SubmitDmpText";

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <SubmitDmpId />,
      },
      {
        path: "submit-text",
        element: <SubmitDmpText />,
      },
    ],
  },
]);
