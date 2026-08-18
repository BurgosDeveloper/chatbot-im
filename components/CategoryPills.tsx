"use client";

import React from "react";
import { Category } from "@/types";
import { Layers } from "lucide-react";

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  totalProductsCount: number;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}) => {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {/* 'Todos' Pill */}
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
            selectedCategory === "all"
              ? "clay-pill-active scale-[1.02]"
              : "clay-pill-inactive"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Todos</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategory === "all"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id.toString();
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id.toString())}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? "clay-pill-active scale-[1.02]"
                  : "clay-pill-inactive"
              }`}
            >
              <span>{cat.name}</span>
              {cat.product_count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cat.product_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
