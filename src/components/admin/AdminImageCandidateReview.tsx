import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  ExternalLink,
  ImageOff,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminImageCandidateConfidenceLabel,
  adminImageCandidateErrorMessage,
  adminImageCandidateMatchLabel,
  adminImageCandidatePreviewSources,
} from "@/lib/admin-image-candidates-flow";
import {
  adminImageCandidatesQueryOptions,
  expireAdminImageCandidatesSession,
} from "@/lib/admin-image-candidates-query";
import {
  isAdminImageCandidatesUnauthorizedError,
  type AdminImageCandidate,
  type AdminImageCandidateConfidence,
  type AdminImageCandidateProductContext,
} from "@/lib/api/admin-image-candidates";

const CANDIDATE_LIMIT = 6;

interface AdminImageCandidateReviewProps {
  erpId: string;
  productName: string;
}

export function AdminImageCandidateReview({ erpId, productName }: AdminImageCandidateReviewProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const candidatesQuery = useQuery(adminImageCandidatesQueryOptions(erpId, CANDIDATE_LIMIT));
  const expiredError = isAdminImageCandidatesUnauthorizedError(candidatesQuery.error)
    ? candidatesQuery.error
    : null;

  useEffect(() => {
    if (expiredError) {
      void expireAdminImageCandidatesSession(expiredError, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [expiredError, navigate, queryClient]);

  const search = () => {
    if (candidatesQuery.isFetching) return;
    setSelectedCandidateId(null);
    setOpen(true);
    void candidatesQuery.refetch();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedCandidateId(null);
      window.requestAnimationFrame(() => searchButtonRef.current?.focus());
    }
  };

  return (
    <>
      <button
        ref={searchButtonRef}
        type="button"
        onClick={search}
        disabled={candidatesQuery.isFetching}
        aria-busy={candidatesQuery.isFetching}
        className="inline-flex items-center justify-center gap-2 border border-[#174F8C] bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#174F8C] transition hover:bg-[#174F8C]/5 disabled:cursor-wait disabled:opacity-50"
      >
        {candidatesQuery.isFetching ? (
          <Loader2 className="animate-spin" size={15} />
        ) : (
          <Search size={15} />
        )}
        {candidatesQuery.isFetching ? "Buscando imagens..." : "Buscar imagens"}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            searchButtonRef.current?.focus();
          }}
          className="max-h-[92vh] w-[calc(100%-2rem)] overflow-y-auto border-[#E5E7EB] bg-white sm:max-w-6xl"
        >
          <DialogHeader className="pr-8">
            <DialogTitle className="text-left text-[#252A2E]">Candidatos de imagem</DialogTitle>
            <DialogDescription className="text-left">
              Resultados externos para conferência manual. Nenhuma imagem será salva ou publicada
              nesta etapa.
            </DialogDescription>
          </DialogHeader>

          <div aria-live="polite" className="space-y-5">
            {candidatesQuery.data?.product && (
              <ProductSearchContext product={candidatesQuery.data.product} />
            )}

            <div className="flex flex-col gap-3 border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#174F8C]" size={18} />
                <p className="text-[11px] font-medium leading-relaxed text-[#252A2E]/65">
                  Confirme visualmente o produto antes de usar a imagem. A seleção abaixo fica
                  somente nesta janela e não altera o catálogo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void candidatesQuery.refetch()}
                disabled={candidatesQuery.isFetching}
                className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#174F8C] px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50"
              >
                {candidatesQuery.isFetching && <Loader2 className="animate-spin" size={13} />}
                Buscar novamente
              </button>
            </div>

            {expiredError ? (
              <CandidateState message="Sessão expirada. Redirecionando para o login..." loading />
            ) : candidatesQuery.isFetching ? (
              <CandidateState message="Consultando fontes externas de imagens..." loading />
            ) : candidatesQuery.isError ? (
              <CandidateState
                message={adminImageCandidateErrorMessage(candidatesQuery.error)}
                error
              />
            ) : candidatesQuery.data?.candidates.length === 0 ? (
              <CandidateState message="Nenhuma imagem candidata foi encontrada para este produto.">
                <p className="max-w-lg text-[10px] font-medium text-[#252A2E]/45">
                  Confira fabricante e referência no ERP ou tente novamente mais tarde.
                </p>
              </CandidateState>
            ) : candidatesQuery.data ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {candidatesQuery.data.candidates.map((candidate) => (
                  <AdminImageCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    productName={productName}
                    selected={candidate.id === selectedCandidateId}
                    onSelect={() => setSelectedCandidateId(candidate.id)}
                  />
                ))}
              </div>
            ) : null}

            {selectedCandidateId && (
              <div role="status" className="border border-[#2E8B57]/30 bg-[#2E8B57]/10 p-4">
                <p className="flex items-center gap-2 text-[11px] font-bold text-[#2E8B57]">
                  <Check size={16} /> Selecionado — a importação para o catálogo será habilitada na
                  próxima etapa.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProductSearchContext({ product }: { product: AdminImageCandidateProductContext }) {
  const fields = [
    ["Fabricante", product.manufacturer],
    ["Referência", product.reference],
    ["Part number", product.partNumber],
    ["EAN", product.ean],
  ].filter((field): field is [string, string] => Boolean(field[1]));

  return (
    <section className="border border-[#174F8C]/15 bg-[#174F8C]/5 p-4">
      <div className="mb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#174F8C]/65">
          Contexto usado na busca · ERP ID {product.erpId}
        </span>
        <p className="mt-1 break-words text-[12px] font-bold text-[#252A2E]">
          {product.erpDescription}
        </p>
      </div>
      {fields.length > 0 && (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {fields.map(([label, value]) => (
            <div key={label} className="min-w-0 bg-white/80 p-3">
              <dt className="text-[8px] font-black uppercase tracking-widest text-[#252A2E]/40">
                {label}
              </dt>
              <dd className="mt-1 break-words text-[10px] font-bold text-[#252A2E]/70">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function AdminImageCandidateCard({
  candidate,
  productName,
  selected,
  onSelect,
}: {
  candidate: AdminImageCandidate;
  productName: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const sources = adminImageCandidatePreviewSources(candidate);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setImageUnavailable(false);
  }, [candidate.id]);

  const handleImageError = () => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((current) => current + 1);
    } else {
      setImageUnavailable(true);
    }
  };

  return (
    <article
      className={`flex min-w-0 flex-col overflow-hidden border bg-[#F9FAFB] transition ${
        selected
          ? "border-[#2E8B57] ring-2 ring-[#2E8B57]/20"
          : "border-[#E5E7EB] hover:border-[#174F8C]/45"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {!imageUnavailable && sources[sourceIndex] ? (
          <img
            src={sources[sourceIndex]}
            alt={candidate.title || `Imagem candidata para ${productName}`}
            width={640}
            height={480}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-[#252A2E]/35">
            <ImageOff size={28} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Imagem externa indisponível
            </span>
          </div>
        )}
        <ConfidenceBadge confidence={candidate.confidence} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-w-0 space-y-2">
          <h4 className="line-clamp-3 min-h-[48px] break-words text-[12px] font-black leading-4 text-[#252A2E]">
            {candidate.title || "Candidato sem título"}
          </h4>
          <p className="break-all text-[9px] font-bold uppercase tracking-wider text-[#252A2E]/40">
            {candidate.sourceDomain || "Origem não informada"}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="border border-[#174F8C]/20 bg-[#174F8C]/5 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#174F8C]">
              {adminImageCandidateMatchLabel(candidate.matchedBy)}
            </span>
            {candidate.width && candidate.height && (
              <span className="border border-[#E5E7EB] bg-white px-2 py-1 text-[8px] font-bold text-[#252A2E]/50">
                {candidate.width} × {candidate.height}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={`inline-flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest ${
              selected ? "bg-[#2E8B57] text-white" : "bg-[#174F8C] text-white hover:bg-[#123E70]"
            }`}
          >
            {selected && <Check size={13} />}
            {selected ? "Candidato selecionado" : "Selecionar candidato"}
          </button>
          {candidate.sourcePageUrl && (
            <a
              href={candidate.sourcePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] bg-white px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#252A2E]/65"
            >
              Ver fonte <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ConfidenceBadge({ confidence }: { confidence: AdminImageCandidateConfidence }) {
  const className = {
    HIGH: "bg-[#2E8B57] text-white",
    MEDIUM: "bg-[#F4C430] text-[#252A2E]",
    LOW: "bg-[#252A2E]/70 text-white",
  }[confidence];
  return (
    <span
      className={`absolute left-3 top-3 px-2 py-1 text-[8px] font-black uppercase tracking-widest shadow ${className}`}
    >
      {adminImageCandidateConfidenceLabel(confidence)}
    </span>
  );
}

function CandidateState({
  message,
  loading = false,
  error = false,
  children,
}: {
  message: string;
  loading?: boolean;
  error?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className="flex min-h-56 flex-col items-center justify-center gap-3 border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center"
    >
      {loading ? (
        <Loader2 className="animate-spin text-[#174F8C]" size={25} />
      ) : error ? (
        <AlertCircle className="text-[#D9272E]" size={25} />
      ) : (
        <ImageOff className="text-[#252A2E]/30" size={25} />
      )}
      <p className="text-[12px] font-bold text-[#252A2E]/60">{message}</p>
      {children}
    </div>
  );
}
