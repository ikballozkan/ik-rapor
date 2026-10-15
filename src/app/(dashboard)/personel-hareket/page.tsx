"use client";

import { useState, useEffect } from "react";
import { PERSONNEL_DATA, PersonnelRecord } from "@/lib/personnel-data";
import {
  getPersonnelOverrides,
  savePersonnelOverride,
  deletePersonnelOverride,
} from "@/app/actions";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  CalendarDays,
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  TrendingDown,
  Lock,
  PencilLine,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const CAN_EDIT_ROLES = ["IK_SEFI", "IK_UZMANI", "ADMIN"];

interface HareketForm {
  gecenAySonuErkek: number; gecenAySonuKadin: number;
  iseAlinanErkek: number; iseAlinanKadin: number;
  ayrilanErkek: number; ayrilanKadin: number;
  aySonuErkek: number; aySonuKadin: number;
  ozurluGecenAyErkek: number; ozurluGecenAyKadin: number;
  ozurluGirisErkek: number; ozurluGirisKadin: number;
  ozurluCikisErkek: number; ozurluCikisKadin: number;
  ozurluAySonuErkek: number; ozurluAySonuKadin: number;
  eskiHukumluGecenAyErkek: number; eskiHukumluGecenAyKadin: number;
  eskiHukumluGirisErkek: number; eskiHukumluGirisKadin: number;
  eskiHukumluCikisErkek: number; eskiHukumluCikisKadin: number;
  eskiHukumluAySonuErkek: number; eskiHukumluAySonuKadin: number;
}

const EMPTY_FORM: HareketForm = {
  gecenAySonuErkek: 0, gecenAySonuKadin: 0,
  iseAlinanErkek: 0, iseAlinanKadin: 0,
  ayrilanErkek: 0, ayrilanKadin: 0,
  aySonuErkek: 0, aySonuKadin: 0,
  ozurluGecenAyErkek: 0, ozurluGecenAyKadin: 0,
  ozurluGirisErkek: 0, ozurluGirisKadin: 0,
  ozurluCikisErkek: 0, ozurluCikisKadin: 0,
  ozurluAySonuErkek: 0, ozurluAySonuKadin: 0,
  eskiHukumluGecenAyErkek: 0, eskiHukumluGecenAyKadin: 0,
  eskiHukumluGirisErkek: 0, eskiHukumluGirisKadin: 0,
  eskiHukumluCikisErkek: 0, eskiHukumluCikisKadin: 0,
  eskiHukumluAySonuErkek: 0, eskiHukumluAySonuKadin: 0,
};

function recordToForm(r: any): HareketForm {
  const prevMonth = PERSONNEL_DATA.find((m) => m.no === (r.no ? r.no - 1 : 9));
  const gecenErkek = r.gecenAySonuErkek ?? prevMonth?.erkek ?? 0;
  const gecenKadin = r.gecenAySonuKadin ?? prevMonth?.kadin ?? 0;
  return {
    gecenAySonuErkek: gecenErkek,
    gecenAySonuKadin: gecenKadin,
    iseAlinanErkek: r.girisErkek ?? 0,
    iseAlinanKadin: r.girisKadin ?? 0,
    ayrilanErkek: r.cikisErkek ?? 0,
    ayrilanKadin: r.cikisKadin ?? 0,
    aySonuErkek: r.erkek ?? (gecenErkek + (r.girisErkek ?? 0) - (r.cikisErkek ?? 0)),
    aySonuKadin: r.kadin ?? (gecenKadin + (r.girisKadin ?? 0) - (r.cikisKadin ?? 0)),
    ozurluGecenAyErkek: r.ozurluGecenAyErkek ?? 0,
    ozurluGecenAyKadin: r.ozurluGecenAyKadin ?? 0,
    ozurluGirisErkek: r.ozurluGirisErkek ?? 0,
    ozurluGirisKadin: r.ozurluGirisKadin ?? 0,
    ozurluCikisErkek: r.ozurluCikisErkek ?? 0,
    ozurluCikisKadin: r.ozurluCikisKadin ?? 0,
    ozurluAySonuErkek: r.ozurluAySonuErkek ?? 0,
    ozurluAySonuKadin: r.ozurluAySonuKadin ?? 0,
    eskiHukumluGecenAyErkek: r.eskiHukumluGecenAyErkek ?? 0,
    eskiHukumluGecenAyKadin: r.eskiHukumluGecenAyKadin ?? 0,
    eskiHukumluGirisErkek: r.eskiHukumluGirisErkek ?? 0,
    eskiHukumluGirisKadin: r.eskiHukumluGirisKadin ?? 0,
    eskiHukumluCikisErkek: r.eskiHukumluCikisErkek ?? 0,
    eskiHukumluCikisKadin: r.eskiHukumluCikisKadin ?? 0,
    eskiHukumluAySonuErkek: r.eskiHukumluAySonuErkek ?? 0,
    eskiHukumluAySonuKadin: r.eskiHukumluAySonuKadin ?? 0,
  };
}

function NumInput({ value, onChange, disabled, color }: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue:   "border-blue-200 bg-blue-50/60 text-blue-800 focus:border-blue-400 focus:ring-blue-100",
    green:  "border-emerald-200 bg-emerald-50/60 text-emerald-800 focus:border-emerald-400 focus:ring-emerald-100",
    red:    "border-red-200 bg-red-50/60 text-red-800 focus:border-red-400 focus:ring-red-100",
    purple: "border-purple-200 bg-purple-50/60 text-purple-800 focus:border-purple-400 focus:ring-purple-100",
  };
  return (
    <input
      type="number"
      min={0}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-9 rounded-lg border px-2 text-sm font-bold text-center outline-none transition-all focus:ring-2
        ${disabled
          ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
          : color ? colorMap[color] : "border-slate-200 bg-white text-slate-800 focus:border-[#1F497D] focus:ring-[#1F497D]/10"
        }`}
    />
  );
}

function TotalCell({ value, color }: { value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue:   "text-blue-700 bg-blue-100 border-blue-200",
    green:  "text-emerald-700 bg-emerald-100 border-emerald-200",
    red:    "text-red-700 bg-red-100 border-red-200",
    purple: "text-purple-700 bg-purple-100 border-purple-200",
  };
  return (
    <div className={`h-9 flex items-center justify-center text-sm font-black rounded-lg border ${colorMap[color]}`}>
      {value}
    </div>
  );
}

function GroupRow({ label, bas, giris, cikis, son, onBas, onGiris, onCikis, onSon, disabled }: {
  label: string;
  bas: [number, number];
  giris: [number, number];
  cikis: [number, number];
  son: [number, number];
  onBas: (e: number, k: number) => void;
  onGiris: (e: number, k: number) => void;
  onCikis: (e: number, k: number) => void;
  onSon: (e: number, k: number) => void;
  disabled?: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
      <td className="py-3 pl-5 pr-3 align-middle">
        <span className="text-xs font-semibold text-slate-700 leading-tight block">{label}</span>
      </td>
      <td className="px-1 py-2 align-middle"><NumInput value={bas[0]} onChange={(v) => onBas(v, bas[1])} disabled={disabled} color="blue" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={bas[1]} onChange={(v) => onBas(bas[0], v)} disabled={disabled} color="blue" /></td>
      <td className="px-1 py-2 align-middle"><TotalCell value={bas[0]+bas[1]} color="blue" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={giris[0]} onChange={(v) => onGiris(v, giris[1])} disabled={disabled} color="green" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={giris[1]} onChange={(v) => onGiris(giris[0], v)} disabled={disabled} color="green" /></td>
      <td className="px-1 py-2 align-middle"><TotalCell value={giris[0]+giris[1]} color="green" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={cikis[0]} onChange={(v) => onCikis(v, cikis[1])} disabled={disabled} color="red" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={cikis[1]} onChange={(v) => onCikis(cikis[0], v)} disabled={disabled} color="red" /></td>
      <td className="px-1 py-2 align-middle"><TotalCell value={cikis[0]+cikis[1]} color="red" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={son[0]} onChange={(v) => onSon(v, son[1])} disabled={disabled} color="purple" /></td>
      <td className="px-1 py-2 align-middle"><NumInput value={son[1]} onChange={(v) => onSon(son[0], v)} disabled={disabled} color="purple" /></td>
      <td className="px-1 pr-5 py-2 align-middle"><TotalCell value={son[0]+son[1]} color="purple" /></td>
    </tr>
  );
}


export default function PersonelHareketPage() {
  const [activeUser, setActiveUser] = useState<any>(null);
  const [overrides, setOverrides] = useState<Record<number, any>>({});
  const [selected, setSelected] = useState<number>(10);
  const [form, setForm] = useState<HareketForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchOverrides() {
    setLoading(true);
    try { setOverrides(await getPersonnelOverrides()); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const u = localStorage.getItem("trizone_active_user");
    if (u) setActiveUser(JSON.parse(u));
    fetchOverrides();
  }, []);

  useEffect(() => {
    const ov = overrides[selected];
    if (ov) {
      setForm(recordToForm(ov));
    } else {
      const raw = PERSONNEL_DATA.find((r) => r.no === selected);
      setForm(raw ? recordToForm(raw) : EMPTY_FORM);
    }
    setSaved(false);
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, overrides]);

  const canEdit = CAN_EDIT_ROLES.includes(activeUser?.role);

  function upd(keys: Partial<HareketForm>) {
    setForm((p) => ({ ...p, ...keys }));
    setDirty(true);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await (savePersonnelOverride as any)(selected, {
        toplamPersonel: form.aySonuErkek + form.aySonuKadin,
        girisaSayisi: form.iseAlinanErkek + form.iseAlinanKadin,
        ayniAyCikisSayisi: form.ayrilanErkek + form.ayrilanKadin,
        toplamCikisSayisi: form.ayrilanErkek + form.ayrilanKadin,
        erkek: form.aySonuErkek, kadin: form.aySonuKadin,
        girisErkek: form.iseAlinanErkek, girisKadin: form.iseAlinanKadin,
        toplamAyCikis: form.ayrilanErkek + form.ayrilanKadin,
        cikisErkek: form.ayrilanErkek, cikisKadin: form.ayrilanKadin,
        gecenAySonuErkek: form.gecenAySonuErkek, gecenAySonuKadin: form.gecenAySonuKadin,
        ozurluGecenAyErkek: form.ozurluGecenAyErkek, ozurluGecenAyKadin: form.ozurluGecenAyKadin,
        ozurluGirisErkek: form.ozurluGirisErkek, ozurluGirisKadin: form.ozurluGirisKadin,
        ozurluCikisErkek: form.ozurluCikisErkek, ozurluCikisKadin: form.ozurluCikisKadin,
        ozurluAySonuErkek: form.ozurluAySonuErkek, ozurluAySonuKadin: form.ozurluAySonuKadin,
        eskiHukumluGecenAyErkek: form.eskiHukumluGecenAyErkek, eskiHukumluGecenAyKadin: form.eskiHukumluGecenAyKadin,
        eskiHukumluGirisErkek: form.eskiHukumluGirisErkek, eskiHukumluGirisKadin: form.eskiHukumluGirisKadin,
        eskiHukumluCikisErkek: form.eskiHukumluCikisErkek, eskiHukumluCikisKadin: form.eskiHukumluCikisKadin,
        eskiHukumluAySonuErkek: form.eskiHukumluAySonuErkek, eskiHukumluAySonuKadin: form.eskiHukumluAySonuKadin,
      });
      await fetchOverrides();
      setSaved(true); setDirty(false);
      window.dispatchEvent(new Event("personel-data-updated"));
    } finally { setSaving(false); }
  }

  async function handleReset() {
    setSaving(true);
    try { await deletePersonnelOverride(selected); await fetchOverrides(); setSaved(false); setDirty(false); }
    finally { setSaving(false); }
  }

  const selectedMonth = PERSONNEL_DATA.find((r) => r.no === selected);
  const toplamGiris = form.iseAlinanErkek + form.iseAlinanKadin;
  const toplamCikis = form.ayrilanErkek + form.ayrilanKadin;
  const toplamSon = form.aySonuErkek + form.aySonuKadin;
  const netDegisim = toplamGiris - toplamCikis;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1F497D]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Başlık */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Personel Hareket Tablosu</h1>
          <p className="text-sm text-slate-500 mt-1">SGK personel hareket bildirimi — aylık giriş, çıkış ve cinsiyet kırılımı</p>
        </div>
        {selectedMonth && (
          <span className="text-xs font-bold bg-[#1F497D]/10 text-[#1F497D] px-3 py-1.5 rounded-full border border-[#1F497D]/20">
            {selectedMonth.ay} 2026
          </span>
        )}
      </div>

      {/* Yetki uyarısı */}
      {!canEdit && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4 text-sm">
          <Lock className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Düzenleme Yetkiniz Yok</p>
            <p className="text-xs mt-0.5 text-amber-700">
              Veri girişi yalnızca İK Şefi, İK Uzmanı ve Sistem Yöneticisi rollerine açıktır.
              Mevcut rolünüz: <strong>{activeUser?.role ?? "Bilinmiyor"}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Ay seçici */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-[#1F497D]" />Ay Seçin
        </h2>
        <div className="flex flex-wrap gap-2">
          {PERSONNEL_DATA.map((r) => {
            const hasOv = !!overrides[r.no];
            const isSel = r.no === selected;
            return (
              <button key={r.no} onClick={() => setSelected(r.no)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all border
                  ${isSel ? "bg-[#1F497D] text-white border-[#1F497D] shadow-md scale-105" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#1F497D]/40 hover:bg-slate-100"}`}>
                {r.ay}
                {hasOv && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />}
                {r.isCurrentMonth && !hasOv && <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-5 mt-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Kaydedilmiş</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />Mevcut ay</span>
        </div>
      </div>

      {/* KPI Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ay Sonu Personel", val: toplamSon, sub: `${form.aySonuErkek}E / ${form.aySonuKadin}K`, icon: Users, grad: "from-[#1F497D] to-[#2a5f9e]" },
          { label: "İşe Alınan", val: toplamGiris, sub: `${form.iseAlinanErkek}E / ${form.iseAlinanKadin}K`, icon: UserPlus, grad: "from-emerald-500 to-emerald-600" },
          { label: "İşten Ayrılan", val: toplamCikis, sub: `${form.ayrilanErkek}E / ${form.ayrilanKadin}K`, icon: UserMinus, grad: "from-red-500 to-red-600" },
          { label: "Net Değişim", val: netDegisim, sub: netDegisim >= 0 ? "Artış" : "Azalış", icon: netDegisim >= 0 ? TrendingUp : TrendingDown, grad: netDegisim >= 0 ? "from-teal-500 to-teal-600" : "from-orange-500 to-orange-600" },
        ].map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.grad} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold opacity-80">{c.label}</span>
              <c.icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="text-3xl font-black">{c.val > 0 && c.label === "Net Değişim" ? "+" : ""}{c.val}</div>
            <div className="text-xs opacity-70 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Ana tablo */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <PencilLine className="h-4 w-4 text-[#1F497D]" />
            {selectedMonth?.ay} 2026 — Veri Girişi
            {selectedMonth?.isCurrentMonth && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Devam Ediyor</span>
            )}
          </h2>
          {overrides[selected] && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />Kaydedilmiş
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pl-5 pr-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-48"></th>
                <th colSpan={3} className="px-3 py-3 text-center text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 border-x border-blue-100">Geçen Ay Sonu</th>
                <th colSpan={3} className="px-3 py-3 text-center text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 border-x border-emerald-100">Ay İçinde İşe Alınan</th>
                <th colSpan={3} className="px-3 py-3 text-center text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 border-x border-red-100">Ay İçinde İşten Ayrılan</th>
                <th colSpan={3} className="px-3 py-3 text-center text-[10px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 border-x border-purple-100">Ay Sonu</th>
              </tr>
              <tr className="border-b border-slate-200">
                <th className="py-2 pl-5 pr-3 text-left"></th>
                {["Erkek","Kadın","Toplam","Erkek","Kadın","Toplam","Erkek","Kadın","Toplam","Erkek","Kadın","Toplam"].map((h, i) => (
                  <th key={i} className={`px-1 py-2 text-center text-[10px] font-bold uppercase
                    ${i<3?"text-blue-500 bg-blue-50/50":""}
                    ${i>=3&&i<6?"text-emerald-500 bg-emerald-50/50":""}
                    ${i>=6&&i<9?"text-red-500 bg-red-50/50":""}
                    ${i>=9?"text-purple-500 bg-purple-50/50":""}
                  `}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <GroupRow
                label="Çalışan Sayısı"
                bas={[form.gecenAySonuErkek, form.gecenAySonuKadin]}
                giris={[form.iseAlinanErkek, form.iseAlinanKadin]}
                cikis={[form.ayrilanErkek, form.ayrilanKadin]}
                son={[form.aySonuErkek, form.aySonuKadin]}
                onBas={(e,k) => upd({ gecenAySonuErkek: e, gecenAySonuKadin: k })}
                onGiris={(e,k) => upd({ iseAlinanErkek: e, iseAlinanKadin: k })}
                onCikis={(e,k) => upd({ ayrilanErkek: e, ayrilanKadin: k })}
                onSon={(e,k) => upd({ aySonuErkek: e, aySonuKadin: k })}
                disabled={!canEdit}
              />
            </tbody>
          </table>
        </div>

        {/* Kaydet / Sıfırla */}
        {canEdit && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
            <button
              onClick={handleSave} disabled={!dirty || saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
                ${dirty && !saving ? "bg-[#1F497D] text-white hover:bg-[#183d6f] shadow-lg shadow-[#1F497D]/20 active:scale-[0.98]" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              onClick={handleReset} disabled={!overrides[selected] || saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${overrides[selected] && !saving ? "border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.98]" : "border-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              <RotateCcw className="h-4 w-4" />Orijinale Döndür
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />Başarıyla kaydedildi
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tüm aylar özet tablosu */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-700">Tüm Aylar Özeti — 2026</h2>
          <p className="text-xs text-slate-400 mt-0.5">Satıra tıklayarak ilgili aya geçiş yapabilirsiniz</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Ay","Geçen Ay Sonu","İşe Alınan","İşten Ayrılan","Ay Sonu Toplam","Erkek","Kadın","Net Değişim","Durum"].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONNEL_DATA.map((r) => {
                const ov = overrides[r.no] ?? r;
                const bas = (ov.gecenAySonuErkek ?? 0) + (ov.gecenAySonuKadin ?? 0);
                const prevMonth = PERSONNEL_DATA.find((p) => p.no === r.no - 1);
                const basDisplay = bas > 0 ? bas : (prevMonth?.toplamPersonel ?? "—");
                const giris = (ov.girisErkek ?? 0) + (ov.girisKadin ?? 0) || ov.girisaSayisi || 0;
                const cikis = (ov.cikisErkek ?? 0) + (ov.cikisKadin ?? 0) || ov.ayniAyCikisSayisi || 0;
                const son = (ov.erkek ?? 0) + (ov.kadin ?? 0);
                const net = giris - cikis;
                const hasOv = !!overrides[r.no];
                const isActive = r.no === selected;
                return (
                  <tr key={r.no} onClick={() => setSelected(r.no)}
                    className={`border-b border-slate-100 cursor-pointer transition-colors
                      ${isActive ? "bg-[#1F497D]/5 border-l-4 border-l-[#1F497D]" : "hover:bg-slate-50"}`}>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      <span className="flex items-center gap-2">
                        {r.ay}
                        {r.isCurrentMonth && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-[#1F497D]" />}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-blue-700 font-semibold">{basDisplay}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{giris || "—"}</td>
                    <td className="py-3 px-4 text-red-500 font-semibold">{cikis || "—"}</td>
                    <td className="py-3 px-4 text-slate-800 font-black">{son}</td>
                    <td className="py-3 px-4 text-[#1F497D] font-semibold">{ov.erkek ?? 0}</td>
                    <td className="py-3 px-4 text-[#4472C4] font-semibold">{ov.kadin ?? 0}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${net > 0 ? "text-emerald-600" : net < 0 ? "text-red-500" : "text-slate-400"}`}>
                        {net !== 0 ? (net > 0 ? `+${net}` : net) : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {hasOv
                        ? <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold"><CheckCircle2 className="h-2.5 w-2.5" />Kayıtlı</span>
                        : <span className="text-[10px] text-slate-400 font-medium">Orijinal</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Güncellenen veriler Firebase'e kaydedilir — tüm kullanıcılara anında yansır.
          </p>
        </div>
      </div>
    </div>
  );
}
