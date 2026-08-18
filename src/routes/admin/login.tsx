import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logoAsset from "@/assets/logo.asset.json";
import { useState } from "react";
import { LayoutDashboard, Package, FileUp, Settings, LogOut, ChevronRight, Search, Plus, Filter, Check, X, Bell } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F4F5F6] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[2px] shadow-xl border border-[#E5E7EB] w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logoAsset.url} alt="Pizzatto" className="h-20" />
        </div>
        <h2 className="text-[18px] font-black text-[#252A2E] text-center mb-2 uppercase">Área Administrativa</h2>
        <p className="text-[13px] text-[#252A2E]/60 text-center mb-8">Acesso restrito à equipe administrativa.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#252A2E]/70 uppercase tracking-wider mb-1">Usuário</label>
            <input type="text" className="w-full border border-[#E5E7EB] p-3 rounded-[2px] focus:border-[#174F8C] outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#252A2E]/70 uppercase tracking-wider mb-1">Senha</label>
            <input type="password" className="w-full border border-[#E5E7EB] p-3 rounded-[2px] focus:border-[#174F8C] outline-none" />
          </div>
          <button 
            onClick={() => navigate({ to: "/admin" })}
            className="w-full bg-[#174F8C] text-white py-3 rounded-[2px] font-bold uppercase tracking-widest hover:bg-[#123E70] transition"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
