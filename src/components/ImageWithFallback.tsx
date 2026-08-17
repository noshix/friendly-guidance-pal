export function ImageWithFallback({ src, alt, className, type = 'product' }: { src: string, alt: string, className?: string, type?: 'product' | 'category' }) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23A3A3A3' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E";
        target.className = `${className} bg-[#F4F5F6] p-12 opacity-40`;
        const parent = target.parentElement;
        if (parent && !parent.querySelector('.fallback-text')) {
          const text = document.createElement('div');
          text.className = 'fallback-text absolute inset-0 flex items-end justify-center pb-4 text-[10px] font-bold text-[#252A2E]/40 uppercase tracking-widest';
          text.innerText = 'Imagem em breve';
          parent.style.position = 'relative';
          parent.appendChild(text);
        }
      }}
    />
  );
}
