'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Task, PageMeta, MonthOption } from '@/lib/types';
import TaskCard from '@/components/tugas/TaskCard';
import TaskCreateModal from '@/components/tugas/TaskCreateModal';
import TaskDetailModal from '@/components/tugas/TaskDetailModal';
import PaymentConfirmModal from '@/components/tugas/PaymentConfirmModal';
import LightboxModal from '@/components/common/LightboxModal';
import Pagination from '@/components/common/Pagination';

export default function TugasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('0-0'); // 'month-year'
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PageMeta>({ current_page: 1, per_page: 4, total_items: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payTargetTask, setPayTargetTask] = useState<Task | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string>('');

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [selectedMonth, selectedType, selectedStatus, page]);

  const loadMonths = async () => {
    try {
      const data = await api.getMonths();
      setMonths(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [m, y] = selectedMonth.split('-').map(Number);
      const data = await api.getTasks({
        month: m > 0 ? m : undefined,
        year: y > 0 ? y : undefined,
        type: selectedType,
        status: selectedStatus,
        page,
        limit: 4, // BR-01
      });
      setTasks(data.items || []);
      setMeta(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Status chips dynamically adapting per type tab (BR-02)
  const getStatusChips = () => {
    switch (selectedType) {
      case 'endorse':
        return [
          { value: 'all', label: 'Semua Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'waiting_payment', label: 'Pending' },
          { value: 'paid', label: 'Sudah Dibayar' },
        ];
      case 'barter':
        return [
          { value: 'all', label: 'Semua Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'posting', label: 'Posting' },
        ];
      case 'other':
        return [
          { value: 'all', label: 'Semua Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'completed', label: 'Selesai' },
        ];
      default:
        return [
          { value: 'all', label: 'Semua Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Selesai / Posting / Dibayar' },
        ];
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedStatus('all'); // BR-02: reset status to 'Semua Status'
    setPage(1);
  };

  const handleCardClick = (t: Task) => {
    setSelectedTask(t);
    setIsDetailOpen(true);
  };

  const handleTriggerPayment = (t: Task) => {
    setIsDetailOpen(false);
    setPayTargetTask(t);
    setIsPayModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pusat Tugas</h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola progress tugas spesifik dan trigger pembayaran otomatis.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Tambah Tugas
        </button>
      </div>

      {/* 2. Bilah Filter Periode Bulan (Dropdown Dinamis) */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Filter Periode Bulan:</span>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="0-0">Semua Bulan</option>
          {months.map((m) => (
            <option key={`${m.month}-${m.year}`} value={`${m.month}-${m.year}`}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Tab Filter 4 Tipe Tugas (Grid 4 Tombol) */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'endorse', label: 'Endorse' },
          { key: 'barter', label: 'Barter' },
          { key: 'other', label: 'Lainnya' },
        ].map((tab) => {
          const isActive = selectedType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition-all text-center ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Baris Chip Filter Status Dinamis */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {getStatusChips().map((chip) => {
          const isActive = selectedStatus === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => {
                setSelectedStatus(chip.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-100'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 5. Daftar Kartu Tugas (Maksimal 4 Kartu per Halaman) */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Memuat daftar tugas...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
          <Filter className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Tidak ada tugas ditemukan</h4>
          <p className="text-xs text-slate-400">Sesuaikan filter atau buat tugas kampanye baru</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => handleCardClick(task)} />
          ))}

          {/* Paginasi 4 Item */}
          <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Modals */}
      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          loadTasks();
          loadMonths();
        }}
      />

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={selectedTask}
        onRefresh={() => {
          loadTasks();
          if (selectedTask) {
            api.getTaskById(selectedTask.id).then(setSelectedTask).catch(console.error);
          }
        }}
        onTriggerPayment={handleTriggerPayment}
        onViewProof={(url) => setLightboxUrl(url)}
      />

      <PaymentConfirmModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setPayTargetTask(null);
        }}
        targetTask={payTargetTask}
        onSuccess={() => {
          loadTasks();
        }}
      />

      <LightboxModal
        isOpen={!!lightboxUrl}
        onClose={() => setLightboxUrl('')}
        imageUrl={lightboxUrl}
        title="Foto Bukti Pembayaran / Transfer"
      />
    </div>
  );
}
