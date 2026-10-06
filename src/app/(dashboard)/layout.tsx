import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <Header />

      <main className="min-h-screen pt-[84px] lg:ml-[250px]">
        <div className="min-h-[calc(100vh-84px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </>
  );
}
