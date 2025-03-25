import "bootstrap/dist/css/bootstrap.min.css";
import "@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { routers } from './routes'

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routers} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
