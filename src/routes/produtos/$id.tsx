import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ChevronRight, MessageCircle, FileText, Package, Tag, Hash, Building2, CheckCircle2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/produtos/$id")({
  component: ProductDetail,
  head: () => ({
    meta: [
      { title: "Disjuntor Tripolar 32A | Pizzatto Materiais Elétricos" },
      { name: "description", content: "Disjuntor Tripolar 32A Siemens. Proteção elétrica de alta qualidade na Pizzatto." },
    ],
  }),
});

// Mock Products List (shared data source for detail and related)
const MOCK_PRODUCTS = [
  { id: "3481", brand: 'SIEMENS', name: 'Disjuntor Tripolar 32A', ref: '5SX2332-7', price: '189,90', img: '', inStock: true, unit: "UN", ncm: "8536.20.00", barcode: "7891234567890", category: "Proteção Elétrica", description: "" },
  { id: "2", brand: 'SIL', name: 'Cabo Flexível 2,5 mm² Azul 750V', ref: 'Rolo 100m', price: '349,00', img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4e?auto=format&fit=crop&q=80&w=400', inStock: true, unit: "UN", ncm: "8544.49.00", barcode: "7891234567891", category: "Cabos e Condutores", description: "" },
  { id: "3", brand: 'ALUMBRA', name: 'Lâmpada LED High Power 40W', ref: '6500K Bivolt', price: '49,90', img: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&q=80&w=400', inStock: true, unit: "UN", ncm: "8539.50.00", barcode: "7891234567892", category: "Iluminação", description: "" },
  { id: "4", brand: 'STECK', name: 'Quadro de Distribuição 24 DIN', ref: 'Sobrepor', price: '124,50', img: 'https://images.unsplash.com/photo-1596734509421-419b67484462?auto=format&fit=crop&q=80&w=400', inStock: false, unit: "UN", ncm: "8537.10.90", barcode: "7891234567893", category: "Proteção Elétrica", description: "" },
  { id: "5", brand: 'WEG', name: 'Motor Trifásico 2CV', ref: 'W22 Premium', price: null, img: '', inStock: true, unit: "UN", ncm: "8501.52.10", barcode: "7891234567894", category: "Motores", description: "" },
  { id: "6", brand: 'TRAMONTINA', name: 'Alicate Universal 8"', ref: 'Isolado 1000V', price: '85,90', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400', inStock: true, unit: "UN", ncm: "8203.20.10", barcode: "7891234567895", category: "Ferramentas", description: "" },
  { id: "7", brand: 'CORFIO', name: 'Cabo PP 3x2,5mm²', ref: 'Metro', price: '12,50', img: '', inStock: false, unit: "MT", ncm: "8544.49.00", barcode: "7891234567896", category: "Cabos e Condutores", description: "" },
  { id: "8", brand: 'PIAL', name: 'Interruptor Simples 4x2', ref: 'Pial Plus', price: '22,90', img: 'https://images.unsplash.com/photo-1563770660941-20978e870e93?auto=format&fit=crop&q=80&w=400', inStock: true, unit: "UN", ncm: "8536.50.90", barcode: "7891234567897", category: "Interruptores", description: "" },
  { id: "9", brand: 'SIEMENS', name: 'Contator Trifásico 25A', ref: '3RT2026-1AK60', price: '245,00', img: '', inStock: true, unit: "UN", ncm: "8536.49.00", barcode: "7891234567898", category: "Proteção Elétrica", description: "" },
  { id: "10", brand: 'SIL', name: 'Cabo Flexível 6,0 mm² Preto', ref: 'Metro', price: '8,90', img: '', inStock: true, unit: "MT", ncm: "8544.49.00", barcode: "7891234567899", category: "Cabos e Condutores", description: "" },
  { id: "11", brand: 'ALUMBRA', name: 'Plafon LED 18W Quadrado', ref: 'Embutir', price: '32,90', img: '', inStock: true, unit: "UN", ncm: "9405.10.99", barcode: "7891234567900", category: "Iluminação", description: "" },
  { id: "12", brand: 'STECK', name: 'Tomada Industrial 2P+T 16A', ref: 'Azul', price: '45,00', img: '', inStock: true, unit: "UN", ncm: "8536.69.10", barcode: "7891234567901", category: "Conectores", description: "" },
];

function ProductDetail() {
  const { id } = Route.useParams();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  
  // Find product by ID or fallback to first one if not found (mock behavior)
  const PRODUCT = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];

  const handleAddToCart = () => {
    if (!PRODUCT) return;
    addItem({
      id: PRODUCT.id,
      name: PRODUCT.name,
      brand: PRODUCT.brand,
      ref: PRODUCT.ref,
      img: PRODUCT.img,
      quantity: quantity,
      price: PRODUCT.price,
      inStock: PRODUCT.inStock
    });
    toast.success(`${quantity} item(s) adicionado(s) ao orçamento`);
  };

  const handleWhatsAppDirect = () => {
    if (!PRODUCT) return;
    const message = `Olá! Tenho interesse no produto: ${PRODUCT.name} (Ref: ${PRODUCT.ref}, Código: ${PRODUCT.id}). Gostaria de mais informações.`;
    const phone = "556530524200"; 
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Related products (different from current one)
  const RELATED_PRODUCTS = MOCK_PRODUCTS
    .filter(p => p.id !== PRODUCT?.id)
    .slice(0, 3);

  if (!PRODUCT) return null;

  return (
    <div className="min-h-screen bg-white text-[#252A2E]">
      <Header activePage="Produtos" />

      <main>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-[11px] text-[#252A2E]/50 font-medium uppercase tracking-wider">
            <a href="/" className="hover:text-[#174F8C]">Início</a>
            <ChevronRight size={10} />
            <a href="/produtos" className="hover:text-[#174F8C]">Produtos</a>
            <ChevronRight size={10} />
            <span className="hover:text-[#174F8C] cursor-pointer">{PRODUCT.category}</span>
            <ChevronRight size={10} />
            <span className="text-[#252A2E]">{PRODUCT.name}</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Image */}
            <div className="bg-[#F4F5F6] rounded-[2px] aspect-square flex items-center justify-center p-8 lg:p-16">
              <ImageWithFallback 
                src={PRODUCT.img} 
                alt={PRODUCT.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Right Column: Info */}
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <div className="text-[12px] font-black text-[#174F8C] tracking-[0.2em] mb-3 uppercase">
                  {PRODUCT.brand}
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#252A2E] leading-tight mb-4 uppercase tracking-tight">
                  {PRODUCT.name}
                </h1>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#252A2E]/50 font-medium border-b border-[#F4F5F6] pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[#252A2E]/30 uppercase tracking-widest">Ref:</span>
                    <span>{PRODUCT.ref}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#252A2E]/30 uppercase tracking-widest">Código:</span>
                    <span>{PRODUCT.id}</span>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <div className={`flex items-center gap-2 text-[12px] font-bold mb-6 uppercase tracking-wider ${PRODUCT.inStock ? 'text-[#2E8B57]' : 'text-[#252A2E]/40'}`}>
                  <div className={`w-2 h-2 rounded-full ${PRODUCT.inStock ? 'bg-[#2E8B57] animate-pulse' : 'bg-[#E5E7EB]'}`}></div>
                  {PRODUCT.inStock ? 'Em estoque' : 'Consulte disponibilidade'}
                </div>

                <div className="mb-10">
                  {PRODUCT.price ? (
                    <div className="text-4xl font-black text-[#252A2E] tracking-tight">
                      R$ {PRODUCT.price}
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-[#252A2E]/30 uppercase tracking-widest">
                      Consulte
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6 max-w-md">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#E5E7EB] rounded-[2px] bg-white">
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="p-3 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-12 text-center font-bold text-[16px]">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="p-3 hover:bg-[#F4F5F6] transition text-[#252A2E]/60"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-[#174F8C] text-white py-5 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#123E70] transition shadow-lg flex items-center justify-center gap-3 group"
                  >
                    <ShoppingBag size={20} />
                    Adicionar ao Orçamento
                  </button>
                  <button 
                    onClick={handleWhatsAppDirect}
                    className="w-full bg-[#2E8B57] text-white py-5 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#256F46] transition shadow-lg flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={20} />
                    Falar sobre este produto no WhatsApp
                  </button>
                </div>
                
                <p className="mt-4 text-[12px] text-[#252A2E]/50 font-medium">
                  Precisa de informações ou orçamento? Fale com nossa equipe pelo WhatsApp.
                </p>
              </div>

              <div className="mt-auto space-y-4 pt-8 border-t border-[#F4F5F6]">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/60">
                  <span>Ver mais produtos de:</span>
                  <Link to="/marcas/$slug" params={{ slug: PRODUCT.brand.toLowerCase() }} className="text-[#174F8C] hover:underline">{PRODUCT.brand}</Link>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#252A2E]/60">
                  <span>Ver produtos em:</span>
                  <Link 
                    to="/categorias/$slug" 
                    params={{ slug: PRODUCT.category.toLowerCase().replace(/\s+/g, '-') }}
                    className="text-[#174F8C] hover:underline"
                  >
                    {PRODUCT.category}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Info Section */}
        <div className="bg-[#F9FAFB] py-20 border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              
              <div className="lg:col-span-2">
                <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-8 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-[#174F8C]"></div>
                  Informações do Produto
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                  {[
                    { label: 'Código ERP', value: PRODUCT.id },
                    { label: 'Referência', value: PRODUCT.ref },
                    { label: 'Fabricante', value: PRODUCT.brand },
                    { label: 'Categoria', value: PRODUCT.category },
                    { label: 'Unidade', value: PRODUCT.unit },
                    { label: 'NCM', value: PRODUCT.ncm },
                    { label: 'Código de Barras', value: PRODUCT.barcode },
                  ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-[#E5E7EB]/50">
                      <span className="text-[12px] font-bold text-[#252A2E]/40 uppercase tracking-widest mb-1 md:mb-0">{item.label}</span>
                      <span className="text-[13px] font-bold text-[#252A2E] uppercase">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {PRODUCT.description && (
                <div>
                  <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-8 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-[#174F8C]"></div>
                    Sobre este produto
                  </h2>
                  <div className="prose prose-sm max-w-none text-[#252A2E]/70 font-medium leading-relaxed">
                    <p>{PRODUCT.description}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="max-w-7xl mx-auto px-4 py-24">
          <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#252A2E] mb-12 text-center">
            Produtos Relacionados
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {RELATED_PRODUCTS.map((prod) => (
              <a key={prod.id} href={`/produtos/${prod.id}`} className="bg-white border border-[#E5E7EB] rounded-[2px] p-5 hover:border-[#174F8C] hover:shadow-lg transition duration-300 group flex flex-col h-full relative">
                <div className="relative w-full aspect-square mb-6 rounded-[2px] overflow-hidden bg-[#F4F5F6]/50">
                  <ImageWithFallback 
                    src={prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-[9px] font-black text-[#174F8C]/40 tracking-[0.2em] mb-2 uppercase">{prod.brand}</div>
                  <h3 className="font-bold text-[14px] mb-1 leading-tight text-[#252A2E] group-hover:text-[#174F8C] transition uppercase min-h-[40px] line-clamp-2">{prod.name}</h3>
                  <div className="text-[10px] text-[#252A2E]/40 mb-4 font-medium italic">Ref: {prod.ref}</div>
                  <div className="mt-auto pt-4 border-t border-[#F4F5F6]">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold mb-4 uppercase tracking-tighter ${prod.inStock ? 'text-[#2E8B57]' : 'text-[#252A2E]/40'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${prod.inStock ? 'bg-[#2E8B57] animate-pulse' : 'bg-[#E5E7EB]'}`}></div>
                      {prod.inStock ? 'Em estoque' : 'Consulte disponibilidade'}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="min-h-[32px] flex flex-col justify-end">
                        {prod.price ? (
                          <div className="text-lg font-black text-[#252A2E]">R$ {prod.price}</div>
                        ) : (
                          <div className="text-[14px] font-black text-[#252A2E]/30 uppercase tracking-[0.1em]">Consulte</div>
                        )}
                      </div>
                      <span className="w-full bg-[#174F8C] text-white py-2.5 rounded-[2px] hover:bg-[#123E70] transition flex items-center justify-center gap-2 group/btn shadow-sm">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Ver produto</span>
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition"/>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Compact Support Section */}
        <div className="bg-[#174F8C] py-12 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
            <img 
              src="https://pizzatto.com.br/wp-content/uploads/2023/10/bobininha-1.png" 
              alt="" 
              className="w-80 h-auto grayscale brightness-0 invert" 
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                Precisa de informações ou orçamento?
              </h3>
              <p className="text-white/70 font-medium">
                Fale com nossa equipe pelo WhatsApp.
              </p>
            </div>
            <button className="bg-[#2E8B57] text-white px-10 py-4 rounded-[2px] font-black uppercase tracking-[0.1em] text-[14px] hover:bg-[#256F46] transition shadow-xl flex items-center gap-3 whitespace-nowrap">
              <MessageCircle size={20} />
              FALAR NO WHATSAPP
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
