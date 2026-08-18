import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/marcas")({
  component: BrandsLayout,
});

function BrandsLayout() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#252A2E]">
      <Header activePage="Marcas" />
      <Outlet />
      <Footer />
    </div>
  );
}
