import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { expireAdminProductMediaSession } from "@/lib/admin-product-media-query";
import { getAdminCsrf, isAdminUnauthorizedError } from "@/lib/api/admin-auth";
import {
  getCategoryImages,
  uploadCategoryImage,
  deleteCategoryImage,
} from "@/lib/api/admin-category-media";
import {
  ADMIN_PRODUCT_IMAGE_ACCEPT,
  AdminProductMediaApiError,
  validateProductImageFile,
} from "@/lib/api/admin-product-media";
import type { PublicCategory } from "@/lib/api/public-catalog";
import { categoryPresentation } from "@/lib/category-presentation";

export const Route = createFileRoute("/admin/categorias")({ component: CategoryImages });
const KEY = ["admin-category-images"] as const;
function errorMessage(error: unknown) {
  if (error instanceof AdminProductMediaApiError) {
    if (error.status === 403)
      return "A proteção da sessão expirou. Tente novamente; se necessário, faça novo login.";
    if (error.status === 409)
      return "A imagem mudou em outra operação. Atualize a página e tente novamente.";
    if (error.status === 413) return "Use uma imagem de até 5 MB.";
    if (error.status === 415 || error.status === 422)
      return "Use um arquivo JPEG, PNG ou WEBP válido.";
    if (error.status === 404)
      return "Categoria indisponível ou recurso ainda não publicado no servidor.";
  }
  return "Não foi possível salvar a imagem. Tente novamente em alguns instantes.";
}

function CategoryImages() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<PublicCategory | null>(null);
  const [removing, setRemoving] = useState<PublicCategory | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const lock = useRef(false);
  const query = useQuery({ queryKey: KEY, queryFn: () => getCategoryImages(), retry: false });
  const expire = (error: unknown) =>
    expireAdminProductMediaSession(error, client, () => navigate({ to: "/admin/login" }));
  useEffect(() => {
    if (query.error)
      void expireAdminProductMediaSession(query.error, client, () =>
        navigate({ to: "/admin/login" }),
      );
  }, [query.error, client, navigate]);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const mutation = useMutation({
    mutationFn: async (operation: { category: PublicCategory; file?: File }) => {
      let csrf;
      try {
        csrf = await getAdminCsrf();
      } catch (error) {
        if (isAdminUnauthorizedError(error))
          throw new AdminProductMediaApiError(401, "UNAUTHORIZED");
        throw error;
      }
      if (operation.file)
        await uploadCategoryImage(operation.category.erpName, operation.file, csrf);
      else await deleteCategoryImage(operation.category.erpName, csrf);
    },
    onSuccess: async () => {
      setEditing(null);
      setRemoving(null);
      setFile(null);
      setFeedback("Imagem atualizada. A Home e as categorias usam a mesma foto.");
      await Promise.all([
        client.invalidateQueries({ queryKey: KEY }),
        client.invalidateQueries({ queryKey: ["public-categories"] }),
        client.invalidateQueries({ queryKey: ["public-category"] }),
      ]);
    },
    onError: (error) => {
      setFeedback(errorMessage(error));
      void expire(error);
    },
    onSettled: () => {
      lock.current = false;
    },
  });
  function save(category: PublicCategory, selectedFile?: File) {
    if (lock.current) return;
    lock.current = true;
    setFeedback(null);
    mutation.mutate({ category, ...(selectedFile ? { file: selectedFile } : {}) });
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <span className="text-xs font-bold uppercase tracking-wider text-[#174F8C]">
          Conteúdo da loja
        </span>
        <h1 className="mt-2 text-2xl font-bold text-[#252A2E]">Imagens das categorias</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Envie uma foto para os cards da Home e da página de categorias. JPEG, PNG ou WEBP, até 5
          MB. As categorias são as que possuem produtos publicados; seus nomes e produtos não serão
          alterados.
        </p>
      </header>
      {feedback && (
        <p
          role="status"
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
        >
          {feedback}
        </p>
      )}
      {query.isPending && (
        <p role="status" className="flex items-center gap-2 text-sm">
          <Loader2 className="animate-spin" size={18} /> Carregando categorias...
        </p>
      )}
      {query.isError && (
        <div role="alert" className="rounded-lg bg-white p-6">
          <p>{errorMessage(query.error)}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-3 font-bold text-[#174F8C]"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {query.isSuccess && query.data.length === 0 && (
        <p className="rounded-lg bg-white p-6">
          Publique produtos para que suas categorias apareçam aqui.
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {(query.data ?? []).map((category) => {
          const presentation = categoryPresentation(
            category.erpName,
            category.name,
            category.imageUrl,
          );
          return (
            <article
              key={category.erpName}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-[16/9]">
                <ImageWithFallback
                  src={presentation.image}
                  alt={presentation.name}
                  type="category"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="font-bold">{presentation.name}</h2>
                <p className="mt-1 break-words text-xs text-slate-500">
                  ERP: {category.erpName} · {category.productCount} produtos públicos
                </p>
                <p className="mt-3 text-xs font-medium text-[#174F8C]">
                  {category.imageUrl
                    ? "Imagem personalizada"
                    : presentation.image
                      ? "Imagem padrão da loja"
                      : "Ainda sem imagem"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => {
                      mutation.reset();
                      setEditing(category);
                      setFile(null);
                      setValidation(null);
                      setFeedback(null);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-[#174F8C] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Upload size={16} /> {category.imageUrl ? "Trocar imagem" : "Enviar imagem"}
                  </button>
                  {category.imageUrl && (
                    <button
                      type="button"
                      disabled={mutation.isPending}
                      onClick={() => {
                        mutation.reset();
                        setRemoving(category);
                      }}
                      className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={16} /> Remover
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) {
            setEditing(null);
            setFile(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Imagem de {editing?.name}</DialogTitle>
            <DialogDescription>
              A foto será aplicada na Home e nas categorias, sem alterar produtos. Prefira uma
              imagem horizontal, com o assunto ao centro.
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-slate-100">
            {preview ? (
              <img
                src={preview}
                alt="Prévia da imagem selecionada"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                <ImageIcon size={42} />
              </div>
            )}
          </div>
          <label className="block text-sm font-semibold">
            Escolher arquivo
            <input
              type="file"
              accept={ADMIN_PRODUCT_IMAGE_ACCEPT}
              disabled={mutation.isPending}
              className="mt-2 block w-full min-w-0 rounded-lg border p-2 text-sm"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                const message = selected ? validateProductImageFile(selected) : null;
                setValidation(message);
                setFile(message ? null : selected);
              }}
            />
          </label>
          {validation && (
            <p role="alert" className="text-sm text-red-700">
              {validation}
            </p>
          )}
          <DialogFooter>
            {mutation.isError && (
              <p role="alert" className="text-sm text-red-700">
                {errorMessage(mutation.error)}
              </p>
            )}
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => {
                setEditing(null);
                setFile(null);
              }}
              className="rounded-lg border px-4 py-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!file || mutation.isPending}
              onClick={() => {
                if (editing && file) save(editing, file);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#174F8C] px-4 py-2 text-white disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
              {mutation.isPending ? "Salvando..." : "Salvar imagem"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setRemoving(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover a imagem personalizada?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria {removing?.name} voltará à foto padrão da loja, se houver, ou ao
              placeholder. Nenhum produto será excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {mutation.isError && (
              <p role="alert" className="text-sm text-red-700">
                {errorMessage(mutation.error)}
              </p>
            )}
            <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (removing) save(removing);
              }}
            >
              {mutation.isPending ? "Removendo..." : "Remover imagem"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
