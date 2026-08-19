"use client";

import React from "react";
import { CartItem, calculatePrices } from "@/types";
import { MessageCircle, ShoppingBag, ChevronUp, ChevronDown, Trash2, Plus, Minus } from "lucide-react";

interface WhatsAppFloatingBarProps {
  cart: CartItem[];
  whatsappNumber: string;
  rateUsdCop?: number;
  rateUsdVes?: number;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onClearCart: () => void;
  isOpenDrawer: boolean;
  setIsOpenDrawer: (open: boolean) => void;
}

export const WhatsAppFloatingBar: React.FC<WhatsAppFloatingBarProps> = ({
  cart,
  whatsappNumber,
  rateUsdCop = 4000,
  rateUsdVes = 40,
  onUpdateQuantity,
  onClearCart,
  isOpenDrawer,
  setIsOpenDrawer,
}) => {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total in USD, COP, VES
  const totalUsd = cart.reduce((sum, item) => {
    const p = calculatePrices(item.product.price, item.product.currency, rateUsdCop, rateUsdVes);
    return sum + p.usd * item.quantity;
  }, 0);

  const totalCop = totalUsd * rateUsdCop;
  const totalVes = totalUsd * rateUsdVes;

  const totalUsdFormatted = `$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalCopFormatted = `$${Math.round(totalCop).toLocaleString("es-CO")} COP`;
  const totalVesFormatted = `Bs. ${totalVes.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSendToWhatsApp = () => {
    if (cart.length === 0) return;

    let message = `👋 *¡Hola! Vengo de su catálogo web y me interesa consultar por los siguientes productos:*\n\n`;
    message += `🛒 *LISTA DE CONSULTA (${totalItemsCount} ${totalItemsCount === 1 ? "artículo" : "artículos"}):*\n`;

    cart.forEach((item, index) => {
      const codeStr = item.product.code ? `[Cód: ${item.product.code}] ` : "";
      const p = calculatePrices(item.product.price, item.product.currency, rateUsdCop, rateUsdVes);
      message += `${index + 1}️⃣ ${codeStr}*${item.product.name}*\n   ↳ Cant: *${item.quantity}* unid. (${p.usdFormatted} / ${p.copFormatted} / ${p.vesFormatted})\n`;
    });

    if (totalUsd > 0) {
      message += `\n💰 *TOTAL ESTIMADO:*\n`;
      message += `• *${totalUsdFormatted}*\n`;
      message += `• *${totalCopFormatted}*\n`;
      message += `• *${totalVesFormatted}*\n`;
    }

    message += `\n💬 *¿Tienen disponibilidad inmediata y cuáles son los métodos de pago y entrega?* ¡Muchas gracias!`;

    const cleanedNumber = (whatsappNumber || "584120000000").replace(/[^0-9]/g, "");
    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanedNumber}?text=${encodedText}`;

    window.open(waUrl, "_blank");
  };

  return (
    <>
      {/* Selection Drawer Modal / Backdrop */}
      {isOpenDrawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setIsOpenDrawer(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-4 pb-4">
        {/* Expanded Drawer */}
        {isOpenDrawer && (
          <div
            className="mb-2 bg-white rounded-3xl p-4 shadow-2xl border border-white/90 max-h-96 overflow-y-auto flex flex-col space-y-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-800">
                  Tu Selección ({totalItemsCount})
                </h3>
              </div>
              <button
                onClick={onClearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              {cart.map((item) => {
                const p = calculatePrices(item.product.price, item.product.currency, rateUsdCop, rateUsdVes);
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-100"
                  >
                    <div className="flex-1 pr-2 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-blue-700 font-bold">
                        {p.usdFormatted} <span className="text-slate-400 font-normal">({p.copFormatted} | {p.vesFormatted})</span>
                      </p>
                    </div>

                    <div className="flex items-center clay-inset px-2 py-0.5 gap-2 shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded-md bg-white shadow-xs flex items-center justify-center text-slate-700 active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-extrabold text-xs text-blue-800 min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded-md bg-white shadow-xs flex items-center justify-center text-blue-700 disabled:opacity-30 active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Estimated Box */}
            {totalUsd > 0 && (
              <div className="pt-2 border-t border-slate-100 bg-blue-50/70 p-3 rounded-2xl">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Total Estimado:</span>
                  <span className="text-sm font-extrabold text-blue-700">{totalUsdFormatted}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>{totalCopFormatted}</span>
                  <span>{totalVesFormatted}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Floating Clay Bar */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.15),inset_1px_1px_2px_rgba(255,255,255,0.9)] border border-white flex items-center gap-2">
          {/* Toggle Selection Drawer Button */}
          <button
            onClick={() => setIsOpenDrawer(!isOpenDrawer)}
            disabled={totalItemsCount === 0}
            className={`px-3 py-3 rounded-2xl flex items-center gap-1.5 transition-all text-xs font-bold shrink-0 ${
              totalItemsCount > 0
                ? "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95"
                : "bg-slate-50 text-slate-400 opacity-60"
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-blue-700" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            {isOpenDrawer ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Big Metallic Blue WhatsApp Action Button */}
          <button
            onClick={handleSendToWhatsApp}
            disabled={totalItemsCount === 0}
            className={`flex-1 py-3.5 px-4 clay-btn-metallic font-extrabold text-sm flex items-center justify-center gap-2 tracking-wide transition-all ${
              totalItemsCount === 0 ? "opacity-50 grayscale cursor-not-allowed" : "animate-pulse-subtle"
            }`}
          >
            <MessageCircle className="w-5 h-5 fill-white/20 text-white" />
            <span>Preguntar en WhatsApp</span>
            {totalItemsCount > 0 && (
              <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-bold">
                ({totalItemsCount})
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
