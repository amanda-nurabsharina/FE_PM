'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { formatIDR, formatShortDate } from '@/lib/formatters';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'endorse':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'barter':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'endorse':
        return 'Endorse Campaign';
      case 'barter':
        return 'Barter Konten';
      default:
        return 'Tugas Lainnya';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          dot: 'bg-emerald-500',
          label: 'SUDAH DIBAYAR',
          textClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'waiting_payment':
        return {
          dot: 'bg-amber-500',
          label: 'PENDING',
          textClass: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'posting':
        return {
          dot: 'bg-blue-500',
          label: 'POSTING',
          textClass: 'text-blue-700 bg-blue-50 border-blue-200',
        };
      case 'completed':
        return {
          dot: 'bg-emerald-500',
          label: 'SELESAI',
          textClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      default:
        return {
          dot: 'bg-slate-400',
          label: 'DRAFT',
          textClass: 'text-slate-600 bg-slate-50 border-slate-200',
        };
    }
  };

  const statusInfo = getStatusBadge(task.status);

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col gap-3 group"
    >
      {/* Top Row: Type, Brand, Title, and Fee */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeColor(task.type)}`}>
              {getTypeLabel(task.type)}
            </span>
            <span className="text-xs text-slate-500 font-medium truncate">• {task.brand}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {task.title}
          </h4>
        </div>

        {task.type !== 'other' && task.fee_or_value > 0 && (
          <div className="text-right shrink-0">
            <span className="text-sm font-black font-mono text-emerald-600">
              {formatIDR(task.fee_or_value)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Status Badge and Due Date */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
          <span className={`text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md border ${statusInfo.textClass}`}>
            {statusInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px] sm:text-xs">
          <span>Due: {formatShortDate(task.due_date)}</span>
          <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
            Lihat Detail →
          </span>
        </div>
      </div>
    </div>
  );
}
