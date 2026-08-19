"use client";

import React from "react";
import { Product, calculatePrices } from "@/types";
import { Plus, Minus, Info, Eye } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
  quantity: number;
  rateUsdCop?: number;
  rateUsdVes?: number;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  rateUsdCop = 4000,
  rateUsdVes = 40,
  onUpdateQuantity,
  onOpenDetail,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isSelected = quantity > 0;

  const prices = calculatePrices(
    product.price,
    product.currency,
    rateUsdCop,
    rateUsdVes
  );

  return (
    <div
      className={`clay-card overflow-hidden transition-all duration-300 relative flex flex-col ${
        isSelected ? "ring-2 ring-blue-500/80 scale-[1.01]" : ""
      }`}
    >
      {/* Product Image Container */}
      <div
        onClick={() => onOpenDetail(product)}
        className="relative w-full h-48 bg-slate-100 cursor-pointer group overflow-hidden"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 480px) 100vw, 400px"
          loading="lazy"
        />

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white font-mono text-[11px] font-bold backdrop-blur-md shadow-sm">
            #{product.code}
          </span>
          {product.category_name && (
            <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-blue-900 text-[11px] font-bold backdrop-blur-md shadow-sm border border-white/60">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Zoom Hint */}
        <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3.5 h-3.5" />
        </div>

        {/* Stock Status Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-sm backdrop-blur-sm">
              Agotado
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold tracking-wide shadow-sm backdrop-blur-sm">
              Stock: {product.stock}
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-slate-900 text-base line-clamp-2 leading-snug cursor-pointer hover:text-blue-700 transition-colors"
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Multi-Currency Price Clay Display */}
        <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 shadow-inner">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Precio</span>
            <span className="text-base font-extrabold text-blue-700">
              {prices.usdFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-200/60 mt-1">
            <span className="text-slate-700 font-mono">{prices.copFormatted}</span>
            <span className="text-slate-700 font-mono">{prices.vesFormatted}</span>
          </div>
        </div>

        {/* Bottom Actions: Quick Detail & Quantity Controls */}
        <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between gap-2">
          <button
            onClick={() => onOpenDetail(product)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Info className="w-3.5 h-3.5" />
            Detalles
          </button>

          {/* Interactive Clay Quantity Controller */}
          {isOutOfStock ? (
            <span className="text-xs font-medium text-slate-400">No disponible</span>
          ) : quantity === 0 ? (
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="px-3.5 py-1.5 rounded-xl clay-btn-metallic text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              Elegir
            </button>
          ) : (
            <div className="flex items-center clay-inset px-1.5 py-0.5 gap-2">
              <button
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
                aria-label="Disminuir"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-extrabold text-xs text-blue-800 min-w-[14px] text-center">
                {quantity}
              </span>
              <button
                disabled={quantity >= product.stock}
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-700 disabled:opacity-30 active:scale-90 transition-transform"
                aria-label="Aumentar"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
