"use client";

import React, { useState, useEffect } from "react";
import { Product, Category } from "@/types";
import { X, UploadCloud, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import Image from "next/image";

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: Category[];
  onSaved: () => void;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCode(productToEdit.code);
      setCategoryId(productToEdit.category_id?.toString() || "");
      setStock(productToEdit.stock);
      setDescription(productToEdit.description || "");
      setImageUrl(productToEdit.image_url);
      setImagePublicId(productToEdit.image_public_id);
      setImagePreview(productToEdit.image_url);
    } else {
      setName("");
      setCode("");
      setCategoryId(categories[0]?.id.toString() || "");
      setStock(1);
      setDescription("");
      setImageUrl("");
      setImagePublicId("");
      setImagePreview(null);
    }
    setError(null);
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  // Handle image selection and upload to Cloudinary via server API
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no debe superar los 10 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setUploadingImage(true);
      setError(null);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Error al subir la imagen a Cloudinary");
        }

        setImageUrl(data.url);
        setImagePublicId(data.public_id);
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "Error al subir imagen");
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !imageUrl || !imagePublicId) {
      setError("Todos los campos obligatorios deben estar completos, incluida la imagen.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        stock: Number(stock),
        description: description.trim(),
        image_url: imageUrl,
        image_public_id: imagePublicId,
      };

      const url = productToEdit ? `/api/products/${productToEdit.id}` : "/api/products";
      const method = productToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el producto");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Save product error:", err);
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/80 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {productToEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-xs text-slate-500">
              Gestión directa en PostgreSQL & Cloudinary
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cloudinary Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Foto del Producto *
            </label>

            <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
              {imagePreview ? (
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span>Subiendo a Cloudinary...</span>
                    </div>
                  )}
                  <label
                    htmlFor="product-image-upload"
                    className="absolute bottom-2 right-2 px-3 py-1 bg-white/90 shadow text-slate-800 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-white active:scale-95 transition-transform"
                  >
                    Cambiar Foto
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="product-image-upload"
                  className="flex flex-col items-center justify-center py-6 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-inner">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    Toca para subir una foto
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG o WEBP (Cloudinary)
                  </span>
                </label>
              )}
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Camisa Azul Oxford"
                className="w-full clay-inset px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código Único *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: CAM-001"
                className="w-full clay-inset px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl uppercase"
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full clay-inset px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl bg-slate-50"
              >
                <option value="">Sin Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cantidad Disponible (Stock) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                className="w-full clay-inset px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción del Producto
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles, materiales, tallas o especificaciones del producto..."
              className="w-full clay-inset px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl clay-btn-secondary text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-5 py-2.5 rounded-xl clay-btn-metallic text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Producto"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
