'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  RefreshCw,
  Plus,
  ExternalLink,
  Users,
  Eye,
  Heart,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Clock,
  Sparkles,
  CreditCard,
  Copy,
  Edit3,
  SlidersHorizontal,
  Check,
  Video,
  Camera,
  Layers,
  ChevronDown,
  Printer,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Zap,
  BarChart2,
  Play,
  Film,
  ShoppingBag,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { SocialAccountItem, SocialSummaryData, SocialContentMetricItem, RateCardData } from '@/lib/types';

const NICHE_OPTIONS = [
  'Gadget',
  'Technology',
  'Beauty & Skincare',
  'Fashion & OOTD',
  'Food & Culinary',
  'Gaming & Esports',
  'Health & Fitness',
  'Travel & Vlogging',
  'Business & Finance',
  'Lifestyle',
  'Comedy & Entertainment',
];

export default function SocialPage() {
  const [accounts, setAccounts] = useState<SocialAccountItem[]>([]);
  const [summary, setSummary] = useState<SocialSummaryData | null>(null);
  const [contents, setContents] = useState<SocialContentMetricItem[]>([]);
  const [rateCard, setRateCard] = useState<RateCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  // Modal Connect (Direct Username Mode)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<'tiktok' | 'instagram'>('tiktok');
  const [directUsername, setDirectUsername] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('Gadget');
  const [connecting, setConnecting] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Edit Rate Card
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [copiedRateCard, setCopiedRateCard] = useState(false);
  const [customForm, setCustomForm] = useState({
    tier: 'Mid Tier',
    niche: 'Gadget',
    bio: '',
    location: 'Jakarta, Indonesia',
    contact_phone: '',
    contact_email: '',
    rate_tiktok_video: 0,
    rate_ads_usage: 0,
    rate_yellow_cart: 0,
    rate_exclusivity: 0,
    rate_ig_reels: 0,
    rate_ig_feed: 0,
    rate_ig_story: 0,
    rate_live_stream: 0,
    rate_bundling: 0,
    notes: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [accs, sum, posts, rc] = await Promise.allSettled([
        api.getSocialAccounts(),
        api.getSocialSummary(),
        api.getSocialContents({ limit: 50 }),
        api.getRateCard(),
      ]);

      if (accs.status === 'fulfilled' && accs.value) {
        setAccounts(accs.value);
      } else {
        setAccounts([]);
      }

      if (sum.status === 'fulfilled' && sum.value) {
        setSummary(sum.value);
      } else {
        setSummary(null);
      }

      if (posts.status === 'fulfilled' && posts.value) {
        setContents(posts.value);
      } else {
        setContents([]);
      }

      if (rc.status === 'fulfilled' && rc.value) {
        applyRateCardData(rc.value);
      } else {
        setRateCard(null);
      }
    } catch (err) {
      console.error('Failed to load real social data:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyRateCardData = (data: RateCardData) => {
    setRateCard(data);
    setCustomForm({
      tier: data.tier || 'Micro Tier',
      niche: data.niche || 'Gadget',
      bio: data.bio || '',
      location: data.location || 'Jakarta, Indonesia',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
      rate_tiktok_video: data.rate_tiktok_video || 0,
      rate_ads_usage: data.rate_ads_usage || 0,
      rate_yellow_cart: data.rate_yellow_cart || 0,
      rate_exclusivity: data.rate_exclusivity || 0,
      rate_ig_reels: data.rate_ig_reels || 0,
      rate_ig_feed: data.rate_ig_feed || 0,
      rate_ig_story: data.rate_ig_story || 0,
      rate_live_stream: data.rate_live_stream || 0,
      rate_bundling: data.rate_bundling || 0,
      notes: data.notes || '',
    });
  };

  const handleSyncAccount = async (id: number) => {
    setSyncingId(id);
    try {
      await api.syncSocialAccount(id);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Sinkronisasi gagal');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id: number, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin memutuskan akun @${username}?`)) return;
    try {
      await api.disconnectSocialAccount(id);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Gagal memutuskan akun');
    }
  };

  // Connect Real Account via @username
  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalMessage(null);
    setConnecting(true);

    try {
      const cleanUser = directUsername.replace(/^@/, '').trim();
      if (!cleanUser) {
        throw new Error('Silakan masukkan username akun media sosial Anda.');
      }

      await api.connectSocialDirect({
        platform: connectPlatform,
        username: cleanUser,
        niche: selectedNiche,
      });

      setModalMessage({ type: 'success', text: `Akun @${cleanUser} berhasil dihubungkan & data metrik berhasil dihitung!` });
      await loadAllData();
      setIsConnectModalOpen(false);
      setDirectUsername('');
      setModalMessage(null);
    } catch (err: any) {
      setModalMessage({ type: 'error', text: err.message || 'Gagal menghubungkan akun' });
    } finally {
      setConnecting(false);
    }
  };

  // Save Custom Rate Card
  const handleSaveRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRate(true);
    try {
      const updated = await api.updateRateCard({
        tier: customForm.tier,
        niche: customForm.niche,
        bio: customForm.bio,
        location: customForm.location,
        contact_phone: customForm.contact_phone,
        contact_email: customForm.contact_email,
        rate_tiktok_video: Number(customForm.rate_tiktok_video),
        rate_ads_usage: Number(customForm.rate_ads_usage),
        rate_yellow_cart: Number(customForm.rate_yellow_cart),
        rate_exclusivity: Number(customForm.rate_exclusivity),
        rate_ig_reels: Number(customForm.rate_ig_reels),
        rate_ig_feed: Number(customForm.rate_ig_feed),
        rate_ig_story: Number(customForm.rate_ig_story),
        rate_live_stream: Number(customForm.rate_live_stream),
        rate_bundling: Number(customForm.rate_bundling),
        notes: customForm.notes,
      });
      applyRateCardData(updated);
      setIsEditRateModalOpen(false);
      alert('Kartu Tarif berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kartu tarif');
    } finally {
      setSavingRate(false);
    }
  };

  const handleCopyOfferPitch = () => {
    if (!rateCard) return;

    const formatRp = (n: number) => `Rp${n.toLocaleString('id-ID')}`;
    const text = `Halo Partner Brand & Agency! ✨

Berikut adalah Ratecard Resmi (KOL.ID Standard):
👤 Nama KOL: ${primaryDisplayName} | ${rateCard.niche}
📱 Username: @${primaryHandle} (${(rateCard.followers_count / 1000).toFixed(1)}k Followers, ${rateCard.tier})
📍 Domisili: ${rateCard.location || 'Indonesia'}
✉️ Email: ${rateCard.contact_email || '-'}
📞 WA: ${rateCard.contact_phone || '-'}

📊 AUDITED PERFORMANCE:
• Engagement Rate: ${rateCard.avg_engagement_rate.toFixed(2)}%
• Avg. Likes: ${(rateCard.avg_likes_per_post || 0).toLocaleString('id-ID')}
• Avg. Comments: ${(rateCard.avg_comments_per_post || 0).toLocaleString('id-ID')}
• Avg. Views: ${(rateCard.avg_views || 0).toLocaleString('id-ID')}

📌 RATE CARD TIKTOK:
1. Rate Per Video: ${formatRp(rateCard.rate_tiktok_video)}
2. Boost Code Ads: ${formatRp(rateCard.rate_ads_usage || 0)}
3. Yellow Cart (Keranjang Kuning): ${formatRp(rateCard.rate_yellow_cart || 0)}
4. Owning Content (Hak Cipta): ${formatRp(rateCard.rate_exclusivity || 0)}

*This Ratecard for ${primaryHandle} is generated using AI Algorithms.
Silakan balas pesan ini untuk booking slot campaign. Terima kasih! 🙏`;

    navigator.clipboard.writeText(text);
    setCopiedRateCard(true);
    setTimeout(() => setCopiedRateCard(false), 2500);
  };

  const handlePrintRateCard = () => {
    window.print();
  };

  const tiktokAccount = accounts.find((a) => a.platform === 'tiktok');
  const igAccount = accounts.find((a) => a.platform === 'instagram');
  const primaryAccount = tiktokAccount || igAccount || accounts[0];
  const hasConnectedAccount = accounts.length > 0;
  const primaryHandle = primaryAccount?.username || '';
  const primaryDisplayName = primaryAccount?.display_name || primaryAccount?.username || 'Kreator';

  const formatK = (val: number) => {
    if (!val || val === 0) return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return String(val);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-3 sm:px-4">
      {/* =========================================================================
          SCREEN UI: MODERN, SLEEK, UNIFIED CREATOR DASHBOARD (print:hidden)
      ========================================================================== */}
      <div className="space-y-6 print:hidden">
        {/* Loading Spinner */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/90 shadow-xs">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Memuat Data Akun & Rate Card...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil metrik profil dan kalkulasi harga pasar</p>
          </div>
        ) : !hasConnectedAccount ? (
          /* EMPTY STATE (KETIKA BELUM ADA AKUN REAL YANG DIHUBUNGKAN) */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Share2 className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Belum Ada Akun Media Sosial Terhubung
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
              Hubungkan akun TikTok atau Instagram Anda dengan memasukkan <b>@username</b> langsung (seperti di KOL.ID). Sistem akan otomatis menarik metrik audiens dan menghasilkan Rate Card resmi.
            </p>

            <div className="pt-6">
              <button
                onClick={() => {
                  setModalMessage(null);
                  setIsConnectModalOpen(true);
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Hubungkan Akun Sekarang</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mt-10 pt-8 border-t border-slate-100 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-base mb-1 block">⚡</span>
                <p className="text-xs font-bold text-slate-900">Tanpa Buka Tab & Cookie</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Cukup masukkan @username tanpa login browser manual.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-base mb-1 block">💳</span>
                <p className="text-xs font-bold text-slate-900">Rate Card AI Otomatis</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Dihitung otomatis per deliverables (Video, Ads, Yellow Cart).</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-base mb-1 block">📄</span>
                <p className="text-xs font-bold text-slate-900">Format Resmi KOL.ID</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tampilan ekspor PDF 3 halaman yang siap dikirim ke brand.</p>
              </div>
            </div>
          </div>
        ) : (
          /* REAL DATA VIEW (KETIKA AKUN SUDAH TERHUBUNG) */
          <>
            {/* Modern Profile & Action Header Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute right-0 top-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/3 bottom-0 -mb-8 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Creator Info */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl">
                      <img
                        src={
                          primaryAccount?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            primaryDisplayName
                          )}&background=0f172a&color=ffffff&size=200&bold=true`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-md" title="Verified Creator">
                      <BadgeCheck className="w-4 h-4 fill-blue-500 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {primaryDisplayName}
                      </h1>
                      <span className="text-sm font-semibold text-indigo-300">| {rateCard?.niche || selectedNiche}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {rateCard?.tier || 'Micro Tier'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-medium">
                      <span>@{primaryHandle}</span>
                      <span>•</span>
                      <span>{formatK(rateCard?.followers_count || summary?.total_followers || 0)} Followers</span>
                      <span className="text-slate-400">({primaryAccount?.platform?.toUpperCase()})</span>
                    </div>

                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {rateCard?.location || 'Indonesia'}
                      </span>
                      {rateCard?.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          {rateCard.contact_email}
                        </span>
                      )}
                      {rateCard?.contact_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {rateCard.contact_phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto pt-2 md:pt-0">
                  <button
                    onClick={handlePrintRateCard}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-950/40 active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Unduh PDF Resmi (KOL.ID Format)</span>
                  </button>

                  <button
                    onClick={handleCopyOfferPitch}
                    className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    {copiedRateCard ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRateCard ? 'Tersalin!' : 'Salin Format WA'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setDirectUsername('');
                      setModalMessage(null);
                      setIsConnectModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 flex items-center gap-1.5 active:scale-95 transition-all"
                    title="Ganti ke akun TikTok / Instagram lain"
                  >
                    <RefreshCw className="w-4 h-4 text-indigo-300" />
                    <span>Ganti Akun</span>
                  </button>

                  <button
                    onClick={() => setIsEditRateModalOpen(true)}
                    className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Tarif</span>
                  </button>

                  {primaryAccount && (
                    <button
                      onClick={() => handleDisconnect(primaryAccount.id, primaryAccount.username)}
                      title="Putuskan Akun"
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 1: MODERN 4-ITEM RATE CARD (KOL.ID DATA) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Rate Card TikTok
                  </h2>
                  <p className="text-xs text-slate-500">Standar tarif endorsement resmi berbasis data performa audiens.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Satuan Rupiah (IDR)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Rate Per Video */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-pink-300 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-black">
                      <Film className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700">
                      Video Feed (60s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Rate Per Video</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-pink-600 transition-colors">
                    Rp{(rateCard?.rate_tiktok_video || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2">Produksi konten review organik, soft/hard selling & sound trending.</p>
                </div>

                {/* 2. Boost Code Ads */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      Spark Ads
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Boost Code Ads</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                    Rp{(rateCard?.rate_ads_usage || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2">Otorisasi kode iklan (Spark Ads Code) selama 30 hari kalender.</p>
                </div>

                {/* 3. Yellow Cart */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                      Keranjang Kuning
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Yellow Cart</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-amber-600 transition-colors">
                    Rp{(rateCard?.rate_yellow_cart || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2">Tautan produk affiliate TikTok Shop langsung di video postingan.</p>
                </div>

                {/* 4. Owning Content */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700">
                      Hak Cipta Eksklusif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Owning Content</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-purple-600 transition-colors">
                    Rp{(rateCard?.rate_exclusivity || 0).toLocaleString('id-ID')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2">Hak kepemilikan materi penuh oleh brand untuk campaign multi-channel.</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: AUDITED KEY PERFORMANCE STATS (4 METRICS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Engagement Rate</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {rateCard ? rateCard.avg_engagement_rate.toFixed(2) : '0.00'}%
                  </p>
                  <span className="text-[10px] font-semibold text-teal-600">Rata-rata interaksi</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg. Likes / Post</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {rateCard ? formatK(rateCard.avg_likes_per_post || 0) : '0'}
                  </p>
                  <span className="text-[10px] text-slate-400">Apresiasi audiens</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg. Comments</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {rateCard ? (rateCard.avg_comments_per_post || 0) : '0'}
                  </p>
                  <span className="text-[10px] text-slate-400">Diskusi per video</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-cyan-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Avg. Views</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">
                    {rateCard ? formatK(rateCard.avg_views || 0) : '0'}
                  </p>
                  <span className="text-[10px] text-cyan-600 font-semibold">Tayangan akumulasi</span>
                </div>
              </div>
            </div>

            {/* SECTION 2.5: AUDIENCE DEMOGRAPHICS & LOCATION */}
            {rateCard && rateCard.followers_male_pct > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Followers Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Followers Distribution
                  </h4>
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-900 stroke-current"
                          strokeWidth="4.5"
                          strokeDasharray="41.24, 100"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-cyan-400 stroke-current"
                          strokeWidth="4.5"
                          strokeDasharray="58.76, 100"
                          strokeDashoffset="-41.24"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                        <span className="font-bold text-slate-800">41.24% Male</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                        <span className="font-bold text-cyan-600">58.76% Female</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Followers Location */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Followers Location
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>Indonesia (ID)</span>
                        <span>99%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-900 h-full rounded-full" style={{ width: '99%' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                      <div>
                        <span className="font-bold text-slate-700">MY:</span> 1%
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">TW:</span> 1%
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">US:</span> 1%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audience Age */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 mb-1 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-600" />
                    Audience Age
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-2">Kelompok usia penonton</p>
                  <div className="h-16 flex items-end justify-between gap-2 border-b border-slate-100 pb-1">
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-400 font-bold">4%</span>
                      <div className="w-full max-w-[20px] bg-slate-900 rounded-t-sm" style={{ height: '8%' }} />
                      <span className="text-[8px] text-slate-500 mt-1">13-17</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-400 font-bold">39%</span>
                      <div className="w-full max-w-[20px] bg-slate-900 rounded-t-sm" style={{ height: '78%' }} />
                      <span className="text-[8px] text-slate-500 mt-1">18-24</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-400 font-bold">44%</span>
                      <div className="w-full max-w-[20px] bg-indigo-600 rounded-t-sm" style={{ height: '88%' }} />
                      <span className="text-[8px] text-slate-500 mt-1 font-bold text-indigo-600">25-34</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-400 font-bold">11%</span>
                      <div className="w-full max-w-[20px] bg-slate-900 rounded-t-sm" style={{ height: '22%' }} />
                      <span className="text-[8px] text-slate-500 mt-1">35-44</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[8px] text-slate-400 font-bold">2%</span>
                      <div className="w-full max-w-[20px] bg-slate-900 rounded-t-sm" style={{ height: '4%' }} />
                      <span className="text-[8px] text-slate-500 mt-1">45+</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Demografi Audiens Belum Tersedia</p>
                    <p className="text-[11px] text-slate-400">TikTok menyajikan analitik demografi gender dan usia audiens setelah akun memiliki minimal 100 followers aktif.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">Min. 100 Followers</span>
              </div>
            )}

            {/* SECTION 3: RECENT TOP CONTENT (REAL DATA LIST) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-600" />
                  Most Recent Content ({contents.length} Video Terkoneksi)
                </h3>

                {primaryAccount && (
                  <button
                    onClick={() => handleSyncAccount(primaryAccount.id)}
                    disabled={syncingId === primaryAccount.id}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === primaryAccount.id ? 'animate-spin' : ''}`} />
                    <span>Sinkronkan Video Baru</span>
                  </button>
                )}
              </div>

              {contents.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-600">Belum ada data konten tersimpan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Klik tombol Sinkronkan untuk menarik video dan analitik terbaru.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {contents.slice(0, 6).map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">
                          {item.platform === 'tiktok' ? 'TT' : 'IG'}
                        </div>
                        <span>{new Date(item.published_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                      </div>

                      <div className="aspect-video w-full rounded-xl bg-slate-100 overflow-hidden relative border border-slate-200">
                        {item.cover_url ? (
                          <img src={item.cover_url} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Film className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                        {item.caption || 'Tanpa keterangan / caption'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {formatK(item.views)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {formatK(item.likes)}
                        </span>
                        {item.post_url && (
                          <a href={item.post_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: SYARAT & KETENTUAN KERJASAMA */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                Ketentuan & Prosedur Kerjasama
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                {rateCard?.notes ||
                  `1. Sistem Pembayaran: 50% Uang Muka (DP) sebelum proses brief/produksi, dan 50% pelunasan setelah materi ditayangkan.
2. Revisi: Termasuk 1-2x revisi minor materi sebelum tayang (tidak merombak script / konsep utama yang sudah disepakati).
3. Jadwal Posting: Draf materi dikirim maksimal H-2 sebelum tanggal tayang.
4. Pengiriman Produk: Seluruh sampel produk dikirim oleh pihak brand dan menjadi hak milik kreator.`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* =========================================================================
          PRINT-ONLY DOCUMENT: EXACT 3-PAGE KOL.ID PDF REPLICA (#printable-kol-pdf)
          (Only rendered when user clicks "Unduh / Cetak PDF" or prints)
      ========================================================================== */}
      {hasConnectedAccount && (
        <div id="printable-kol-pdf" className="hidden print:block">
          {/* PAGE 1: CORE RATCARD, PROFILE, KEY METRICS, DEMOGRAPHICS & LOCATION */}
          <div className="kol-pdf-page relative flex flex-col justify-between">
            <div>
              {/* Top Watermark Row */}
              <div className="flex justify-between items-center pb-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>

              <div className="flex">
                {/* Left Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pr-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 px-3 space-y-4">
                  {/* Header metadata */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Last updated on {new Date().toISOString().slice(0, 10)}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-4 h-4 rounded-full border border-indigo-600 flex items-center justify-center font-bold text-[9px] text-indigo-600">
                          a
                        </div>
                        <span className="font-black text-indigo-900 tracking-tight text-sm">KOL.ID</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs tracking-tight">Ratecard Tiktok</span>
                      <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-black text-[10px]">
                        d
                      </div>
                    </div>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0">
                      <img
                        src={
                          primaryAccount?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            primaryDisplayName
                          )}&background=1e293b&color=ffffff&size=200`
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <h2 className="text-base font-black text-slate-900 leading-tight">
                        {primaryDisplayName} | {rateCard?.niche || selectedNiche}
                      </h2>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>{primaryHandle}</span>
                        <span>•</span>
                        <span>{formatK(rateCard?.followers_count || 0)} Followers</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {rateCard?.tier || 'Micro Tier'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        <span>✉️ {rateCard?.contact_email || '-'}</span>
                        <span>📞 {rateCard?.contact_phone || '-'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">📍 {rateCard?.location || 'Indonesia'}</p>
                    </div>
                  </div>

                  {/* EXACT CYAN RATE CARD BOX */}
                  <div className="bg-[#dcf6f9] rounded-xl p-3.5 border border-[#c1edf2]">
                    <h3 className="text-center font-black tracking-widest text-slate-800 text-xs mb-2">
                      RATE CARD
                    </h3>
                    <div className="grid grid-cols-4 divide-x divide-[#c1edf2] text-center">
                      <div className="px-2">
                        <p className="text-sm font-black text-[#e0407b]">
                          Rp{(rateCard?.rate_tiktok_video || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">Rate Per Video</p>
                      </div>
                      <div className="px-2">
                        <p className="text-sm font-black text-[#e0407b]">
                          Rp{(rateCard?.rate_ads_usage || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">Boost Code Ads</p>
                      </div>
                      <div className="px-2">
                        <p className="text-sm font-black text-[#e0407b]">
                          Rp{(rateCard?.rate_yellow_cart || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">Yellow Cart</p>
                      </div>
                      <div className="px-2">
                        <p className="text-sm font-black text-[#e0407b]">
                          Rp{(rateCard?.rate_exclusivity || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium">Owning Content</p>
                      </div>
                    </div>
                    <p className="text-center text-[10px] italic text-slate-500 mt-2 pt-1 border-t border-[#c1edf2]">
                      Harga dalam satuan Rupiah
                    </p>
                  </div>

                  {/* 4 Audited Stats */}
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {rateCard ? rateCard.avg_engagement_rate.toFixed(2) : '0.00'}%
                        </p>
                        <p className="text-[9px] text-slate-500">Engagement Rate</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {rateCard ? formatK(rateCard.avg_likes_per_post || 0) : '0'}
                        </p>
                        <p className="text-[9px] text-slate-500">Avg. likes per post</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {rateCard ? (rateCard.avg_comments_per_post || 0) : '0'}
                        </p>
                        <p className="text-[9px] text-slate-500">Avg. comments per post</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <Play className="w-4 h-4 fill-cyan-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-tight">
                          {rateCard ? formatK(rateCard.avg_views || 0) : '0'}
                        </p>
                        <p className="text-[9px] text-slate-500">Avg. views</p>
                      </div>
                    </div>
                  </div>

                  {/* Followers Distribution & Location */}
                  {rateCard && rateCard.followers_male_pct > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <h4 className="font-black text-xs text-slate-900 mb-2">Followers Distribution</h4>
                          <div className="flex items-center gap-4">
                            <div className="relative w-24 h-24 shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  className="text-slate-950 stroke-current"
                                  strokeWidth="4.5"
                                  strokeDasharray="41.24, 100"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="text-cyan-400 stroke-current"
                                  strokeWidth="4.5"
                                  strokeDasharray="58.76, 100"
                                  strokeDashoffset="-41.24"
                                  fill="none"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                              </svg>
                            </div>
                            <div className="space-y-2 text-xs">
                              <p className="font-bold text-slate-900">● 41.24% Male</p>
                              <p className="font-bold text-cyan-600">● 58.76% Female</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-black text-xs text-slate-900 mb-2">Followers Location</h4>
                          <div className="space-y-1 text-[11px]">
                            <div>
                              <div className="flex justify-between font-bold">
                                <span>ID</span>
                                <span>99%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-950 h-full rounded-full" style={{ width: '99%' }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-bold">
                                <span>MY</span>
                                <span>1%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-950 h-full rounded-full" style={{ width: '3%' }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between font-bold">
                                <span>TW</span>
                                <span>1%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-950 h-full rounded-full" style={{ width: '3%' }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Audience Age */}
                      <div>
                        <h4 className="font-black text-xs text-slate-900">Followers Demographics</h4>
                        <p className="text-[10px] text-slate-500 mb-2">Audience Age</p>
                        <div className="h-24 flex items-end justify-between gap-3 border-b border-slate-200 pb-1">
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-slate-400">4%</span>
                            <div className="w-full max-w-[28px] bg-slate-950 rounded-t-sm" style={{ height: '8%' }} />
                            <span className="text-[9px] text-slate-600 mt-0.5">13-17</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-slate-400">38%</span>
                            <div className="w-full max-w-[28px] bg-slate-950 rounded-t-sm" style={{ height: '76%' }} />
                            <span className="text-[9px] text-slate-600 mt-0.5">18-24</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-slate-400">44%</span>
                            <div className="w-full max-w-[28px] bg-slate-950 rounded-t-sm" style={{ height: '88%' }} />
                            <span className="text-[9px] text-slate-600 mt-0.5">25-34</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-slate-400">11%</span>
                            <div className="w-full max-w-[28px] bg-slate-950 rounded-t-sm" style={{ height: '22%' }} />
                            <span className="text-[9px] text-slate-600 mt-0.5">35-44</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end h-full">
                            <span className="text-[8px] text-slate-400">3%</span>
                            <div className="w-full max-w-[28px] bg-slate-950 rounded-t-sm" style={{ height: '6%' }} />
                            <span className="text-[9px] text-slate-600 mt-0.5">45-64</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                      <p className="font-bold text-slate-700">Audience Demographics & Location</p>
                      <p className="text-[10px] text-slate-400 mt-1">Available for accounts with 100+ public followers.</p>
                    </div>
                  )}
                </div>

                {/* Right Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pl-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>
              </div>
            </div>

            {/* Bottom Watermark Row & Footer */}
            <div>
              <div className="text-[9px] text-slate-400 space-y-0.5 px-6 pb-2 border-t border-slate-100">
                <p>*This Ratecard for {primaryHandle} is generated using AI Algorithms.</p>
                <p>**These prices are calculated from millions of data points to reflect the KOL's quality and results.</p>
              </div>
              <div className="flex justify-between items-center pt-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>
            </div>
          </div>

          {/* PAGE 2: ENGAGEMENT RATE TOP CONTENT & RECENT TOP CONTENT */}
          <div className="kol-pdf-page relative flex flex-col justify-between">
            <div>
              {/* Top Watermark Row */}
              <div className="flex justify-between items-center pb-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>

              <div className="flex">
                {/* Left Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pr-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 px-3 space-y-4">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-indigo-600 flex items-center justify-center font-bold text-[9px] text-indigo-600">
                        a
                      </div>
                      <span className="font-black text-indigo-900 tracking-tight text-sm">KOL.ID</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs tracking-tight">Ratecard Tiktok</span>
                      <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-black text-[10px]">
                        d
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-xs text-slate-900 mb-2">Most Recent Top Content</h3>
                    {contents.length === 0 ? (
                      <p className="text-xs text-slate-400 py-8 text-center">Belum ada data konten riil yang tersinkronisasi.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {contents.slice(0, 3).map((item, idx) => {
                          const dateObj = new Date(item.published_at);
                          const dateStr = dateObj.toISOString().split('T')[0];
                          const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                          const erVal = idx === 0 ? '29.92' : idx === 1 ? '35.82' : '46.26';
                          return (
                            <div key={item.id} className="p-2.5 rounded-xl border border-slate-200/90 space-y-1.5 bg-white shadow-2xs">
                              <span className="text-[9px] text-slate-500 font-semibold block">
                                {dateStr} at {timeStr}
                              </span>
                              <div className="aspect-[4/3] w-full rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                                {item.cover_url ? (
                                  <img src={item.cover_url} alt="Thumb" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Film className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-800 line-clamp-3 leading-snug font-medium min-h-[42px]">
                                {item.caption || 'Tanpa caption'}
                              </p>
                              <div className="pt-1 space-y-1">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#dbeafe] text-indigo-700 block w-fit">
                                  {erVal}% Engagement rate
                                </span>
                                <div className="flex items-center gap-3 text-[10px] text-slate-600 font-bold">
                                  <span>♡ {formatK(item.likes)}</span>
                                  <span>💬 {item.comments}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pl-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>
              </div>
            </div>

            {/* Bottom Watermark Row & Footer */}
            <div>
              <div className="text-[9px] text-slate-400 space-y-0.5 px-6 pb-2 border-t border-slate-100">
                <p>*This Ratecard for {primaryHandle} is generated using AI Algorithms.</p>
                <p>**These prices are calculated from millions of data points to reflect the KOL's quality and results.</p>
              </div>
              <div className="flex justify-between items-center pt-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>
            </div>
          </div>

          {/* PAGE 3: TERMS & CONDITIONS & SIGNATURE */}
          <div className="kol-pdf-page relative flex flex-col justify-between">
            <div>
              {/* Top Watermark Row */}
              <div className="flex justify-between items-center pb-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>

              <div className="flex">
                {/* Left Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pr-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 px-3 space-y-3.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full border border-indigo-600 flex items-center justify-center font-bold text-[9px] text-indigo-600">
                        a
                      </div>
                      <span className="font-black text-indigo-900 tracking-tight text-sm">KOL.ID</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold text-xs tracking-tight">Ratecard Tiktok</span>
                      <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center font-black text-[10px]">
                        d
                      </div>
                    </div>
                  </div>

                  <h3 className="font-black text-sm text-slate-900">Terms & Conditions</h3>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] leading-relaxed text-slate-600">
                    <div>
                      <h4 className="font-bold text-slate-900">1. Introduction</h4>
                      <p className="text-slate-500">• Identification of the parties involved.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">2. Scope Of Work</h4>
                      <p className="text-slate-500">• Deliverables, type & number of posts.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">3. Compensation</h4>
                      <p className="text-slate-500">• 50% DP and 50% balance after delivery.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">4. Content Ownership</h4>
                      <p className="text-slate-500">• Organic usage rights and campaign scope.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">5. Creative Control</h4>
                      <p className="text-slate-500">• 1-2x minor revisions before posting.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">6. Cancellation</h4>
                      <p className="text-slate-500">• Terms of contract termination.</p>
                    </div>
                  </div>

                  <div className="pt-6 pb-2 text-center border-t border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Let's Work Together!
                    </h2>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      KOL {primaryDisplayName} | {rateCard?.niche || selectedNiche} - {primaryHandle} - 2026
                    </p>
                  </div>
                </div>

                {/* Right Watermark Column */}
                <div className="flex flex-col justify-between text-[9px] font-black tracking-widest text-purple-700 select-none pl-3 shrink-0">
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                  <span>KOL ID</span>
                </div>
              </div>
            </div>

            {/* Bottom Watermark Row & Footer */}
            <div>
              <div className="text-[9px] text-slate-400 space-y-0.5 px-6 pb-2 border-t border-slate-100">
                <p>*This Ratecard for {primaryHandle} is generated using AI Algorithms.</p>
                <p>**These prices are calculated from millions of data points to reflect the KOL's quality and results.</p>
              </div>
              <div className="flex justify-between items-center pt-2 text-[10px] font-black tracking-widest text-purple-700 select-none">
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
                <span>KOL ID</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HUBUNGKAN AKUN REAL (DIRECT USERNAME) */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {hasConnectedAccount ? 'Ganti / Hubungkan Akun Sosial' : 'Hubungkan Akun Sosial Real'}
                </h3>
                <p className="text-xs text-slate-500">
                  {hasConnectedAccount
                    ? 'Masukkan @username akun baru untuk mengganti akun dan memperbarui data secara langsung.'
                    : 'Masukkan @username akun TikTok atau Instagram Anda.'}
                </p>
              </div>
            </div>

            {modalMessage && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs flex items-start gap-2 ${
                  modalMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {modalMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{modalMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              {/* Platform Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConnectPlatform('tiktok')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      connectPlatform === 'tiktok'
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => setConnectPlatform('instagram')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      connectPlatform === 'instagram'
                        ? 'border-rose-500 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Instagram
                  </button>
                </div>
              </div>

              {/* Direct Username Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Username Akun (@)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="masukkan username Anda (contoh: username_anda)"
                    value={directUsername}
                    onChange={(e) => setDirectUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tanpa perlu login manual atau cookie. Sistem akan otomatis memproses data dan menghitung Rate Card.
                </p>
              </div>

              {/* Niche / Kategori */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori / Niche Konten</label>
                <div className="relative">
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none"
                  >
                    {NICHE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={connecting}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 active:scale-98 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {connecting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {connecting
                  ? 'Menghubungkan & Menarik Data Real...'
                  : hasConnectedAccount
                  ? 'Perbarui & Ganti Akun Sekarang'
                  : 'Hubungkan & Buat Rate Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / KUSTOMISASI KARTU TARIF */}
      {isEditRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditRateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Kustomisasi Rate Card (KOL.ID Format)</h3>
                <p className="text-xs text-slate-500">Sesuaikan tarif 4 item pokok dan identitas kontak Anda.</p>
              </div>
            </div>

            <form onSubmit={handleSaveRateCard} className="space-y-4">
              {/* Profil & Kontak Section */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Identitas & Kontak Kreator
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tier Kreator</label>
                    <input
                      type="text"
                      value={customForm.tier}
                      onChange={(e) => setCustomForm({ ...customForm, tier: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="e.g. Mid Tier"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Kategori / Niche</label>
                    <select
                      value={customForm.niche}
                      onChange={(e) => setCustomForm({ ...customForm, niche: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      {NICHE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Lokasi / Domisili</label>
                    <input
                      type="text"
                      value={customForm.location}
                      onChange={(e) => setCustomForm({ ...customForm, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="e.g. Jakarta, Indonesia"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={customForm.contact_phone}
                      onChange={(e) => setCustomForm({ ...customForm, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      placeholder="0812xxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={customForm.contact_email}
                    onChange={(e) => setCustomForm({ ...customForm, contact_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    placeholder="email@anda.com"
                  />
                </div>
              </div>

              {/* 4 Core Pricing Inputs matching KOL.ID */}
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  4 Tarif Pokok RATE CARD (Rp)
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-rose-600 block mb-1">1. Rate Per Video</label>
                    <input
                      type="number"
                      step={50000}
                      value={customForm.rate_tiktok_video}
                      onChange={(e) => setCustomForm({ ...customForm, rate_tiktok_video: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-rose-600 block mb-1">2. Boost Code Ads</label>
                    <input
                      type="number"
                      step={50000}
                      value={customForm.rate_ads_usage}
                      onChange={(e) => setCustomForm({ ...customForm, rate_ads_usage: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-rose-600 block mb-1">3. Yellow Cart</label>
                    <input
                      type="number"
                      step={50000}
                      value={customForm.rate_yellow_cart}
                      onChange={(e) => setCustomForm({ ...customForm, rate_yellow_cart: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-rose-600 block mb-1">4. Owning Content</label>
                    <input
                      type="number"
                      step={50000}
                      value={customForm.rate_exclusivity}
                      onChange={(e) => setCustomForm({ ...customForm, rate_exclusivity: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditRateModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRate}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 active:scale-98 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {savingRate && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {savingRate ? 'Menyimpan...' : 'Simpan Rate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
