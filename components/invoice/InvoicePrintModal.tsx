'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Invoice, UserProfile } from '@/lib/types';
import { api, getStoredUser, setStoredUser } from '@/lib/api-client';
import InvoiceSheetA4 from '../pdf/InvoiceSheetA4';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  owner: UserProfile | null;
  onInvoiceUpdated?: (inv: Invoice) => void;
}

export default function InvoicePrintModal({
  isOpen,
  onClose,
  invoice,
  owner,
  onInvoiceUpdated,
}: InvoicePrintModalProps) {
  const [currentOwner, setCurrentOwner] = useState<UserProfile | null>(() => owner || getStoredUser());
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(invoice);
  const [taxToggling, setTaxToggling] = useState(false);

  useEffect(() => {
    setCurrentInvoice(invoice);
  }, [invoice]);

  useEffect(() => {
    if (owner) {
      setCurrentOwner(owner);
    }
  }, [owner]);

  useEffect(() => {
    if (isOpen) {
      api.getSettings().then((data) => {
        if (data) {
          setCurrentOwner(data);
          setStoredUser(data);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !invoice || !currentInvoice) return null;
  const effectiveOwner = currentOwner || owner || getStoredUser();
  if (!effectiveOwner) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleToggleTax = async () => {
    if (!currentInvoice || currentInvoice.status === 'paid' || taxToggling) return;

    // Optimistic recalculation for instant feedback (Poin 9 Revisi)
    const isNowActive = !currentInvoice.include_tax;
    const rate = currentInvoice.tax_rate > 0 ? currentInvoice.tax_rate : (effectiveOwner?.tax_rate !== undefined ? effectiveOwner.tax_rate : 11);
    const newTaxAmount = isNowActive ? Math.round((currentInvoice.subtotal * rate) / 100) : 0;
    const newGrandTotal = currentInvoice.subtotal + newTaxAmount;

    const optimisticInv: Invoice = {
      ...currentInvoice,
      include_tax: isNowActive,
      tax_rate: isNowActive ? rate : 0,
      tax_amount: newTaxAmount,
      grand_total: newGrandTotal,
    };
    setCurrentInvoice(optimisticInv);

    setTaxToggling(true);
    try {
      const updatedInv = await api.toggleInvoiceTax(currentInvoice.id);
      if (updatedInv) {
        setCurrentInvoice(updatedInv);
      }
      if (onInvoiceUpdated) {
        onInvoiceUpdated(updatedInv || optimisticInv);
      }
    } catch (err: any) {
      // Revert optimistic if error
      setCurrentInvoice(currentInvoice);
      alert(err.message || 'Gagal mengubah status PPN');
    } finally {
      setTaxToggling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-100 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
              REVIEW DOKUMEN TAGIHAN (A4)
            </span>
            <h3 className="font-mono font-bold text-slate-900 text-sm sm:text-base mt-0.5">
              {currentInvoice.invoice_number}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Unduh PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak Print
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
            <InvoiceSheetA4
              invoice={currentInvoice}
              owner={effectiveOwner}
              onToggleTax={handleToggleTax}
              taxToggling={taxToggling}
            />
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="no-print px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Format Standar Dokumen A4 Resmi</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Unduh PDF (.pdf)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
