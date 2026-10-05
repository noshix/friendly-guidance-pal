import { ChevronRight } from "lucide-react";

import { PublicProductCard } from "@/components/PublicProductCard";
import { apiPageToUiPage, type PublicProductPage } from "@/lib/api/public-catalog";

interface PublicTaxonomyProductResultsProps {
  page: PublicProductPage | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

function paginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const candidates = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = [...candidates]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });

  return result;
}

export function PublicTaxonomyProductResults({
  page,
  isPending,
  isError,
  onRetry,
  onPageChange,
}: PublicTaxonomyProductResultsProps) {
  if (isPending) {
    return (
      <div className="store-taxonomy-grid" aria-label="Carregando produtos">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 animate-pulse"
          >
            <div className="w-full aspect-square mb-6 bg-[#F4F5F6]" />
            <div className="h-3 w-1/3 bg-[#F4F5F6] mb-3" />
            <div className="h-4 w-full bg-[#F4F5F6] mb-2" />
            <div className="h-4 w-2/3 bg-[#F4F5F6]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight mb-3">
          Não foi possível carregar os produtos
        </h2>
        <p className="text-[#252A2E]/60 mb-6">Tente novamente em alguns instantes.</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-[#174F8C] text-white px-8 py-3 rounded-[2px] font-bold uppercase text-[12px] hover:bg-[#123E70] transition"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const products = page?.items ?? [];
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[2px] py-16 px-6 text-center shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight mb-3">
          Nenhum produto encontrado
        </h2>
        <p className="text-[#252A2E]/60">Não há produtos públicos para os filtros informados.</p>
      </div>
    );
  }

  const currentPage = apiPageToUiPage(page?.page ?? 0);
  const totalPages = page?.totalPages ?? 0;

  return (
    <>
      <div className="store-taxonomy-grid">
        {products.map((product) => (
          <PublicProductCard key={product.erpId} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-16 flex justify-center">
          <nav className="flex items-center gap-1" aria-label="Paginação de produtos">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E]/40 hover:bg-[#F4F5F6] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            {paginationItems(currentPage, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-[#252A2E]/30 font-bold">
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  onClick={() => onPageChange(item)}
                  className={`w-10 h-10 rounded-[2px] text-[12px] font-bold transition ${item === currentPage ? "bg-[#174F8C] text-white" : "border border-[#E5E7EB] text-[#252A2E]/60 hover:bg-[#F4F5F6]"}`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-[2px] text-[12px] font-bold uppercase tracking-wider text-[#252A2E] hover:bg-[#F4F5F6] transition flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima <ChevronRight size={14} />
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
