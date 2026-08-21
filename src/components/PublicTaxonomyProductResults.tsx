import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { ImageWithFallback } from "@/components/ImageWithFallback";
import {
  apiPageToUiPage,
  formatAvailability,
  formatPublicPrice,
  isProductInStock,
  type PublicProductPage,
} from "@/lib/api/public-catalog";

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
      <div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        aria-label="Carregando produtos"
      >
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
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const inStock = isProductInStock(product.availability);
          return (
            <Link
              key={product.erpId}
              to="/produtos/$id"
              params={{ id: product.erpId }}
              className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative"
            >
              <div className="relative w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50">
                <ImageWithFallback
                  src=""
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">
                  {product.manufacturer}
                </div>
                <h3 className="font-bold text-[14px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase h-[54px] line-clamp-3">
                  {product.name}
                </h3>
                <div className="text-[10px] text-[#252A2E]/40 mb-4 font-medium italic">
                  Ref: {product.reference ?? "N/A"}
                </div>
                <div className="mt-auto pt-4 border-t border-[#F4F5F6]">
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold mb-4 uppercase tracking-tighter ${inStock ? "text-[#2E8B57]" : "text-[#252A2E]/40"}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-[#2E8B57] animate-pulse" : "bg-[#E5E7EB]"}`}
                    />
                    {formatAvailability(product.availability)}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="min-h-[32px] flex flex-col justify-end">
                      <div
                        className={
                          product.price === null
                            ? "text-[14px] font-black text-[#174F8C] uppercase tracking-[0.1em]"
                            : "text-lg font-black text-[#252A2E]"
                        }
                      >
                        {formatPublicPrice(product.price)}
                      </div>
                    </div>
                    <span className="w-full bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Ver produto
                      </span>
                      <ChevronRight
                        size={14}
                        className="group-hover/btn:translate-x-1 transition"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
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
