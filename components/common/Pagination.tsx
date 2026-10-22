'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageMeta } from '@/lib/types';

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.total_pages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= meta.total_pages; i++) {
    pages.push(i);
  }

  const startItem = (meta.current_page - 1) * meta.per_page + 1;
  const endItem = Math.min(meta.current_page * meta.per_page, meta.total_items);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 border-t border-slate-200 text-xs text-slate-500">
      <div>
        Menampilkan <span className="font-semibold text-slate-700">{startItem} - {endItem}</span> dari{' '}
        <span className="font-semibold text-slate-700">{meta.total_items}</span> item (Maks. 4 per halaman)
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
              p === meta.current_page
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.total_pages}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
