"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Product, Category, CartItem } from "@/types";
import { Navbar } from "@/components/Navbar";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { WhatsAppFloatingBar } from "@/components/WhatsAppFloatingBar";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Loader2, PackageSearch, RefreshCw } from "lucide-react";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("584120000000");
  const [rateUsdCop, setRateUsdCop] = useState<number>(4000);
  const [rateUsdVes, setRateUsdVes] = useState<number>(40);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cart / Selection State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Detail Modal State
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First ensure DB is initialized
      await fetch("/api/init");

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
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar los productos. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== "all" && prod.category_id?.toString() !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = prod.name?.toLowerCase().includes(q);
        const matchCode = prod.code?.toLowerCase().includes(q);
        const matchDesc = prod.description?.toLowerCase().includes(q);
        const matchCat = prod.category_name?.toLowerCase().includes(q);
        return matchName || matchCode || matchDesc || matchCat;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const handleUpdateQuantity = (productId: number, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      if (qty <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      const existingIndex = prev.findIndex((item) => item.product.id === productId);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(qty, product.stock),
        };
        return next;
      } else {
        return [
          ...prev,
          { product, quantity: Math.min(qty, product.stock) },
        ];
      }
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setIsDrawerOpen(false);
  };

  const getProductQuantity = (productId: number) => {
    const found = cart.find((item) => item.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col">
      <AnalyticsTracker />
      {/* Sticky Header & Search */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCartDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Categories Horizontal Pills */}
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        totalProductsCount={products.length}
      />

      {/* Main Content Area */}
      <main className="px-4 py-3 flex-1">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-clay flex items-center justify-center mb-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Cargando catálogo...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <div className="clay-card p-6 text-center space-y-3">
              <p className="text-sm font-medium text-rose-600">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 rounded-xl clay-btn-metallic text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="clay-card p-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                No se encontraron productos
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? `No hay coincidencias para "${searchQuery}". Intenta con otro término o categoría.`
                  : "Aún no hay productos registrados en esta categoría."}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-xl clay-btn-secondary text-xs font-bold"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getProductQuantity(product.id)}
                rateUsdCop={rateUsdCop}
                rateUsdVes={rateUsdVes}
                onUpdateQuantity={handleUpdateQuantity}
                onOpenDetail={setDetailProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Action Bar */}
      <WhatsAppFloatingBar
        cart={cart}
        whatsappNumber={whatsappNumber}
        rateUsdCop={rateUsdCop}
        rateUsdVes={rateUsdVes}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        isOpenDrawer={isDrawerOpen}
        setIsOpenDrawer={setIsDrawerOpen}
      />

      {/* High-Res Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        quantity={detailProduct ? getProductQuantity(detailProduct.id) : 0}
        rateUsdCop={rateUsdCop}
        rateUsdVes={rateUsdVes}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}
