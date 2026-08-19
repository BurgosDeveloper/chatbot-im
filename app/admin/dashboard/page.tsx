"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product, Category, calculatePrices } from "@/types";
import { InactivityTracker } from "@/components/InactivityTracker";
import { AdminProductModal } from "@/components/AdminProductModal";
import { AdminCategoryModal } from "@/components/AdminCategoryModal";
import {
  Package,
  Layers,
  Settings,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  ExternalLink,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  Lock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "settings">("products");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [rateUsdCop, setRateUsdCop] = useState<number | string>(4000);
  const [rateUsdVes, setRateUsdVes] = useState<number | string>(40);
  const [searchProduct, setSearchProduct] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Settings state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [settingsMsg, setSettingsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Verify Auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setAdminUser(data.user?.username || "Admin");
        loadData();
      } catch (err) {
        router.push("/admin/login");
      }
    };
    checkAuth();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, setRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
        fetch("/api/settings"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const setData = await setRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (catData.categories) setCategories(catData.categories);
      if (setData.settings) {
        if (setData.settings.whatsapp_number) setWhatsappNumber(setData.settings.whatsapp_number);
        if (setData.settings.rate_usd_cop) setRateUsdCop(setData.settings.rate_usd_cop);
        if (setData.settings.rate_usd_ves) setRateUsdVes(setData.settings.rate_usd_ves);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (e) {
      router.push("/admin/login");
    }
  };

  // Product Delete
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el producto "${product.name}"?\nEsta acción lo borrará de PostgreSQL y limpiará su imagen en Cloudinary.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al eliminar producto");
      }
      loadData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar producto");
    }
  };

  // Category Delete
  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la categoría "${category.name}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al eliminar categoría");
      }
      loadData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar categoría");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);

    try {
      const payload: any = {
        whatsapp_number: whatsappNumber,
        rate_usd_cop: parseFloat(rateUsdCop.toString()) || 4000,
        rate_usd_ves: parseFloat(rateUsdVes.toString()) || 40,
      };

      if (newPass) {
        payload.current_password = currentPass;
        payload.new_password = newPass;
      }

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar ajustes");
      }

      setSettingsMsg({ type: "success", text: "Ajustes y tasas guardados correctamente" });
      setCurrentPass("");
      setNewPass("");
    } catch (err: any) {
      setSettingsMsg({ type: "error", text: err.message || "Error al guardar ajustes" });
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!searchProduct.trim()) return true;
    const q = searchProduct.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.category_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col px-4 pt-4 pb-12">
      {/* 15-Minute Inactivity Auto Logout */}
      <InactivityTracker timeoutMinutes={15} />

      {/* Admin Topbar */}
      <header className="clay-card p-4 mb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
            Admin Panel
          </span>
          <h1 className="text-base font-extrabold text-slate-900 mt-0.5">
            Hola, {adminUser}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl clay-btn-secondary text-slate-600 hover:text-blue-600"
            title="Ver catálogo público"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-transform"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "products" ? "clay-pill-active" : "clay-pill-inactive"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Productos ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "categories" ? "clay-pill-active" : "clay-pill-inactive"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categorías ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "settings" ? "clay-pill-active" : "clay-pill-inactive"
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Main Tabs Content */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs font-semibold text-slate-500">Cargando datos...</p>
        </div>
      ) : activeTab === "products" ? (
        /* TAB PRODUCTOS */
        <div className="space-y-3 flex-1 flex flex-col">
          {/* Action Bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center clay-inset px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Buscar por código o nombre..."
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
              />
            </div>
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl clay-btn-metallic text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <div className="clay-card p-8 text-center my-6 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No hay productos registrados</p>
              <p className="text-[11px] text-slate-400">
                Presiona &quot;Nuevo&quot; para cargar tu primer producto con foto en Cloudinary.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProducts.map((p) => {
                const prices = calculatePrices(
                  p.price,
                  p.currency,
                  Number(rateUsdCop),
                  Number(rateUsdVes)
                );

                return (
                  <div
                    key={p.id}
                    className="clay-card p-3 flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          #{p.code}
                        </span>
                        {p.category_name && (
                          <span className="text-[10px] text-blue-700 font-semibold truncate">
                            {p.category_name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span
                          className={`font-extrabold px-1.5 py-0.5 rounded-full ${
                            p.stock > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          Stock: {p.stock}
                        </span>
                        <span className="font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-full">
                          {prices.usdFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setProductToEdit(p);
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-90"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "categories" ? (
        /* TAB CATEGORÍAS */
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Gestión de Categorías
            </h2>
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl clay-btn-metallic text-xs font-bold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="clay-card p-8 text-center my-6 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No hay categorías</p>
              <p className="text-[11px] text-slate-400">Crea categorías para organizar tus productos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="clay-card p-3.5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {c.product_count || 0} {(c.product_count === 1) ? "producto vinculado" : "productos vinculados"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setCategoryToEdit(c);
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-90"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-90"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB AJUSTES */
        <div className="space-y-4 flex-1">
          <div className="clay-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Ajustes de Tienda, Tasas & Seguridad
            </h2>

            {settingsMsg && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  settingsMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-700"
                }`}
              >
                {settingsMsg.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{settingsMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* WhatsApp Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Número de WhatsApp Receptor (con código de país)
                </label>
                <div className="flex items-center clay-inset px-3 py-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Ej: 584121234567"
                    className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Exchange Rates Configuration */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-sky-50/80 border border-blue-100 space-y-3">
                <div className="flex items-center gap-1.5 text-blue-900">
                  <TrendingUp className="w-4 h-4" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide">
                    Tasas de Cambio de Moneda (Base: 1 USD)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      1 USD en Pesos (COP)
                    </label>
                    <div className="flex items-center clay-inset px-3 py-2 bg-white">
                      <span className="text-xs font-bold text-slate-400 mr-1">$</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={rateUsdCop}
                        onChange={(e) => setRateUsdCop(e.target.value)}
                        placeholder="Ej: 4000"
                        className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      1 USD en Bolívares (VES / Bs.)
                    </label>
                    <div className="flex items-center clay-inset px-3 py-2 bg-white">
                      <span className="text-xs font-bold text-slate-400 mr-1">Bs.</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={rateUsdVes}
                        onChange={(e) => setRateUsdVes(e.target.value)}
                        placeholder="Ej: 40"
                        className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Estas tasas calculan y muestran automáticamente los precios en Dólares ($), Pesos ($ COP) y Bolívares (Bs.) en todo el catálogo.
                </p>
              </div>

              {/* Password Change */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Cambiar Contraseña de Administrador
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="flex items-center clay-inset px-3 py-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="flex items-center clay-inset px-3 py-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 rounded-xl clay-btn-metallic text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando ajustes...
                    </>
                  ) : (
                    "Guardar Ajustes y Tasas"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSaved={loadData}
      />

      {/* Category Create/Edit Modal */}
      <AdminCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSaved={loadData}
      />
    </div>
  );
}
