import { Suspense } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PortalSidebar } from "./portal-sidebar";
import { GeoportalHeader } from "@/components/layout/geoportal-header";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
          {/* Sidebar */}
          <PortalSidebar />

          {/* Contenido principal */}
          <div className="flex w-full flex-1 flex-col min-w-0 h-svh overflow-hidden p-2 md:pl-0 gap-4">
            {/* Header */}
            <div className="w-full shrink-0">
              <Suspense fallback={<div className="h-16 w-full" />}>
                <GeoportalHeader
                  variant="user-actions"
                  startAction={
                    <SidebarTrigger className="md:hidden text-muted-foreground hover:text-foreground" />
                  }
                />
              </Suspense>
            </div>

            {/* Main content wrapper */}
            <main className="flex-1 overflow-y-auto w-full">
              <div className="w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
