import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Loader2,
  Pause,
  RotateCcw,
  StopCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  adminImageEnrichmentCanCancel,
  adminImageEnrichmentCanPause,
  adminImageEnrichmentCanResume,
  adminImageEnrichmentItemLabel,
  adminImageEnrichmentJobLabel,
  adminImageEnrichmentPollingInterval,
  adminImageEnrichmentStatusesForFilter,
  describeAdminImageEnrichmentError,
  validateAdminImageEnrichmentReviewSelection,
  type AdminImageEnrichmentResultFilter,
} from "@/lib/admin-image-enrichment-flow";
import {
  adminImageEnrichmentItemsKey,
  adminImageEnrichmentJobKey,
  expireAdminImageEnrichmentSession,
  invalidateAdminImageEnrichment,
} from "@/lib/admin-image-enrichment-query";
import { invalidateAdminProductData } from "@/lib/admin-products-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  getAdminImageEnrichmentItems,
  getAdminImageEnrichmentJob,
  mutateAdminImageEnrichmentJob,
  reviewAdminImageEnrichmentItems,
  type AdminImageEnrichmentItem,
  type AdminImageEnrichmentItemStatus,
} from "@/lib/api/admin-image-enrichment";

export const Route = createFileRoute("/admin/image-enrichment/$jobId")({
  component: AdminImageEnrichmentJobPage,
});

const PAGE_SIZE = 20;

function AdminImageEnrichmentJobPage() {
  const { jobId: rawJobId } = Route.useParams();
  const jobId = Number(rawJobId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AdminImageEnrichmentResultFilter>("ALL");
  const [page, setPage] = useState(0);
  const [selectedReviewIds, setSelectedReviewIds] = useState<number[]>([]);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "approve" | "reject" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const invalidatedAutoImports = useRef<number | null>(null);
  const statuses = useMemo(() => adminImageEnrichmentStatusesForFilter(filter), [filter]);

  const jobQuery = useQuery({
    queryKey: adminImageEnrichmentJobKey(jobId),
    queryFn: () => getAdminImageEnrichmentJob(jobId),
    enabled: Number.isInteger(jobId) && jobId > 0,
    retry: false,
    refetchInterval: (query) => adminImageEnrichmentPollingInterval(query.state.data?.status),
  });
  const itemsQuery = useQuery({
    queryKey: adminImageEnrichmentItemsKey(jobId, statuses, page, PAGE_SIZE),
    queryFn: () => getAdminImageEnrichmentItems(jobId, statuses, page, PAGE_SIZE),
    enabled: Number.isInteger(jobId) && jobId > 0,
    retry: false,
    refetchInterval: () => adminImageEnrichmentPollingInterval(jobQuery.data?.status),
  });

  const actionMutation = useMutation({
    mutationFn: async (action: "pause" | "resume" | "cancel") =>
      mutateAdminImageEnrichmentJob(jobId, action, await getAdminCsrf()),
    onSuccess: async (job, action) => {
      setFeedback(
        action === "pause"
          ? "Pausa solicitada. Um item já em processamento pode concluir antes da pausa."
          : action === "resume"
            ? "Lote colocado novamente na fila."
            : "Cancelamento solicitado. Nenhum novo produto será iniciado.",
      );
      await invalidateAdminImageEnrichment(queryClient, job.id);
    },
    onError: (error) => setFeedback(describeAdminImageEnrichmentError(error)),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ action, itemIds }: { action: "approve" | "reject"; itemIds: number[] }) =>
      reviewAdminImageEnrichmentItems(
        jobId,
        action,
        validateAdminImageEnrichmentReviewSelection(itemIds),
        await getAdminCsrf(),
      ),
    onSuccess: async (result, variables) => {
      setSelectedReviewIds([]);
      setFeedback(
        result.failed
          ? `${result.succeeded} item(ns) concluído(s) e ${result.failed} com pendência.`
          : variables.action === "approve"
            ? `${result.succeeded} candidato(s) aprovado(s) e importado(s).`
            : `${result.succeeded} candidato(s) rejeitado(s).`,
      );
      await invalidateAdminImageEnrichment(
        queryClient,
        jobId,
        variables.action === "approve" && result.succeeded > 0,
      );
    },
    onError: (error) => setFeedback(describeAdminImageEnrichmentError(error)),
  });

  const sessionError =
    jobQuery.error ?? itemsQuery.error ?? actionMutation.error ?? reviewMutation.error;
  useEffect(() => {
    if (!sessionError) return;
    void expireAdminImageEnrichmentSession(sessionError, queryClient, () =>
      navigate({ to: "/admin/login", replace: true }),
    );
  }, [navigate, queryClient, sessionError]);

  useEffect(() => {
    setPage(0);
    setSelectedReviewIds([]);
  }, [filter]);

  useEffect(() => {
    const job = jobQuery.data;
    if (!job || job.status === "PENDING" || job.status === "RUNNING") return;
    if (
      job.progress.autoImported <= 0 ||
      invalidatedAutoImports.current === job.progress.autoImported
    )
      return;
    invalidatedAutoImports.current = job.progress.autoImported;
    void invalidateAdminProductData(queryClient);
  }, [jobQuery.data, queryClient]);

  if (!Number.isInteger(jobId) || jobId < 1) {
    return <ErrorState message="Identificador de lote inválido." />;
  }
  if (jobQuery.isPending) {
    return <LoadingState message="Carregando o lote..." />;
  }
  if (jobQuery.isError || !jobQuery.data) {
    return <ErrorState message={describeAdminImageEnrichmentError(jobQuery.error)} />;
  }

  const job = jobQuery.data;
  const progress = job.progress;
  const reviewItems = (itemsQuery.data?.items ?? []).filter(
    (item) => item.status === "REVIEW_REQUIRED",
  );
  const allPageReviewsSelected =
    reviewItems.length > 0 && reviewItems.every((item) => selectedReviewIds.includes(item.id));

  const toggleAllReviews = () => {
    if (allPageReviewsSelected) {
      setSelectedReviewIds((current) =>
        current.filter((id) => !reviewItems.some((item) => item.id === id)),
      );
      return;
    }
    setSelectedReviewIds((current) =>
      [...new Set([...current, ...reviewItems.map((item) => item.id)])].slice(0, 25),
    );
  };

  const runConfirmedAction = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === "cancel") actionMutation.mutate("cancel");
    if (action === "approve" || action === "reject") {
      reviewMutation.mutate({ action, itemIds: selectedReviewIds });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/admin/image-enrichment"
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#174F8C]"
          >
            <ArrowLeft size={14} /> Voltar aos lotes
          </Link>
          <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-[#252A2E]">
            Lote #{job.id}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#252A2E]/50">
            <StatusBadge status={job.status} />
            <span>{job.autoImport ? "Autoimportação segura" : "Somente análise"}</span>
            <span>·</span>
            <span>Criado em {formatDate(job.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {adminImageEnrichmentCanPause(job.status) && (
            <ActionButton
              icon={<Pause size={15} />}
              label="Pausar"
              onClick={() => actionMutation.mutate("pause")}
              disabled={actionMutation.isPending}
            />
          )}
          {adminImageEnrichmentCanResume(job.status) && (
            <ActionButton
              icon={<RotateCcw size={15} />}
              label="Retomar"
              onClick={() => actionMutation.mutate("resume")}
              disabled={actionMutation.isPending}
            />
          )}
          {adminImageEnrichmentCanCancel(job.status) && (
            <ActionButton
              danger
              icon={<StopCircle size={15} />}
              label="Cancelar lote"
              onClick={() => setConfirmAction("cancel")}
              disabled={actionMutation.isPending}
            />
          )}
        </div>
      </header>

      <section className="border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#252A2E]/45">
              Progresso
            </p>
            <p className="mt-2 text-xl font-black text-[#252A2E]">
              Processando {progress.processed} / {progress.total}
            </p>
          </div>
          <span className="text-3xl font-black text-[#174F8C]">
            {Math.round(progress.percentage)}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progresso do lote"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.percentage)}
          className="mt-4 h-3 overflow-hidden bg-[#E5E7EB]"
        >
          <div
            className="h-full bg-[#174F8C] transition-[width] duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Autoimportados" value={progress.autoImported} tone="green" />
          <Metric label="Seguros no dry-run" value={progress.readyForAutoImport} tone="blue" />
          <Metric label="Revisão" value={progress.reviewRequired} tone="yellow" />
          <Metric label="Sem candidato" value={progress.noCandidate} />
          <Metric label="Ignorados" value={progress.skipped} />
          <Metric label="Falhas" value={progress.failed} tone="red" />
        </div>
        {job.status === "PAUSED" &&
          (job.lastErrorCode === "RATE_LIMIT" || job.lastErrorCode === "QUOTA") && (
            <p
              role="alert"
              className="mt-5 border border-[#F5C400]/40 bg-[#F5C400]/10 p-4 text-[11px] font-bold text-[#665400]"
            >
              O provedor de imagens pausou temporariamente este lote. Tente retomá-lo quando a cota
              estiver disponível.
            </p>
          )}
      </section>

      {feedback && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 border border-[#174F8C]/20 bg-[#174F8C]/5 p-4 text-[11px] font-bold text-[#174F8C]"
        >
          <span>{feedback}</span>
          <button type="button" aria-label="Fechar mensagem" onClick={() => setFeedback(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      <section className="border border-[#E5E7EB] bg-white shadow-sm">
        <div className="space-y-4 border-b border-[#E5E7EB] p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-[#252A2E]">
                Produtos do lote
              </h3>
              <p className="mt-1 text-[10px] text-[#252A2E]/45">
                Itens paginados no servidor · até 20 por página
              </p>
            </div>
            {selectedReviewIds.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setConfirmAction("approve")}
                  disabled={reviewMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 bg-[#2E8B57] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                >
                  <Check size={14} /> Aprovar selecionados ({selectedReviewIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction("reject")}
                  disabled={reviewMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 border border-[#D9272E] px-4 py-3 text-[9px] font-black uppercase tracking-widest text-[#D9272E] disabled:opacity-50"
                >
                  <X size={14} /> Rejeitar selecionados
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filtros dos resultados">
            {RESULT_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-2 text-[9px] font-black uppercase tracking-wider ${filter === option.value ? "bg-[#174F8C] text-white" : "border border-[#E5E7EB] bg-white text-[#252A2E]/55 hover:border-[#174F8C]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {itemsQuery.isPending ? (
          <LoadingState message="Carregando produtos..." compact />
        ) : itemsQuery.isError ? (
          <ErrorState message={describeAdminImageEnrichmentError(itemsQuery.error)} compact />
        ) : !itemsQuery.data?.items.length ? (
          <div className="p-10 text-center text-[11px] text-[#252A2E]/50">
            Nenhum item neste filtro.
          </div>
        ) : (
          <>
            {reviewItems.length > 0 && (
              <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3 sm:px-6">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-bold text-[#252A2E]/60">
                  <input
                    type="checkbox"
                    checked={allPageReviewsSelected}
                    onChange={toggleAllReviews}
                    className="h-4 w-4 accent-[#174F8C]"
                  />{" "}
                  Selecionar revisões desta página
                </label>
              </div>
            )}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#F9FAFB] text-[8px] font-black uppercase tracking-[0.16em] text-[#252A2E]/45">
                  <tr>
                    <th className="px-5 py-3">Seleção</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Contexto ERP</th>
                    <th className="px-4 py-3">Resultado</th>
                    <th className="px-4 py-3">Candidato</th>
                    <th className="px-4 py-3">Tentativa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {itemsQuery.data.items.map((item) => (
                    <ItemTableRow
                      key={item.id}
                      item={item}
                      selected={selectedReviewIds.includes(item.id)}
                      onToggle={() => toggleReview(item)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[#E5E7EB] lg:hidden">
              {itemsQuery.data.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedReviewIds.includes(item.id)}
                  onToggle={() => toggleReview(item)}
                />
              ))}
            </div>
            <Pagination
              page={itemsQuery.data.page}
              totalPages={itemsQuery.data.totalPages}
              onPage={setPage}
            />
          </>
        )}
      </section>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] border-[#E5E7EB] bg-white sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationTitle(confirmAction)}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDescription(confirmAction, selectedReviewIds.length)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionMutation.isPending || reviewMutation.isPending}>
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={runConfirmedAction}
              disabled={actionMutation.isPending || reviewMutation.isPending}
              className={
                confirmAction === "reject" || confirmAction === "cancel"
                  ? "bg-[#D9272E] hover:bg-[#B51F25]"
                  : "bg-[#2E8B57] hover:bg-[#247348]"
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  function toggleReview(item: AdminImageEnrichmentItem) {
    if (item.status !== "REVIEW_REQUIRED") return;
    setSelectedReviewIds((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : current.length < 25
          ? [...current, item.id]
          : current,
    );
  }
}

const RESULT_FILTERS: { value: AdminImageEnrichmentResultFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "IMPORTED", label: "Importados" },
  { value: "REVIEW", label: "Revisão" },
  { value: "NO_CANDIDATE", label: "Sem candidato" },
  { value: "FAILED", label: "Falhas" },
  { value: "SKIPPED", label: "Ignorados" },
];

function StatusBadge({ status }: { status: Parameters<typeof adminImageEnrichmentJobLabel>[0] }) {
  const tone = {
    PENDING: "bg-[#174F8C]/10 text-[#174F8C]",
    RUNNING: "bg-[#174F8C] text-white",
    PAUSED: "bg-[#F5C400]/20 text-[#665400]",
    COMPLETED: "bg-[#2E8B57]/10 text-[#2E8B57]",
    FAILED: "bg-[#D9272E]/10 text-[#D9272E]",
    CANCELLED: "bg-[#252A2E]/10 text-[#252A2E]/60",
  }[status];
  return (
    <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider ${tone}`}>
      {adminImageEnrichmentJobLabel(status)}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-widest disabled:opacity-50 ${danger ? "border border-[#D9272E] text-[#D9272E]" : "border border-[#174F8C] text-[#174F8C]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({
  label,
  value,
  tone = "gray",
}: {
  label: string;
  value: number;
  tone?: "gray" | "green" | "blue" | "yellow" | "red";
}) {
  const color = {
    gray: "text-[#252A2E]",
    green: "text-[#2E8B57]",
    blue: "text-[#174F8C]",
    yellow: "text-[#8A7200]",
    red: "text-[#D9272E]",
  }[tone];
  return (
    <div className="border border-[#E5E7EB] bg-[#F9FAFB] p-3">
      <span className="block text-[8px] font-black uppercase tracking-wider text-[#252A2E]/40">
        {label}
      </span>
      <strong className={`mt-1 block text-xl ${color}`}>{value}</strong>
    </div>
  );
}

function ReviewCheckbox({
  item,
  selected,
  onToggle,
}: {
  item: AdminImageEnrichmentItem;
  selected: boolean;
  onToggle: () => void;
}) {
  if (item.status !== "REVIEW_REQUIRED") return <span className="text-[#252A2E]/20">—</span>;
  return (
    <input
      type="checkbox"
      aria-label={`Selecionar ${item.erpId} para revisão`}
      checked={selected}
      onChange={onToggle}
      className="h-4 w-4 accent-[#174F8C]"
    />
  );
}

function ItemTableRow({
  item,
  selected,
  onToggle,
}: {
  item: AdminImageEnrichmentItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className="align-top text-[10px] text-[#252A2E]/65">
      <td className="px-5 py-4">
        <ReviewCheckbox item={item} selected={selected} onToggle={onToggle} />
      </td>
      <td className="max-w-64 px-4 py-4">
        <strong className="block break-words text-[11px] text-[#252A2E]">{item.productName}</strong>
        <span className="mt-1 block font-mono text-[9px]">ERP {item.erpId}</span>
      </td>
      <td className="px-4 py-4">
        <span className="block">{item.manufacturer || "Sem fabricante"}</span>
        <span className="mt-1 block">Ref. {item.reference || item.partNumber || "—"}</span>
      </td>
      <td className="px-4 py-4">
        <ItemStatus status={item.status} />
        <span className="mt-2 block">{item.automationDecision || "—"}</span>
        {item.errorMessage && (
          <span className="mt-2 block max-w-56 text-[#D9272E]">{item.errorMessage}</span>
        )}
      </td>
      <td className="px-4 py-4">
        <CandidatePreview item={item} compact />
      </td>
      <td className="px-4 py-4">
        {item.attemptCount}
        <span className="mt-1 block text-[9px] text-[#252A2E]/40">
          {item.finishedAt
            ? formatDate(item.finishedAt)
            : item.startedAt
              ? "Em andamento"
              : "Não iniciado"}
        </span>
      </td>
    </tr>
  );
}

function ItemCard({
  item,
  selected,
  onToggle,
}: {
  item: AdminImageEnrichmentItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[12px] font-black text-[#252A2E]">{item.productName}</p>
          <p className="mt-1 font-mono text-[9px] text-[#252A2E]/45">ERP {item.erpId}</p>
        </div>
        <ReviewCheckbox item={item} selected={selected} onToggle={onToggle} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ItemStatus status={item.status} />
        {item.automationDecision && (
          <span className="border border-[#E5E7EB] px-2 py-1 text-[8px] font-bold">
            {item.automationDecision}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[9px]">
        <div>
          <dt className="font-black uppercase tracking-wider text-[#252A2E]/35">Fabricante</dt>
          <dd className="mt-1 break-words text-[#252A2E]/65">{item.manufacturer || "—"}</dd>
        </div>
        <div>
          <dt className="font-black uppercase tracking-wider text-[#252A2E]/35">Referência</dt>
          <dd className="mt-1 break-words text-[#252A2E]/65">
            {item.reference || item.partNumber || "—"}
          </dd>
        </div>
      </dl>
      <CandidatePreview item={item} />
      {item.errorMessage && (
        <p role="alert" className="text-[10px] font-bold text-[#D9272E]">
          {item.errorMessage}
        </p>
      )}
    </article>
  );
}

function ItemStatus({ status }: { status: AdminImageEnrichmentItemStatus }) {
  return (
    <span className="inline-flex bg-[#F4F5F6] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#252A2E]/65">
      {adminImageEnrichmentItemLabel(status)}
    </span>
  );
}

function CandidatePreview({
  item,
  compact = false,
}: {
  item: AdminImageEnrichmentItem;
  compact?: boolean;
}) {
  const candidate = item.candidate;
  if (!candidate)
    return (
      <span className="inline-flex items-center gap-1 text-[9px] text-[#252A2E]/35">
        <ImageOff size={13} /> Sem imagem
      </span>
    );
  return (
    <div className={`flex min-w-0 gap-3 ${compact ? "max-w-72" : ""}`}>
      <img
        src={candidate.thumbnailUrl || candidate.imageUrl}
        alt={candidate.title || `Candidato para ${item.productName}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-16 w-16 shrink-0 border border-[#E5E7EB] bg-white object-contain p-1"
      />
      <div className="min-w-0 text-[9px]">
        <span className="block break-all font-black text-[#252A2E]/65">
          {candidate.sourceDomain ?? "Origem não informada"}
        </span>
        <span className="mt-1 block">
          {candidate.confidence} · {candidate.matchedBy}
        </span>
        {candidate.sourcePageUrl ? (
          <a
            href={candidate.sourcePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-bold text-[#174F8C]"
          >
            Ver fonte <ExternalLink size={11} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] p-4 sm:px-6">
      <button
        type="button"
        aria-label="Página anterior"
        onClick={() => onPage(page - 1)}
        disabled={page <= 0}
        className="p-2 text-[#174F8C] disabled:opacity-25"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-[9px] font-black uppercase tracking-wider text-[#252A2E]/50">
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        aria-label="Próxima página"
        onClick={() => onPage(page + 1)}
        disabled={page + 1 >= totalPages}
        className="p-2 text-[#174F8C] disabled:opacity-25"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function LoadingState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-2 text-[11px] font-bold text-[#252A2E]/50 ${compact ? "min-h-40" : "min-h-[60vh]"}`}
    >
      <Loader2 className="animate-spin text-[#174F8C]" size={20} />
      {message}
    </div>
  );
}

function ErrorState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      role="alert"
      className={`flex items-center justify-center gap-2 px-5 text-center text-[11px] font-bold text-[#D9272E] ${compact ? "min-h-40" : "min-h-[60vh]"}`}
    >
      <AlertCircle size={20} />
      {message}
    </div>
  );
}

function confirmationTitle(action: "cancel" | "approve" | "reject" | null): string {
  if (action === "approve") return "Aprovar candidatos selecionados?";
  if (action === "reject") return "Rejeitar candidatos selecionados?";
  return "Cancelar este lote?";
}

function confirmationDescription(
  action: "cancel" | "approve" | "reject" | null,
  count: number,
): string {
  if (action === "approve")
    return `${count} candidato(s) serão revalidados e importados pelo servidor. Nenhuma URL do navegador será usada como autoridade.`;
  if (action === "reject")
    return `${count} candidato(s) serão marcados como rejeitados sem criar imagens.`;
  return "O processamento de novos produtos será interrompido. Um item já em processamento pode concluir antes do cancelamento finalizar.";
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}
