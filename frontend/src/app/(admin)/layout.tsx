import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RequireAuth } from "@/components/require-auth";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth>
      <div className="h-screen w-screen overflow-hidden bg-sidebar text-foreground font-sans font-medium">
        <SidebarProvider className="h-full">
          <AppSidebar />
          <div className="flex-1 py-3 pr-3 pl-4 h-full flex flex-col">
            <main className="flex-1 relative flex flex-row gap-3 min-h-0">
              <SidebarTrigger className="absolute top-4 left-4 z-10 shrink-0 text-muted-foreground hover:bg-muted/50 hidden" />
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
    </RequireAuth>
  );
}
