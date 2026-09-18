import { ThemeProvider } from "next-themes";
import ReduxProvider from "./redux-provider";
import QueryProvider from "./query-provider";
import AuthRehydrator from "./auth-rehydrator";
import ToastProvider from "./toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider>
        <QueryProvider>
          <AuthRehydrator>
            <TooltipProvider>
              <ToastProvider>{children}</ToastProvider>
            </TooltipProvider>
          </AuthRehydrator>
        </QueryProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}
