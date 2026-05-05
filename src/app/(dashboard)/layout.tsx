import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 transition-all">
        <Header />
        <main className="flex-1 p-4 md:p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
