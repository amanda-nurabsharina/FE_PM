'use client';

import React, { useState, useEffect } from 'react';
import { Save, User, Building, CreditCard, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api, getStoredUser, setStoredUser } from '@/lib/api-client';
import { UserProfile } from '@/lib/types';
import LogoUploader from '@/components/pengaturan/LogoUploader';
import SignatureCanvas from '@/components/pengaturan/SignatureCanvas';

export default function PengaturanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [npwp, setNpwp] = useState('');
  const [taxRate, setTaxRate] = useState<number>(11);
  const [logoUrl, setLogoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setProfile(data);
      setName(data.name || '');
      setEmail(data.email || '');
      setAvatarUrl(data.avatar_url || '');
      setCompany(data.company || '');
      setPhone(data.phone || '');
      setCompanyAddress(data.company_address || '');
      setNpwp(data.npwp || '');
      setTaxRate(data.tax_rate !== undefined ? data.tax_rate : 11);
      setLogoUrl(data.logo_url || '');
      setSignatureUrl(data.signature_url || '');
      setBankName(data.bank_name || '');
      setBankAccountNumber(data.bank_account_number || '');
      setBankAccountHolder(data.bank_account_holder || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSuccessToast(false);

    if (!name.trim()) {
      setError('Nama lengkap owner wajib diisi');
      setSaving(false);
      return;
    }

    try {
      const updated = await api.updateSettings({
        name,
        company,
        phone,
        company_address: companyAddress,
        npwp,
        tax_rate: Number(taxRate),
        logo_url: logoUrl,
        signature_url: signatureUrl,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_holder: bankAccountHolder,
        avatar_url: avatarUrl,
      });

      setProfile(updated);
      setStoredUser(updated);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400">Memuat profil studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Pengaturan & Profil</h2>
          <p className="text-xs text-slate-500 font-medium">
            Kelola profil kreator, parameter pajak PPN, tanda tangan digital, dan rekening penagihan.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-bold shadow-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan profil, logo, dan tanda tangan digital berhasil diperbarui secara instan!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Card 1: Profil & Identitas Owner */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1. Profil & Identitas Owner
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Owner *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Owner</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">URL Foto Profil (Avatar)</label>
              <input
                type="text"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Identitas Studio, NPWP & PPN Default */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              2. Identitas Studio, NPWP & PPN Default
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Studio</label>
              <input
                type="text"
                placeholder="Contoh: Reza Studio (Affiliator Network)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">No. Telepon / WhatsApp Studio</label>
              <input
                type="text"
                placeholder="+62 8..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Pokok Wajib Pajak (NPWP)</label>
              <input
                type="text"
                placeholder="09.254.678.9-012.000"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tarif PPN Default (%) (Pintasan: 0% / 11% / 12%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold"
                />
                <div className="flex items-center gap-1">
                  {[0, 11, 12].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTaxRate(rate)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        taxRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Studio</label>
              <textarea
                rows={2}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Logo Studio */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
          <LogoUploader
            logoUrl={logoUrl}
            companyName={company}
            onChange={(url) => setLogoUrl(url)}
          />
        </div>

        {/* Card 4: Tanda Tangan Digital */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
          <SignatureCanvas
            value={signatureUrl}
            onChange={(url) => setSignatureUrl(url)}
          />
        </div>

        {/* Card 5: Rekening Pembayaran Bank */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              5. Rekening Pembayaran Bank (Footer Invoice)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bank</label>
              <input
                type="text"
                placeholder="Bank Central Asia (BCA)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                placeholder="8830192831"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Atas Nama Pemilik</label>
              <input
                type="text"
                placeholder="Reza Winata"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil, Logo & Tanda Tangan'}
          </button>
        </div>
      </form>
    </div>
  );
}
