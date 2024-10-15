import "bootstrap/dist/css/bootstrap.min.css";
// import "@asu/unity-bootstrap-theme/dist/css/unity-bootstrap-theme.bundle.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryAiAssistant } from "./QueryAiAssistant";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryAiAssistant />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
