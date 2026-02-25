"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { PWAProvider } from "./providers/PWAProvider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <PWAProvider>
                {children}
            </PWAProvider>
        </QueryClientProvider>
    );
}
