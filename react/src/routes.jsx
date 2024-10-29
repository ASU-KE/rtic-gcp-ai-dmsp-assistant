import { createBrowserRouter } from "react-router-dom";
import { Home } from './pages/Home';
// import { DmpId } from './pages/DmpId';
// import { DmpText } from './pages/DmpText';

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  // {
  //   path: "/dmp-id",
  //   element: <DmpId />,
  // },
]);
