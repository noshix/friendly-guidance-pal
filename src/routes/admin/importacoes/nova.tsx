import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  FileUp, 
  UploadCloud, 
  ChevronRight, 
  AlertCircle,
  X
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/importacoes/nova")({
  component: NovaImportacao,
});

function NovaImportacao() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      navigate({ to: "/admin/importacoes/preview" });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="text-[12px] font-bold text-[#252A2E]/40 hover:text-[#252A2E] uppercase tracking-wider">Dashboard</Link>
        <ChevronRight size={14} className="text-[#E5E7EB]" />
        <span className="text-[12px] font-bold text-[#252A2E] uppercase tracking-wider">Nova Importação ERP</span>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[2px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#F4F5F6]">
          <h2 className="text-2xl font-black text-[#252A2E] uppercase tracking-tight mb-2">Importar produtos do ERP</h2>
          <p className="text-[14px] text-[#252A2E]/60">Envie a planilha XLSX exportada do ERP para analisar as alterações.</p>
        </div>

        <div className="p-12">
          {!isAnalyzing ? (
            <div className="space-y-8">
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-[2px] p-16 flex flex-col items-center justify-center bg-[#F9FAFB] hover:border-[#174F8C] transition cursor-pointer group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-[#E5E7EB] group-hover:scale-110 transition duration-300">
                  <UploadCloud size={32} className="text-[#174F8C]" />
                </div>
                <p className="text-[14px] font-bold text-[#252A2E] uppercase tracking-wider mb-1">Selecionar Arquivo XLSX</p>
                <p className="text-[12px] text-[#252A2E]/40 font-medium tracking-wide italic">ou arraste e solte o arquivo aqui</p>
              </div>

              <div className="bg-[#F4F5F6] p-6 rounded-[2px] flex gap-4">
                <div className="shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB]">
                  <AlertCircle size={16} className="text-[#F5C400]" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-black uppercase tracking-wider text-[#252A2E]">Antes de importar</h4>
                  <ul className="text-[13px] text-[#252A2E]/60 space-y-1 font-medium list-disc list-inside">
                    <li>Utilize arquivo XLSX;</li>
                    <li>Confira se é a exportação correta do ERP;</li>
                    <li>Nenhuma alteração será aplicada antes da confirmação técnica na próxima tela.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={handleAnalyze}
                  className="bg-[#174F8C] text-white px-10 py-4 rounded-[2px] font-bold text-[13px] uppercase tracking-widest hover:bg-[#123E70] transition shadow-lg flex items-center gap-3"
                >
                  Analisar Planilha
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="w-12 h-12 border-4 border-[#174F8C] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-[18px] font-black uppercase tracking-tight text-[#252A2E] mb-2">Analisando planilha...</h3>
                <p className="text-[14px] text-[#252A2E]/60 font-medium italic">Isso pode levar alguns instantes enquanto processamos os dados do ERP.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
