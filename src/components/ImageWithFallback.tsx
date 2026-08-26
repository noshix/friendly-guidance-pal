import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function ImageWithFallback({
  src,
  alt,
  className,
  type = "product",
  loading,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  type?: "product" | "category";
  loading?: "eager" | "lazy";
  width?: number;
  height?: number;
}) {
  const [error, setError] = useState(!src);

  useEffect(() => setError(!src), [src]);

  if (error) {
    return (
      <div className={`${className} bg-[#F4F5F6] flex flex-col items-center justify-center ${type === 'category' ? 'p-12' : 'p-8'} relative overflow-hidden`}>
        <Zap size={type === 'category' ? 64 : 48} className="text-[#252A2E]/10 mb-2" strokeWidth={1} />
        <span className={`font-black text-[#252A2E]/30 uppercase tracking-[0.2em] text-center ${type === 'category' ? 'text-[12px]' : 'text-[10px]'}`}>
          Imagem em breve
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading={loading}
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
}
