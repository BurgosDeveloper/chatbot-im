"use client";

import React from "react";
import { Product, calculatePrices } from "@/types";
import { X, CheckCircle2, AlertCircle, Plus, Minus, DollarSign } from "lucide-react";
import Image from "next/image";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  quantity: number;
  rateUsdCop?: number;
  rateUsdVes?: number;
  onUpdateQuantity: (productId: number, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  quantity,
  rateUsdCop = 4000,
  rateUsdVes = 40,
  onUpdateQuantity,
}) => {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const prices = calculatePrices(
    product.price,
    product.currency,
    rateUsdCop,
    rateUsdVes
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/80 overflow-hidden max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="relative">
          <div className="relative w-full h-72 bg-slate-100 flex items-center justify-center overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 100vw, 400px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 shadow-md backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-black active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges Floating on Image */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white font-mono font-bold tracking-wide backdrop-blur-md">
              CÓD: {product.code}
            </span>
            {product.category_name && (
              <span className="px-3 py-1 rounded-full bg-white/90 text-blue-800 font-bold backdrop-blur-md shadow-sm">
                {product.category_name}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Agotado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disponible ({product.stock} unid.)
                </span>
              )}
            </div>
          </div>

          {/* Multi-Currency Price Box */}
          <div className="clay-card p-3.5 bg-gradient-to-r from-blue-50/60 to-sky-50/60 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-900/60 tracking-wider">
              Precio en Monedas
            </span>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              <div className="bg-white/80 p-2 rounded-xl border border-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block">USD</span>
                <span className="text-sm font-extrabold text-blue-800">{prices.usdFormatted}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block">COP</span>
                <span className="text-xs font-extrabold text-slate-800">{prices.copFormatted}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl border border-white shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block">VES</span>
                <span className="text-xs font-extrabold text-slate-800">{prices.vesFormatted}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {product.description ? (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Descripción
              </h3>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin descripción detallada.</p>
          )}

          {/* Quantity Selector & WhatsApp Add Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center clay-inset px-2 py-1 gap-3">
              <button
                disabled={quantity <= 0}
                onClick={() => onUpdateQuantity(product.id, Math.max(0, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 disabled:opacity-30 active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-base text-slate-900 min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                disabled={isOutOfStock || quantity >= product.stock}
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-700 disabled:opacity-30 active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                if (quantity === 0 && !isOutOfStock) {
                  onUpdateQuantity(product.id, 1);
                }
                onClose();
              }}
              className="flex-1 py-3 px-4 clay-btn-metallic text-sm font-bold flex items-center justify-center gap-2"
            >
              {quantity > 0 ? "Listo en Selección" : "+ Agregar a Consulta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
