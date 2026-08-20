"use client";

import React from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  onOpenCartDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  cartCount,
  onOpenCartDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-3 backdrop-blur-md bg-[#f0f4f8]/90">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-clay border border-white/90 overflow-hidden shrink-0">
            <Image
              src="/icono.png"
              alt="Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-metallic">
              Catálogo Móvil
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Productos Disponibles
            </p>
          </div>
        </div>

        {/* Quick Cart Pill Indicator */}
        {cartCount > 0 && (
          <button
            onClick={onOpenCartDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-clay-sm border border-white/80 active:scale-95 transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-700">
              {cartCount} {cartCount === 1 ? "elegido" : "elegidos"}
            </span>
          </button>
        )}
      </div>

      {/* Search Input Clay Inset */}
      <div className="relative">
        <div className="flex items-center clay-inset px-3.5 py-2.5">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código o detalle..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 active:scale-90"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
