import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminImageCandidateReview } from "@/components/admin/AdminImageCandidateReview";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminProductImagesQueryKey,
  expireAdminProductMediaSession,
  invalidateAdminProductMedia,
} from "@/lib/admin-product-media-query";
import { getAdminCsrf } from "@/lib/api/admin-auth";
import {
  ADMIN_PRODUCT_IMAGE_ACCEPT,
  AdminProductMediaApiError,
  deleteProductImage,
  getProductImages,
  isAdminProductMediaUnauthorizedError,
  updateProductImage,
  uploadProductImage,
  validateProductImageFile,
  type AdminProductImage,
  type AdminProductImageUpdate,
} from "@/lib/api/admin-product-media";

type MediaFeedback = { kind: "success" | "error"; message: string } | null;

interface AdminProductMediaSectionProps {
  erpId: string;
  productName: string;
}

function mediaErrorMessage(error: unknown): string {
  if (!(error instanceof AdminProductMediaApiError)) {
    return "Não foi possível concluir a operação com a imagem.";
  }
  if (error.status === 413 || error.code === "IMAGE_TOO_LARGE") {
    return "A imagem excede o limite de 5 MB.";
  }
  if (error.status === 415 || error.code === "UNSUPPORTED_IMAGE_TYPE") {
    return "Use uma imagem JPEG, PNG ou WEBP.";
  }
  if (error.status === 422 || error.code === "INVALID_IMAGE") {
    return "O conteúdo do arquivo não corresponde a uma imagem válida.";
  }
  if (error.status === 502 || error.code === "MEDIA_STORAGE_ERROR") {
    return "O armazenamento de imagens está indisponível. Tente novamente.";
  }
  return "Não foi possível concluir a operação com a imagem.";
}

export function AdminProductMediaSection({ erpId, productName }: AdminProductMediaSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadPrimary, setUploadPrimary] = useState(false);
  const [uploadValidation, setUploadValidation] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductImage | null>(null);
  const [feedback, setFeedback] = useState<MediaFeedback>(null);

  const imagesQuery = useQuery({
    queryKey: adminProductImagesQueryKey(erpId),
    queryFn: () => getProductImages(erpId),
    retry: (failureCount, error) =>
      !isAdminProductMediaUnauthorizedError(error) && failureCount < 1,
  });

  useEffect(() => {
    if (!uploadFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(uploadFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [uploadFile]);

  const refreshMedia = async () => invalidateAdminProductMedia(queryClient, erpId);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new AdminProductMediaApiError(400, "IMAGE_REQUIRED");
      return uploadProductImage(
        erpId,
        uploadFile,
        await getAdminCsrf(),
        uploadAltText,
        uploadPrimary,
      );
    },
    onSuccess: async () => {
      await refreshMedia();
      setUploadOpen(false);
      setUploadFile(null);
      setUploadAltText("");
      setUploadPrimary(false);
      setUploadValidation(null);
      setFeedback({ kind: "success", message: "Imagem adicionada com sucesso." });
    },
    onError: (error) => {
      if (!isAdminProductMediaUnauthorizedError(error)) {
        setFeedback({ kind: "error", message: mediaErrorMessage(error) });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ imageId, update }: { imageId: number; update: AdminProductImageUpdate }) =>
      updateProductImage(erpId, imageId, update, await getAdminCsrf()),
    onSuccess: async () => {
      await refreshMedia();
      setFeedback({ kind: "success", message: "Imagem atualizada com sucesso." });
    },
    onError: (error) => {
      if (!isAdminProductMediaUnauthorizedError(error)) {
        setFeedback({ kind: "error", message: mediaErrorMessage(error) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => deleteProductImage(erpId, imageId, await getAdminCsrf()),
    onSuccess: async () => {
      await refreshMedia();
      setDeleteTarget(null);
      setFeedback({ kind: "success", message: "Imagem excluída com sucesso." });
    },
    onError: (error) => {
      if (!isAdminProductMediaUnauthorizedError(error)) {
        setFeedback({ kind: "error", message: mediaErrorMessage(error) });
      }
    },
  });

  const expiredError = [
    imagesQuery.error,
    uploadMutation.error,
    updateMutation.error,
    deleteMutation.error,
  ].find(isAdminProductMediaUnauthorizedError);

  useEffect(() => {
    if (expiredError) {
      void expireAdminProductMediaSession(expiredError, queryClient, () =>
        navigate({ to: "/admin/login", replace: true }),
      );
    }
  }, [expiredError, navigate, queryClient]);

  const chooseFile = (file: File | null) => {
    uploadMutation.reset();
    setFeedback(null);
    if (!file) {
      setUploadFile(null);
      setUploadValidation(null);
      return;
    }
    const validation = validateProductImageFile(file);
    setUploadValidation(validation);
    setUploadFile(validation ? null : file);
  };

  const closeUpload = (open: boolean) => {
    if (uploadMutation.isPending) return;
    setUploadOpen(open);
    if (!open) {
      setUploadFile(null);
      setUploadAltText("");
      setUploadPrimary(false);
      setUploadValidation(null);
      uploadMutation.reset();
    }
  };

  return (
    <section className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[#F4F5F6] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-[#174F8C]" size={18} />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#252A2E]">
              Imagens do produto
            </h3>
            <p className="mt-1 text-[10px] font-medium text-[#252A2E]/45">
              JPEG, PNG ou WEBP · máximo de 5 MB por imagem
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <AdminImageCandidateReview erpId={erpId} productName={productName} />
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#174F8C] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-[#123E70]"
          >
            <Plus size={15} /> Adicionar imagem
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {feedback && (
          <div
            role="status"
            className={`flex items-center gap-3 border p-3 text-[11px] font-bold ${
              feedback.kind === "success"
                ? "border-[#2E8B57]/30 bg-[#2E8B57]/10 text-[#2E8B57]"
                : "border-[#D9272E]/30 bg-[#D9272E]/10 text-[#D9272E]"
            }`}
          >
            {feedback.kind === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {feedback.message}
          </div>
        )}

        {expiredError ? (
          <MediaState message="Sessão expirada. Redirecionando para o login..." loading />
        ) : imagesQuery.isPending ? (
          <MediaState message="Carregando imagens..." loading />
        ) : imagesQuery.isError ? (
          <MediaState message="Não foi possível carregar as imagens.">
            <button
              type="button"
              onClick={() => void imagesQuery.refetch()}
              className="bg-[#174F8C] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
            >
              Tentar novamente
            </button>
          </MediaState>
        ) : imagesQuery.data.length === 0 ? (
          <MediaState message="Este produto ainda não possui imagens." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {imagesQuery.data.map((image) => (
              <AdminProductImageCard
                key={image.id}
                image={image}
                productName={productName}
                updating={
                  updateMutation.isPending && updateMutation.variables?.imageId === image.id
                }
                deleting={deleteMutation.isPending && deleteTarget?.id === image.id}
                onUpdate={(update) => {
                  setFeedback(null);
                  updateMutation.mutate({ imageId: image.id, update });
                }}
                onDelete={() => setDeleteTarget(image)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={closeUpload}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto border-[#E5E7EB] bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#252A2E]">Adicionar imagem</DialogTitle>
            <DialogDescription>
              O arquivo será enviado ao Spring. Nenhuma imagem será armazenada no navegador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <label
                htmlFor="product-image-file"
                className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#252A2E]/55"
              >
                Arquivo
              </label>
              <input
                id="product-image-file"
                type="file"
                accept={ADMIN_PRODUCT_IMAGE_ACCEPT}
                disabled={uploadMutation.isPending}
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[12px] text-[#252A2E] file:mr-3 file:border-0 file:bg-[#174F8C] file:px-3 file:py-2 file:text-[10px] file:font-bold file:uppercase file:text-white"
              />
              {uploadValidation && (
                <p role="alert" className="mt-2 text-[11px] font-bold text-[#D9272E]">
                  {uploadValidation}
                </p>
              )}
            </div>

            <div className="aspect-video overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-[#F4F5F6]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Prévia local da imagem selecionada"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-[#252A2E]/30">
                  <Upload size={28} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Selecione uma imagem
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="product-image-alt"
                className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#252A2E]/55"
              >
                Texto alternativo · opcional
              </label>
              <input
                id="product-image-alt"
                type="text"
                maxLength={500}
                value={uploadAltText}
                disabled={uploadMutation.isPending}
                onChange={(event) => setUploadAltText(event.target.value)}
                className="w-full rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[13px] outline-none focus:border-[#174F8C]"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <input
                type="checkbox"
                checked={uploadPrimary}
                disabled={uploadMutation.isPending}
                onChange={(event) => setUploadPrimary(event.target.checked)}
                className="h-4 w-4 accent-[#174F8C]"
              />
              <span className="text-[11px] font-bold text-[#252A2E]">Definir como principal</span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => closeUpload(false)}
              disabled={uploadMutation.isPending}
              className="border border-[#E5E7EB] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#252A2E]/60 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => uploadMutation.mutate()}
              disabled={!uploadFile || Boolean(uploadValidation) || uploadMutation.isPending}
              className="inline-flex items-center justify-center gap-2 bg-[#174F8C] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Upload size={15} />
              )}
              {uploadMutation.isPending ? "Enviando..." : "Enviar imagem"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] border-[#E5E7EB] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#252A2E]">Excluir imagem?</AlertDialogTitle>
            <AlertDialogDescription>
              A imagem será removida do catálogo e do armazenamento. Se ela for a principal, o
              backend poderá promover a próxima imagem disponível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!deleteTarget || deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleteTarget && !deleteMutation.isPending) {
                  setFeedback(null);
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
              className="inline-flex bg-[#D9272E] text-white hover:bg-[#B91F25]"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 animate-spin" size={14} />}
              {deleteMutation.isPending ? "Excluindo..." : "Excluir imagem"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AdminProductImageCard({
  image,
  productName,
  updating,
  deleting,
  onUpdate,
  onDelete,
}: {
  image: AdminProductImage;
  productName: string;
  updating: boolean;
  deleting: boolean;
  onUpdate: (update: AdminProductImageUpdate) => void;
  onDelete: () => void;
}) {
  const [altText, setAltText] = useState(image.altText ?? "");
  const [position, setPosition] = useState(String(image.position));

  useEffect(() => {
    setAltText(image.altText ?? "");
    setPosition(String(image.position));
  }, [image.altText, image.position]);

  const parsedPosition = Number(position);
  const positionValid = Number.isSafeInteger(parsedPosition) && parsedPosition >= 0;
  const metadataDirty =
    altText !== (image.altText ?? "") || (positionValid && parsedPosition !== image.position);

  return (
    <article className="overflow-hidden rounded-[2px] border border-[#E5E7EB] bg-[#F9FAFB]">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img
          src={image.url}
          alt={image.altText || productName}
          width={640}
          height={480}
          loading="lazy"
          className="h-full w-full object-contain p-3"
        />
        {image.primary && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-[#174F8C] px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow">
            <Star size={11} fill="currentColor" /> Principal
          </span>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px]">
          <div>
            <label
              htmlFor={`image-alt-${image.id}`}
              className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#252A2E]/45"
            >
              Alt text
            </label>
            <input
              id={`image-alt-${image.id}`}
              type="text"
              maxLength={500}
              value={altText}
              disabled={updating || deleting}
              onChange={(event) => setAltText(event.target.value)}
              className="w-full rounded-[2px] border border-[#E5E7EB] bg-white p-2.5 text-[12px] outline-none focus:border-[#174F8C]"
            />
          </div>
          <div>
            <label
              htmlFor={`image-position-${image.id}`}
              className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#252A2E]/45"
            >
              Posição
            </label>
            <input
              id={`image-position-${image.id}`}
              type="number"
              min={0}
              step={1}
              value={position}
              disabled={updating || deleting}
              onChange={(event) => setPosition(event.target.value)}
              className="w-full rounded-[2px] border border-[#E5E7EB] bg-white p-2.5 text-[12px] outline-none focus:border-[#174F8C]"
            />
          </div>
        </div>
        {!positionValid && (
          <p role="alert" className="text-[10px] font-bold text-[#D9272E]">
            Informe uma posição inteira maior ou igual a zero.
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={!metadataDirty || !positionValid || updating || deleting}
            onClick={() => onUpdate({ altText: altText.trim() || null, position: parsedPosition })}
            className="inline-flex flex-1 items-center justify-center gap-2 border border-[#174F8C] px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#174F8C] disabled:opacity-35"
          >
            {updating ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
            Salvar dados
          </button>
          <button
            type="button"
            disabled={image.primary || updating || deleting}
            onClick={() => onUpdate({ primary: true })}
            className="inline-flex flex-1 items-center justify-center gap-2 bg-[#174F8C] px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-white disabled:opacity-35"
          >
            <Star size={13} /> {image.primary ? "Imagem principal" : "Definir principal"}
          </button>
          <button
            type="button"
            disabled={updating || deleting}
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 border border-[#D9272E]/30 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#D9272E] disabled:opacity-35"
          >
            <Trash2 size={13} /> Excluir
          </button>
        </div>
      </div>
    </article>
  );
}

function MediaState({
  message,
  loading = false,
  children,
}: {
  message: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center">
      {loading ? (
        <Loader2 className="animate-spin text-[#174F8C]" size={22} />
      ) : (
        <ImageIcon className="text-[#252A2E]/25" size={26} />
      )}
      <p className="text-[11px] font-medium text-[#252A2E]/55">{message}</p>
      {children}
    </div>
  );
}
