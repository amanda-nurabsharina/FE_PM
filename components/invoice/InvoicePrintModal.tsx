'use client';

import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Invoice, UserProfile } from '@/lib/types';
import InvoiceSheetA4 from '../pdf/InvoiceSheetA4';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  owner: UserProfile | null;
}

export default function InvoicePrintModal({
  isOpen,
  onClose,
  invoice,
  owner,
}: InvoicePrintModalProps) {
  if (!isOpen || !invoice || !owner) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-100 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Pratinjau Dokumen Invoice A4
            </h3>
            <p className="text-xs text-slate-500">Nomor: {invoice.invoice_number}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak / Unduh PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 flex justify-center">
          <div className="bg-white shadow-xl rounded-sm">
            <InvoiceSheetA4 invoice={invoice} owner={owner} />
          </div>
        </div>
      </div>
    </div>
  );
}
