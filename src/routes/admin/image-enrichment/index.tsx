import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, ImagePlus, Loader2, Play, Search } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import {
  DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
  adminImageEnrichmentJobLabel,
  buildAdminImageEnrichmentRequest,
  describeAdminImageEnrichmentError,
  type AdminImageEnrichmentFormValues,
} from "@/lib/admin-image-enrichment-flow";
import {
  adminImageEnrichmentJobsKey,
  expireAdminImageEnrichmentSession,
  invalidateAdminImageEnrichment,
} from "@/lib/admin-image-enrichment-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  createAdminImageEnrichmentJob,
  getAdminImageEnrichmentJobs,
  type AdminImageEnrichmentJob,
} from "@/lib/api/admin-image-enrichment";

export const Route = createFileRoute("/admin/image-enrichment/")({
  component: AdminImageEnrichmentPage,
});

function AdminImageEnrichmentPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [values, setValues] = useState<AdminImageEnrichmentFormValues>(
    DEFAULT_ADMIN_IMAGE_ENRICHMENT_FORM,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const jobsQuery = useQuery({
    queryKey: adminImageEnrichmentJobsKey(0, 10),
    queryFn: () => getAdminImageEnrichmentJobs(0, 10),
    retry: false,
  });
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = buildAdminImageEnrichmentRequest(values);
      return createAdminImageEnrichmentJob(payload, await getAdminCsrf());
    },
    onSuccess: async (job) => {
      setFormError(null);
      await invalidateAdminImageEnrichment(queryClient, job.id);
      await navigate({
        to: "/admin/image-enrichment/$jobId",
        params: { jobId: String(job.id) },
      });
    },
    onError: (error) => setFormError(describeAdminImageEnrichmentError(error)),
  });

  useEffect(() => {
    const error = jobsQuery.error ?? createMutation.error;
    if (!error) return;
    void expireAdminImageEnrichmentSession(error, queryClient, () =>
      navigate({ to: "/admin/login", replace: true }),
    );
  }, [createMutation.error, jobsQuery.error, navigate, queryClient]);

  const update = <K extends keyof AdminImageEnrichmentFormValues>(
    field: K,
    value: AdminImageEnrichmentFormValues[K],
  ) => setValues((current) => ({ ...current, [field]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    try {
      buildAdminImageEnrichmentRequest(values);
      setFormError(null);
      createMutation.mutate();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Revise os filtros do lote.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#174F8C]">
            Catálogo · mídia
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#252A2E]">
            Enriquecimento de imagens
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-[#252A2E]/60">
            Analise ou importe imagens seguras em lotes controlados de até 100 produtos. Cada busca
            consome consultas do provedor de imagens.
          </p>
        </div>
        <div className="flex items-center gap-2 border border-[#F5C400]/35 bg-[#F5C400]/10 px-4 py-3 text-[10px] font-bold text-[#665400]">
          <Search size={15} /> Nenhum lote é reiniciado ao recarregar a página.
        </div>
      </header>

      <section className="border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] p-5 sm:p-6">
          <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-[#252A2E]">
            Criar novo lote
          </h3>
        </div>
        <form onSubmit={submit} className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TextField
              id="enrichment-manufacturer"
              label="Fabricante"
              placeholder="Todos"
              value={values.manufacturer}
              onChange={(value) => update("manufacturer", value)}
            />
            <TextField
              id="enrichment-group"
              label="Grupo"
              placeholder="Todos"
              value={values.group}
              onChange={(value) => update("group", value)}
            />
            <TextField
              id="enrichment-subgroup"
              label="Subgrupo"
              placeholder="Todos"
              value={values.subgroup}
              onChange={(value) => update("subgroup", value)}
            />
            <div>
              <label htmlFor="enrichment-visibility" className={labelClass}>
                Visibilidade
              </label>
              <select
                id="enrichment-visibility"
                value={values.visibility}
                onChange={(event) =>
                  update(
                    "visibility",
                    event.target.value as AdminImageEnrichmentFormValues["visibility"],
                  )
                }
                className={inputClass}
              >
                <option value="ALL">Todos</option>
                <option value="VISIBLE">Somente visíveis</option>
                <option value="HIDDEN">Somente ocultos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <label htmlFor="enrichment-erp-ids" className={labelClass}>
                ERP IDs · opcional
              </label>
              <textarea
                id="enrichment-erp-ids"
                rows={4}
                value={values.erpIdsText}
                onChange={(event) => update("erpIdsText", event.target.value)}
                placeholder="Um ID por linha, ou separados por vírgula"
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <label htmlFor="enrichment-max-products" className={labelClass}>
                Quantidade
              </label>
              <input
                id="enrichment-max-products"
                type="number"
                min={1}
                max={100}
                value={values.maxProducts}
                onChange={(event) => update("maxProducts", Number(event.target.value))}
                className={inputClass}
              />
              <p className="mt-2 text-[10px] leading-relaxed text-[#252A2E]/45">
                Padrão e limite desta homologação: 100.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <input
              type="checkbox"
              checked={values.onlyWithoutImage}
              onChange={(event) => update("onlyWithoutImage", event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#174F8C]"
            />
            <span>
              <span className="block text-[11px] font-black uppercase tracking-wider text-[#252A2E]">
                Somente produtos sem imagem
              </span>
              <span className="mt-1 block text-[10px] text-[#252A2E]/50">
                Evita substituir ou duplicar imagens já cadastradas.
              </span>
            </span>
          </label>

          <fieldset className="space-y-3">
            <legend className={labelClass}>Modo</legend>
            <ModeOption
              checked={!values.autoImport}
              onChange={() => update("autoImport", false)}
              title="Somente analisar"
              description="Busca e classifica, sem baixar imagens, gravar no R2 ou criar ProductImage."
            />
            <ModeOption
              checked={values.autoImport}
              onChange={() => update("autoImport", true)}
              title="Buscar e importar automaticamente os seguros"
              description="Somente candidatos considerados seguros são importados automaticamente. Resultados duvidosos ficam disponíveis para revisão."
            />
          </fieldset>

          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 border border-[#D9272E]/25 bg-[#D9272E]/8 p-4 text-[11px] font-bold text-[#B51F25]"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={15} /> {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            aria-busy={createMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 bg-[#174F8C] px-6 py-4 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#123E70] disabled:cursor-wait disabled:opacity-50 sm:w-auto"
          >
            {createMutation.isPending ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Play size={17} />
            )}
            {createMutation.isPending ? "Criando lote..." : "Iniciar lote"}
          </button>
        </form>
      </section>

      <RecentJobs
        jobs={jobsQuery.data?.items ?? []}
        loading={jobsQuery.isPending}
        error={jobsQuery.isError}
      />
    </div>
  );
}

const labelClass = "mb-2 block text-[9px] font-black uppercase tracking-[0.18em] text-[#252A2E]/55";
const inputClass =
  "w-full rounded-[2px] border border-[#E5E7EB] bg-white px-3 py-3 text-[12px] text-[#252A2E] outline-none transition focus:border-[#174F8C] focus:ring-2 focus:ring-[#174F8C]/10";

function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function ModeOption({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 border p-4 ${checked ? "border-[#174F8C] bg-[#174F8C]/5" : "border-[#E5E7EB] bg-white"}`}
    >
      <input
        type="radio"
        name="enrichment-mode"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 accent-[#174F8C]"
      />
      <span>
        <span className="block text-[11px] font-black text-[#252A2E]">{title}</span>
        <span className="mt-1 block text-[10px] leading-relaxed text-[#252A2E]/50">
          {description}
        </span>
      </span>
    </label>
  );
}

function RecentJobs({
  jobs,
  loading,
  error,
}: {
  jobs: AdminImageEnrichmentJob[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <section className="border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5 sm:p-6">
        <div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-[#252A2E]">
            Lotes recentes
          </h3>
          <p className="mt-1 text-[10px] text-[#252A2E]/45">Progresso persistente no servidor.</p>
        </div>
        <ImagePlus className="text-[#174F8C]" size={20} />
      </div>
      {loading ? (
        <div
          role="status"
          className="flex min-h-40 items-center justify-center gap-2 text-[11px] font-bold text-[#252A2E]/50"
        >
          <Loader2 className="animate-spin" size={17} /> Carregando lotes...
        </div>
      ) : error ? (
        <div role="alert" className="p-6 text-[11px] font-bold text-[#D9272E]">
          Não foi possível carregar o histórico.
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-8 text-center text-[11px] text-[#252A2E]/50">
          Nenhum lote criado até o momento.
        </div>
      ) : (
        <div className="divide-y divide-[#E5E7EB]">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to="/admin/image-enrichment/$jobId"
              params={{ jobId: String(job.id) }}
              className="grid gap-3 p-5 transition hover:bg-[#F9FAFB] sm:grid-cols-[90px_1fr_auto] sm:items-center sm:px-6"
            >
              <div className="text-[10px] font-black uppercase tracking-wider text-[#174F8C]">
                Lote #{job.id}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black text-[#252A2E]">
                    {adminImageEnrichmentJobLabel(job.status)}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#252A2E]/40">
                    {job.autoImport ? "Autoimportação" : "Somente análise"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-[#252A2E]/50">
                  {job.progress.processed} de {job.progress.total} processados ·{" "}
                  {Math.round(job.progress.percentage)}%
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#174F8C]">
                Abrir <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
