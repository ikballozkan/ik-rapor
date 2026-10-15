"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MONTH_NAMES,
  INITIAL_ATTENDANCE_DATA,
  DeptAttendanceItem,
  MonthAttendanceRecord,
} from "@/lib/attendance-data";
import { PERSONNEL_DATA } from "@/lib/personnel-data";
import {
  getAttendanceRecords,
  saveAttendanceRecord,
  deleteAttendanceRecord,
} from "@/app/actions";
import {
  Users,
  Award,
  TrendingUp,
  Building2,
  CalendarDays,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Lock,
  PencilLine,
  BarChart3,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const CAN_EDIT_ROLES = ["IK_SEFI", "IK_UZMANI", "ADMIN"];

const CHART_COLORS = ["#1F497D", "#2563EB", "#0D9488", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

export default function AttendanceTrackingPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // Ekim (Güncel ay)
  const [records, setRecords] = useState<Record<number, MonthAttendanceRecord>>({});
  const [items, setItems] = useState<DeptAttendanceItem[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [dirty, setDirty] = useState<boolean>(false);

  // Verileri yükle
  async function loadData() {
    setLoading(true);
    try {
      const serverData = await getAttendanceRecords();
      // LocalStorage desteği (offline/hızlı erişim için)
      const localStr = typeof window !== "undefined" ? localStorage.getItem("trizone_attendance_data") : null;
      const localData = localStr ? JSON.parse(localStr) : {};

      const merged: Record<number, MonthAttendanceRecord> = {
        ...INITIAL_ATTENDANCE_DATA,
        ...localData,
        ...serverData,
      };
      setRecords(merged);
    } catch {
      setRecords(INITIAL_ATTENDANCE_DATA);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("trizone_active_user") : null;
    if (u) setActiveUser(JSON.parse(u));
    loadData();
  }, []);

  // Seçili ay değiştiğinde satırları yükle
  useEffect(() => {
    const current = records[selectedMonth];
    if (current && current.items && current.items.length > 0) {
      setItems(current.items);
      setNotes(current.not || "");
    } else {
      // Şablon: Eylül'deki departman yapısını boş değerlerle al
      const septTemplate = INITIAL_ATTENDANCE_DATA[9]?.items || [];
      const defaultItems: DeptAttendanceItem[] = septTemplate.map((d, idx) => ({
        id: `dept-${Date.now()}-${idx}`,
        departman: d.departman,
        devamsizlikYapmayan: 0,
        toplamPersonel: 0,
      }));
      setItems(defaultItems);
      setNotes("");
    }
    setSavedSuccess(false);
    setDirty(false);
  }, [selectedMonth, records]);

  const canEdit = !activeUser || CAN_EDIT_ROLES.includes(activeUser.role);

  // Satır güncelleme
  function updateItem(index: number, field: keyof DeptAttendanceItem, val: any) {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
    setDirty(true);
    setSavedSuccess(false);
  }

  // Yeni departman satırı ekle
  function addRow() {
    const newItem: DeptAttendanceItem = {
      id: `dept-${Date.now()}`,
      departman: "YENİ DEPARTMAN",
      devamsizlikYapmayan: 0,
      toplamPersonel: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setDirty(true);
    setSavedSuccess(false);
  }

  // Satır sil
  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
    setSavedSuccess(false);
  }

  // Kaydet
  async function handleSave() {
    setSaving(true);
    const monthMeta = MONTH_NAMES.find((m) => m.no === selectedMonth);
    const recordPayload: MonthAttendanceRecord = {
      ayNo: selectedMonth,
      ayAdi: monthMeta?.ad || "",
      yil: 2026,
      items,
      not: notes,
      isCurrentMonth: selectedMonth === 10,
    };

    try {
      // 1. Server Action
      await saveAttendanceRecord(selectedMonth, recordPayload);
      // 2. LocalStorage sync
      const nextRecords = { ...records, [selectedMonth]: recordPayload };
      setRecords(nextRecords);
      if (typeof window !== "undefined") {
        localStorage.setItem("trizone_attendance_data", JSON.stringify(nextRecords));
      }
      setSavedSuccess(true);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  // Sıfırla / İlk duruma getir
  async function handleReset() {
    if (!confirm("Bu ayın verilerini başlangıç durumuna sıfırlamak istiyor musunuz?")) return;
    setSaving(true);
    try {
      await deleteAttendanceRecord(selectedMonth);
      const nextRecords = { ...records };
      delete nextRecords[selectedMonth];
      if (INITIAL_ATTENDANCE_DATA[selectedMonth]) {
        nextRecords[selectedMonth] = INITIAL_ATTENDANCE_DATA[selectedMonth];
      }
      setRecords(nextRecords);
      if (typeof window !== "undefined") {
        localStorage.setItem("trizone_attendance_data", JSON.stringify(nextRecords));
      }
      setDirty(false);
      setSavedSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  // İstatistik hesaplamaları
  const totalDevamsizlikYapmayan = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.devamsizlikYapmayan) || 0), 0);
  }, [items]);

  const totalKadrolu = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.toplamPersonel) || 0), 0);
  }, [items]);

  // Ayın resmi toplam personeli (personnel-data'dan eşleşen ay)
  const officialMonthPersonel = useMemo(() => {
    const p = PERSONNEL_DATA.find((r) => r.no === selectedMonth);
    return p?.toplamPersonel || 0;
  }, [selectedMonth]);

  const effectiveBaseHeadcount = totalKadrolu > 0 ? totalKadrolu : officialMonthPersonel;
  const attendanceRate = effectiveBaseHeadcount > 0
    ? ((totalDevamsizlikYapmayan / effectiveBaseHeadcount) * 100).toFixed(1)
    : null;

  const topDepartment = useMemo(() => {
    if (!items.length) return null;
    return [...items].sort((a, b) => (b.devamsizlikYapmayan || 0) - (a.devamsizlikYapmayan || 0))[0];
  }, [items]);

  // Grafik verileri
  const chartData = useMemo(() => {
    return items.map((item) => ({
      name: item.departman,
      kisi: Number(item.devamsizlikYapmayan) || 0,
    }));
  }, [items]);

  const currentMonthMeta = MONTH_NAMES.find((m) => m.no === selectedMonth);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F497D]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-12">
      {/* ── Başlık Bölümü ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Aylık Devam & Devamsızlık Takibi
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Tam Devam Sağlayanlar
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Her ay için departman bazında <strong>hiç devamsızlık yapmayan</strong> (devamlılık primi / tam devam sağlayan) personel sayıları
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedMonth === 10 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Ekim 2026 (Aktif Dönem)
            </span>
          )}
          <span className="text-xs font-black bg-[#1F497D] text-white px-3 py-1.5 rounded-xl shadow-sm">
            {currentMonthMeta?.ad} 2026
          </span>
        </div>
      </div>

      {/* Yetki Bilgisi */}
      {!canEdit && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm">
          <Lock className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Sadece Görüntüleme Modu</p>
            <p className="text-xs mt-0.5 text-amber-700">
              Bu tabloyu düzenlemek için İK Şefi, İK Uzmanı veya Yönetici yetkisi gerekmektedir.
            </p>
          </div>
        </div>
      )}

      {/* ── Ay Seçici ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
        <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#1F497D]" />
          İşlem Yapılacak Ayı Seçin
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTH_NAMES.map((m) => {
            const hasData = records[m.no] && (records[m.no].items?.length ?? 0) > 0;
            const isSel = m.no === selectedMonth;
            const isCurrent = m.no === 10;
            return (
              <button
                key={m.no}
                onClick={() => setSelectedMonth(m.no)}
                className={`relative py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSel
                    ? "bg-[#1F497D] text-white border-[#1F497D] shadow-md scale-105 z-10"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-[#1F497D]/40"
                }`}
              >
                {m.ad}
                {hasData && (
                  <span
                    className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      isCurrent ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                    }`}
                    title={isCurrent ? "Aktif Ay" : "Kayıt Mevcut"}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-5 mt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Kayıtlı Veri Var
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Aktif Ay (Ekim)
          </span>
        </div>
      </div>

      {/* ── KPI Özet Kartları ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kart 1: Devamsızlık Yapmayan Toplam */}
        <div className="bg-gradient-to-br from-[#1F497D] to-[#2b62a5] rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
              Devamsızlık Yapmayan
            </span>
            <Award className="h-5 w-5 text-blue-200" />
          </div>
          <div className="text-3xl font-black">{totalDevamsizlikYapmayan} <span className="text-base font-semibold text-blue-200">Kişi</span></div>
          <p className="text-xs text-blue-200 mt-1">
            {currentMonthMeta?.ad} ayında tam devam sağlayan personel
          </p>
        </div>

        {/* Kart 2: Departman Sayısı */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kayıtlı Departman
            </span>
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-800">{items.length}</div>
          <p className="text-xs text-slate-400 mt-1">Takip edilen departman birimi</p>
        </div>

        {/* Kart 3: En Yüksek Devam Eden Departman */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Yüksek Katılım
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-800 truncate">
            {topDepartment ? topDepartment.departman : "—"}
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {topDepartment ? `${topDepartment.devamsizlikYapmayan} kişi ile lider` : "Veri yok"}
          </p>
        </div>

        {/* Kart 4: Devam Oranı % */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tahmini Devam Oranı
            </span>
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-800">
            {attendanceRate ? `%${attendanceRate}` : "—"}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {effectiveBaseHeadcount > 0 ? `Toplam ${effectiveBaseHeadcount} kadro üzerinden` : "Toplam kadro bekleniyor"}
          </p>
        </div>
      </div>

      {/* ── İki Kolonlu Alan: Tablo ve Grafik ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Kolon: Veri Giriş Tablosu (8 col) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <PencilLine className="h-4 w-4 text-[#1F497D]" />
                {currentMonthMeta?.ad} 2026 — Departman Bazlı Devam Girişi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hiç devamsızlık yapmayan çalışan sayılarını girip kaydedin.
              </p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1F497D] bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Departman Ekle
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-5">Departman</th>
                  <th className="py-3 px-4 text-center">Devamsızlık Yapmayan Kişi</th>
                  <th className="py-3 px-4 text-center">Departman Kadrosu (Opsiyonel)</th>
                  <th className="py-3 px-4 text-center">Devam Oranı</th>
                  {canEdit && <th className="py-3 px-4 text-center w-16">Sil</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      Bu ay için henüz departman kaydı yok. &quot;Departman Ekle&quot; butonuna tıklayarak ekleyebilirsiniz.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const rowRate = (item.toplamPersonel || 0) > 0
                      ? ((item.devamsizlikYapmayan / item.toplamPersonel!) * 100).toFixed(0)
                      : null;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Departman Adı */}
                        <td className="py-3 px-5">
                          {canEdit ? (
                            <input
                              type="text"
                              value={item.departman}
                              onChange={(e) => updateItem(idx, "departman", e.target.value.toUpperCase())}
                              className="font-bold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-[#1F497D] rounded-lg px-2 py-1 outline-none w-full max-w-xs transition-colors"
                            />
                          ) : (
                            <span className="font-bold text-slate-800">{item.departman}</span>
                          )}
                        </td>

                        {/* Devamsızlık Yapmayan Kişi Sayısı */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={!canEdit}
                            value={item.devamsizlikYapmayan}
                            onChange={(e) => updateItem(idx, "devamsizlikYapmayan", Number(e.target.value))}
                            className="w-24 h-9 text-center font-black text-blue-900 bg-blue-50/70 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 transition-all"
                          />
                        </td>

                        {/* Departman Kadrosu */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min={0}
                            disabled={!canEdit}
                            value={item.toplamPersonel ?? 0}
                            onChange={(e) => updateItem(idx, "toplamPersonel", Number(e.target.value))}
                            className="w-24 h-9 text-center font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60 transition-all"
                            placeholder="Opsiyonel"
                          />
                        </td>

                        {/* Devam Oranı */}
                        <td className="py-3 px-4 text-center">
                          {rowRate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                              %{rowRate}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">—</span>
                          )}
                        </td>

                        {/* Sil Butonu */}
                        {canEdit && (
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(idx)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                              title="Departmanı Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Toplam Satırı */}
              <tfoot>
                <tr className="bg-slate-50/90 font-black text-slate-800 border-t-2 border-slate-200">
                  <td className="py-3.5 px-5 uppercase tracking-wide text-xs">
                    GENEL TOPLAM
                  </td>
                  <td className="py-3.5 px-4 text-center text-base text-[#1F497D]">
                    {totalDevamsizlikYapmayan}
                  </td>
                  <td className="py-3.5 px-4 text-center text-sm text-slate-600">
                    {totalKadrolu > 0 ? totalKadrolu : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {attendanceRate ? (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        %{attendanceRate}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  {canEdit && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notlar & Kaydetme Barı */}
          <div className="p-5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Ay İçi Notlar & Açıklama
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setDirty(true);
                }}
                placeholder="Örn: Eylül ayı prim hak kazananlar listesi..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1F497D]"
              />
            </div>

            {canEdit && (
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Sıfırla
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-2 ${
                    dirty
                      ? "bg-[#1F497D] hover:bg-[#1a3d69] text-white cursor-pointer scale-102"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : savedSuccess ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                      Kaydedildi
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Kolon: Görsel Analiz & Dağılım Grafiği (4 col) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#1F497D]" />
              Departman Dağılım Grafiği
            </h3>

            {chartData.length > 0 && totalDevamsizlikYapmayan > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#64748B", fontWeight: 600 }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Kişi`, "Devamsızlık Yapmayan"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px" }}
                    />
                    <Bar dataKey="kisi" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 text-center">
                Grafik oluşturmak için departman verilerini giriniz.
              </div>
            )}
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-[#1F497D]">
              <Award className="h-4 w-4" />
              Devamlılık Primi & İK Takibi
            </p>
            <p className="leading-relaxed text-slate-600">
              Bu tablo, her ay işletmede hiç devamsızlık yapmayan çalışanların departman bazlı kaydını tutar.
              Eylül ayı verileri (Operatör: 59, Üretim: 161, İdari İşler: 13, Üretim Şef: 5) sisteme işlenmiştir.
              Ekim ve takip eden aylar için verilerinizi bu ekrandan doğrudan kaydedebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
