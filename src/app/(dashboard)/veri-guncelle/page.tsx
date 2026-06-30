"use client";

import { useState, useEffect } from "react";
import { PERSONNEL_DATA, PersonnelRecord } from "@/lib/personnel-data";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  PencilLine,
  Lock,
  Info,
  CalendarDays,
  Users,
  UserPlus,
  UserMinus,
  Hash,
} from "lucide-react";

// Düzenlenebilecek roller
const CAN_EDIT_ROLES = ["IK_SEFI", "IK_UZMANI", "ADMIN"];

const STORAGE_KEY = "trizone_personel_overrides";

/** localStorage'daki override'ı oku */
function loadOverrides(): Record<number, Partial<PersonnelRecord>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/** Kaydet */
function saveOverrides(data: Record<number, Partial<PersonnelRecord>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Statik veri + override birleştir */
function mergedData(
  overrides: Record<number, Partial<PersonnelRecord>>
): PersonnelRecord[] {
  return PERSONNEL_DATA.map((r) => ({ ...r, ...(overrides[r.no] ?? {}) }));
}

// ─── Küçük yardımcı ──────────────────────────────────────────────────────────
function FieldInput({
  label,
  icon: Icon,
  value,
  onChange,
  disabled,
  helpText,
}: {
  label: string;
  icon: any;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  helpText?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <input
        type="number"
        min={0}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-11 rounded-xl border px-4 text-sm font-semibold transition-all outline-none
          ${
            disabled
              ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-white border-slate-200 text-slate-800 hover:border-[#1F497D]/40 focus:border-[#1F497D] focus:ring-2 focus:ring-[#1F497D]/10"
          }`}
      />
      {helpText && (
        <p className="text-[10px] text-slate-400">{helpText}</p>
      )}
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function VeriGuncellePage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [overrides, setOverrides] = useState<Record<number, Partial<PersonnelRecord>>>({});
  const [selected, setSelected] = useState<number>(6); // Haziran = no:6
  const [form, setForm] = useState<Partial<PersonnelRecord>>({});
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Kullanıcı ve override yükle
  useEffect(() => {
    const u = localStorage.getItem("trizone_active_user");
    if (u) setActiveUser(JSON.parse(u));
    const loaded = loadOverrides();
    setOverrides(loaded);
  }, []);

  // Seçili ayın form değerlerini yükle
  useEffect(() => {
    const all = mergedData(overrides);
    const row = all.find((r) => r.no === selected);
    if (row) {
      setForm({
        toplamPersonel: row.toplamPersonel,
        girisaSayisi: row.girisaSayisi,
        ayniAyCikisSayisi: row.ayniAyCikisSayisi,
        toplamCikisSayisi: row.toplamCikisSayisi,
        erkek: row.erkek,
        kadin: row.kadin,
      });
    }
    setSaved(false);
    setDirty(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, overrides]);

  const canEdit = CAN_EDIT_ROLES.includes(activeUser?.role);
  const months = mergedData(overrides);
  const selectedRow = months.find((r) => r.no === selected)!;

  function updateField(key: keyof PersonnelRecord, val: number) {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      // Toplam otomatik hesapla
      if (key === "erkek" || key === "kadin") {
        next.toplamPersonel = (next.erkek ?? 0) + (next.kadin ?? 0);
      }
      return next;
    });
    setDirty(true);
    setSaved(false);
  }

  function handleSave() {
    const next = { ...overrides, [selected]: { ...overrides[selected], ...form } };
    setOverrides(next);
    saveOverrides(next);
    setSaved(true);
    setDirty(false);
    // Diğer bileşenlerin de güncellenmesi için event fırlat
    window.dispatchEvent(new Event("personel-data-updated"));
  }

  function handleReset() {
    const next = { ...overrides };
    delete next[selected];
    setOverrides(next);
    saveOverrides(next);
    setSaved(false);
    setDirty(false);
  }

  return (
    <div className="flex flex-col space-y-6 max-w-4xl">
      {/* ── Başlık ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Veri Güncelleme
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Aylık personel verilerini aşağıdaki form üzerinden güncelleyin. Değişiklikler anında uygulamaya yansır.
        </p>
      </div>

      {/* ── Yetki Uyarısı ── */}
      {!canEdit && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm">
          <Lock className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Düzenleme Yetkiniz Yok</p>
            <p className="text-xs mt-0.5 text-amber-700">
              Veri girişi yalnızca İK Şefi, İK Uzmanı ve Sistem Yöneticisi rollerine açıktır. Mevcut rolünüz:{" "}
              <strong>{activeUser?.role ?? "Bilinmiyor"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* ── Ay Seçici ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#1F497D]" />
          Güncellenecek Ay
        </h2>
        <div className="flex flex-wrap gap-2">
          {months.map((r) => {
            const hasOverride = !!overrides[r.no];
            return (
              <button
                key={r.no}
                onClick={() => setSelected(r.no)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all border
                  ${
                    selected === r.no
                      ? "bg-[#1F497D] text-white border-[#1F497D] shadow-md shadow-[#1F497D]/20"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#1F497D]/40 hover:bg-slate-100"
                  }`}
              >
                {r.ay}
                {hasOverride && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                )}
                {r.isCurrentMonth && !hasOverride && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Güncellenmiş ay
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Mevcut ay (devam ediyor)
          </span>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <PencilLine className="h-4 w-4 text-[#1F497D]" />
            {selectedRow?.ay} 2026 — Veri Girişi
            {selectedRow?.isCurrentMonth && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-1">
                Devam Ediyor
              </span>
            )}
          </h2>
          {overrides[selected] && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Güncel Veri
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <FieldInput
            label="Toplam Aktif Personel"
            icon={Users}
            value={form.toplamPersonel ?? 0}
            onChange={(v) => updateField("toplamPersonel", v)}
            disabled={!canEdit}
            helpText="Erkek + Kadın toplamı otomatik hesaplanır"
          />
          <FieldInput
            label="İşe Giriş Sayısı"
            icon={UserPlus}
            value={form.girisaSayisi ?? 0}
            onChange={(v) => updateField("girisaSayisi", v)}
            disabled={!canEdit}
          />
          <FieldInput
            label="Aynı Ay Çıkış"
            icon={UserMinus}
            value={form.ayniAyCikisSayisi ?? 0}
            onChange={(v) => updateField("ayniAyCikisSayisi", v)}
            disabled={!canEdit}
          />
          <FieldInput
            label="Toplam Çıkış (YTD)"
            icon={Hash}
            value={form.toplamCikisSayisi ?? 0}
            onChange={(v) => updateField("toplamCikisSayisi", v)}
            disabled={!canEdit}
            helpText="Yılın başından beri toplam"
          />
          <FieldInput
            label="Erkek Personel"
            icon={Users}
            value={form.erkek ?? 0}
            onChange={(v) => {
              const kadin = form.kadin ?? 0;
              setForm((p) => ({
                ...p,
                erkek: v,
                toplamPersonel: v + kadin,
              }));
              setDirty(true);
              setSaved(false);
            }}
            disabled={!canEdit}
          />
          <FieldInput
            label="Kadın Personel"
            icon={Users}
            value={form.kadin ?? 0}
            onChange={(v) => {
              const erkek = form.erkek ?? 0;
              setForm((p) => ({
                ...p,
                kadin: v,
                toplamPersonel: erkek + v,
              }));
              setDirty(true);
              setSaved(false);
            }}
            disabled={!canEdit}
          />
        </div>

        {/* Özet */}
        {canEdit && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Önizleme
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
              {[
                { label: "Toplam", value: form.toplamPersonel ?? 0, color: "text-slate-800" },
                { label: "Giriş", value: form.girisaSayisi ?? 0, color: "text-emerald-600" },
                { label: "Çıkış", value: form.ayniAyCikisSayisi ?? 0, color: "text-red-500" },
                { label: "YTD Çıkış", value: form.toplamCikisSayisi ?? 0, color: "text-orange-500" },
                { label: "Erkek", value: form.erkek ?? 0, color: "text-[#1F497D]" },
                { label: "Kadın", value: form.kadin ?? 0, color: "text-[#4472C4]" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-lg p-2 border border-slate-100">
                  <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Butonlar */}
        {canEdit && (
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={!dirty}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${
                  dirty
                    ? "bg-[#1F497D] text-white hover:bg-[#183d6f] shadow-lg shadow-[#1F497D]/20 active:scale-[0.98]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              <Save className="h-4 w-4" />
              Kaydet
            </button>
            <button
              onClick={handleReset}
              disabled={!overrides[selected]}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${
                  overrides[selected]
                    ? "border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.98]"
                    : "border-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              <RotateCcw className="h-4 w-4" />
              Orijinale Döndür
            </button>

            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold animate-in fade-in-0 duration-200">
                <CheckCircle2 className="h-4 w-4" />
                Kaydedildi
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Tüm Aylar Özet Tablosu ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Tüm Aylar Özet</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {["Ay", "Toplam", "Giriş", "Çıkış", "Erkek", "Kadın", "Durum"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((r) => {
                const isSelected = r.no === selected;
                const hasOverride = !!overrides[r.no];
                return (
                  <tr
                    key={r.no}
                    onClick={() => setSelected(r.no)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors
                      ${isSelected ? "bg-[#1F497D]/5 border-[#1F497D]/20" : "hover:bg-slate-50"}`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                      {r.ay}
                      {r.isCurrentMonth && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{r.toplamPersonel}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">{r.girisaSayisi}</td>
                    <td className="py-2.5 px-3 text-red-500 font-semibold">{r.ayniAyCikisSayisi}</td>
                    <td className="py-2.5 px-3 text-[#1F497D] font-semibold">{r.erkek}</td>
                    <td className="py-2.5 px-3 text-[#4472C4] font-semibold">{r.kadin}</td>
                    <td className="py-2.5 px-3">
                      {hasOverride ? (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Güncel
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Orijinal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Güncellenen veriler tarayıcı hafızasına (localStorage) kaydedilir. Bu cihazda kalıcıdır.
        </p>
      </div>
    </div>
  );
}
