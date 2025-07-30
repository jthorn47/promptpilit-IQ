import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProviders } from "./AppProviders";
import { AppRoutes } from "./AppRoutes";
import { AppToasts } from "./AppToasts";
import { AppAnalytics } from "./AppAnalytics";
import { createQueryClient } from "@/lib/queryClient";

// Create query client instance
const queryClient = createQueryClient();

/**
 * Main App component with clean separation of concerns
 * - Error boundary at the top level
 * - Query client for data fetching
 * - Router for navigation
 * - Providers for context
 * - Routes for page navigation
 * - Global UI components (toasts, analytics)
 */
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders>
          <AppAnalytics />
          <AppToasts />
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;