import { createBrowserRouter } from "react-router-dom";
import { SubmitDmpId } from "./pages/SubmitDmpId";

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <SubmitDmpId/>,
  },
]);
