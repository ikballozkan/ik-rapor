"use client";

import { useState, useMemo } from "react";
import { PERSONNEL_DATA } from "@/lib/personnel-data";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus, GitCompare,
} from "lucide-react";

// ─── Sabitler ────────────────────────────────────────────────────────────────
const KPI_OPTIONS = [
  { value: "toplamPersonel", label: "Toplam Personel", unit: "kişi" },
  { value: "giris",          label: "İşe Giriş",       unit: "kişi" },
  { value: "cikis",          label: "Çıkış (Ay İçi)",  unit: "kişi" },
  { value: "erkek",          label: "Erkek Personel",  unit: "kişi" },
  { value: "kadin",          label: "Kadın Personel",  unit: "kişi" },
];

const AY_LISTESI = [
  { value: 1, label: "Ocak" },
  { value: 2, label: "Şubat" },
  { value: 3, label: "Mart" },
  { value: 4, label: "Nisan" },
  { value: 5, label: "Mayıs" },
  { value: 6, label: "Haziran" },
];

// Veri okuma yardımcısı
const getVal = (r: any, key: string): number => {
  if (key === "giris") return r.girisaSayisi ?? 0;
  if (key === "cikis") return r.ayniAyCikisSayisi ?? 0;
  return r[key] ?? 0;
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-2xl rounded-xl px-4 py-3 min-w-[170px]">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-5 py-0.5">
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}
          </span>
          <span className="text-sm font-bold text-slate-800">{p.value?.toLocaleString("tr-TR")} {unit ?? ""}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, change, color }: {
  label: string; value: number; unit: string; change?: number; color: string;
}) {
  const dir = change === undefined || Math.abs(change) < 0.1 ? null : change > 0 ? "up" : "down";
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <span className="text-4xl font-black" style={{ color }}>{value.toLocaleString("tr-TR")}</span>
          <span className="text-sm text-slate-400 ml-1">{unit}</span>
        </div>
        {change !== undefined && dir && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
            dir === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ay Seçici Chip ──────────────────────────────────────────────────────────
function AyChip({
  ay, selected, color, onClick, disabled,
}: {
  ay: { value: number; label: string };
  selected: boolean; color: string; onClick: () => void; disabled?: boolean;
}) {
  const hasData = PERSONNEL_DATA.some(r => r.ayIndex === ay.value && r.toplamPersonel > 0);
  const isCurrent = PERSONNEL_DATA.find(r => r.ayIndex === ay.value)?.isCurrentMonth;
  return (
    <button
      onClick={onClick}
      disabled={disabled || !hasData}
      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
        !hasData ? "opacity-30 cursor-not-allowed bg-slate-50 text-slate-300 border border-slate-200" :
        disabled ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-200" :
        selected
          ? `text-white shadow-md border border-transparent`
          : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
      }`}
      style={selected ? { background: color } : {}}
    >
      {ay.label}
      {isCurrent && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white" />
      )}
    </button>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function ComparisonsPage() {
  // ── Bölüm 1: Tek KPI, seçili aylar trendi
  const [kpi1,     setKpi1]     = useState("toplamPersonel");
  const [seciliAylar, setSeciliAylar] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  // ── Bölüm 2: İki ay karşılaştırması
  const [ay1,      setAy1]      = useState<number>(4); // Nisan
  const [ay2,      setAy2]      = useState<number>(5); // Mayıs

  // ── Bölüm 3: İki KPI karşılaştırması, seçili ay aralığı
  const [metric1,  setMetric1]  = useState("toplamPersonel");
  const [metric2,  setMetric2]  = useState("giris");

  const kpiDef1 = KPI_OPTIONS.find(k => k.value === kpi1)!;

  // Veri: Seçili aylara göre filtrele
  const filteredTrend = useMemo(() => {
    return PERSONNEL_DATA
      .filter(r => r.toplamPersonel > 0 && seciliAylar.includes(r.ayIndex))
      .map(r => ({
        name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
        fullAy: r.ay,
        value: getVal(r, kpi1),
        current: r.isCurrentMonth,
      }));
  }, [kpi1, seciliAylar]);

  // Ay bazlı karşılaştırma verileri
  const dataAy1 = PERSONNEL_DATA.find(r => r.ayIndex === ay1);
  const dataAy2 = PERSONNEL_DATA.find(r => r.ayIndex === ay2);

  const ayKarsilastirmaData = KPI_OPTIONS.map(opt => ({
    name: opt.label,
    [AY_LISTESI.find(a => a.value === ay1)?.label ?? "Ay 1"]: dataAy1 ? getVal(dataAy1, opt.value) : 0,
    [AY_LISTESI.find(a => a.value === ay2)?.label ?? "Ay 2"]: dataAy2 ? getVal(dataAy2, opt.value) : 0,
  }));

  // İki KPI dual data
  const dualData = useMemo(() => {
    return PERSONNEL_DATA.filter(r => r.toplamPersonel > 0).map(r => ({
      name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
      [metric1]: getVal(r, metric1),
      [metric2]: getVal(r, metric2),
      current: r.isCurrentMonth,
    }));
  }, [metric1, metric2]);

  // İstatistikler (Bölüm 1)
  const vals = filteredTrend.map(d => d.value);
  const avgVal = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const maxVal = vals.length ? Math.max(...vals) : 0;
  const minVal = vals.length ? Math.min(...vals) : 0;
  const latestFiltered = filteredTrend[filteredTrend.length - 1]?.value ?? 0;
  const prevFiltered   = filteredTrend[filteredTrend.length - 2]?.value ?? 0;
  const momChange = prevFiltered > 0 ? ((latestFiltered - prevFiltered) / prevFiltered) * 100 : 0;

  const ayLabel1 = AY_LISTESI.find(a => a.value === ay1)?.label ?? "";
  const ayLabel2 = AY_LISTESI.find(a => a.value === ay2)?.label ?? "";
  const kpiLabel1 = KPI_OPTIONS.find(k => k.value === metric1)?.label ?? "";
  const kpiLabel2 = KPI_OPTIONS.find(k => k.value === metric2)?.label ?? "";

  function toggleAy(v: number) {
    setSeciliAylar(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v].sort((a, b) => a - b)
    );
  }

  return (
    <div className="flex flex-col space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Karşılaştırmalar</h1>
        <p className="text-sm text-slate-400 mt-1">Aylık personel verilerini dilediğiniz şekilde karşılaştırın.</p>
      </div>

      {/* ════════════════════════════════════════════════════════
          BÖLÜM 1 — Tek KPI, istediğim aylar
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-[#1F497D]" />
          <h2 className="text-base font-bold text-slate-800">Aylık Trend — Ay Seçimi</h2>
        </div>

        {/* Kontrol paneli */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-5">
          {/* KPI pill seçici */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Metrik</p>
            <div className="flex flex-wrap gap-2">
              {KPI_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setKpi1(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    kpi1 === opt.value
                      ? "bg-[#1F497D] text-white shadow-md shadow-[#1F497D]/25"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:border-[#1F497D]/50"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ay çoklu seçici */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gösterilecek Aylar</p>
              <div className="flex gap-2">
                <button onClick={() => setSeciliAylar(AY_LISTESI.filter(a => PERSONNEL_DATA.some(r => r.ayIndex === a.value && r.toplamPersonel > 0)).map(a => a.value))}
                  className="text-xs text-[#1F497D] hover:underline font-medium">Tümünü Seç</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => setSeciliAylar([])}
                  className="text-xs text-slate-400 hover:underline font-medium">Temizle</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {AY_LISTESI.map(ay => (
                <AyChip key={ay.value} ay={ay}
                  selected={seciliAylar.includes(ay.value)}
                  color="#1F497D"
                  onClick={() => toggleAy(ay.value)}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              🟡 Sarı rozet = ay devam ediyor
            </p>
          </div>
        </div>

        {/* İstatistik kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Son Seçili Ay"    value={latestFiltered}    unit={kpiDef1.unit} change={momChange} color="#1F497D" />
          <StatCard label="Önceki Ay"        value={prevFiltered}      unit={kpiDef1.unit} color="#4472C4" />
          <StatCard label="Seçili Dönem Ort" value={Math.round(avgVal)} unit={kpiDef1.unit} color="#64748b" />
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Aralık</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> En Yüksek</span>
                <span className="text-sm font-bold text-emerald-600">{maxVal.toLocaleString("tr-TR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5 text-red-500" /> En Düşük</span>
                <span className="text-sm font-bold text-red-500">{minVal.toLocaleString("tr-TR")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik */}
        {filteredTrend.length > 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-bold text-slate-800">{kpiDef1.label} — Trend</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {seciliAylar.length === AY_LISTESI.filter(a => PERSONNEL_DATA.some(r => r.ayIndex === a.value)).length
                    ? "Tüm aylar gösteriliyor" : `${seciliAylar.length} ay seçildi`}
                </p>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredTrend} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTooltip unit={kpiDef1.unit} />} />
                  {filteredTrend.length > 1 && (
                    <ReferenceLine y={Math.round(avgVal)} stroke="#cbd5e1" strokeDasharray="5 5"
                      label={{ value: "Ort.", position: "insideTopRight", fontSize: 11, fill: "#94a3b8" }} />
                  )}
                  <Line type="monotone" dataKey="value" name={kpiDef1.label}
                    stroke="#1F497D" strokeWidth={3}
                    dot={(p: any) => (
                      <circle key={p.key} cx={p.cx} cy={p.cy}
                        r={p.payload.current ? 7 : 5}
                        fill={p.payload.current ? "#f59e0b" : "#1F497D"}
                        stroke="white" strokeWidth={2.5}
                      />
                    )}
                    activeDot={{ r: 8, fill: "#1F497D", stroke: "white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-12 text-center text-slate-400">
            Gösterilecek ay seçin.
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════
          BÖLÜM 2 — İki ay karşılaştırması (tüm KPI'lar)
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-[#4472C4]" />
          <h2 className="text-base font-bold text-slate-800">İki Ay Karşılaştırması</h2>
        </div>

        {/* Ay seçici */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">1. Ay</p>
              <div className="flex flex-wrap gap-2">
                {AY_LISTESI.map(ay => (
                  <AyChip key={ay.value} ay={ay}
                    selected={ay1 === ay.value}
                    color="#1F497D"
                    onClick={() => setAy1(ay.value)}
                    disabled={ay.value === ay2}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">2. Ay</p>
              <div className="flex flex-wrap gap-2">
                {AY_LISTESI.map(ay => (
                  <AyChip key={ay.value} ay={ay}
                    selected={ay2 === ay.value}
                    color="#4472C4"
                    onClick={() => setAy2(ay.value)}
                    disabled={ay.value === ay1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bar grafik */}
        {dataAy1 && dataAy2 && (
          <>
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center gap-6 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1F497D]" />
                  <span className="text-sm font-semibold text-slate-700">{ayLabel1}</span>
                </div>
                <span className="text-slate-200 text-lg">vs</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4472C4]" />
                  <span className="text-sm font-semibold text-slate-700">{ayLabel2}</span>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ayKarsilastirmaData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                    <Tooltip content={<ChartTooltip unit="kişi" />} />
                    <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                    <Bar dataKey={ayLabel1} fill="#1F497D" radius={[6, 6, 0, 0]} maxBarSize={44} />
                    <Bar dataKey={ayLabel2} fill="#4472C4" radius={[6, 6, 0, 0]} maxBarSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Karşılaştırma detay tablosu */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Detaylı Karşılaştırma</h3>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1F497D]" />{ayLabel1}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4472C4]" />{ayLabel2}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {KPI_OPTIONS.map(opt => {
                    const v1 = getVal(dataAy1, opt.value);
                    const v2 = getVal(dataAy2, opt.value);
                    const diff = v2 - v1;
                    const pct = v1 > 0 ? ((diff / v1) * 100).toFixed(1) : null;
                    return (
                      <tr key={opt.value} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-600 w-1/3">{opt.label}</td>
                        <td className="py-3.5 px-4 font-bold text-[#1F497D] text-right w-1/5">
                          {v1.toLocaleString("tr-TR")} {opt.unit}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#4472C4] text-right w-1/5">
                          {v2.toLocaleString("tr-TR")} {opt.unit}
                        </td>
                        <td className="py-3.5 px-6 text-right w-1/5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            diff > 0 ? "bg-emerald-50 text-emerald-600" :
                            diff < 0 ? "bg-red-50 text-red-500" :
                            "bg-slate-100 text-slate-400"
                          }`}>
                            {diff > 0 ? <ArrowUpRight className="h-3 w-3" /> :
                             diff < 0 ? <ArrowDownRight className="h-3 w-3" /> :
                             <Minus className="h-3 w-3" />}
                            {diff > 0 ? "+" : ""}{diff} {pct ? `(${pct > "0" ? "+" : ""}${pct}%)` : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════
          BÖLÜM 3 — İki KPI yan yana (tüm aylar)
      ════════════════════════════════════════════════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-emerald-500" />
          <h2 className="text-base font-bold text-slate-800">İki Metrik Karşılaştırması</h2>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">1. Metrik</p>
              <div className="flex flex-wrap gap-2">
                {KPI_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setMetric1(opt.value)}
                    disabled={opt.value === metric2}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      metric1 === opt.value ? "bg-[#1F497D] text-white border-transparent shadow-sm" :
                      opt.value === metric2 ? "opacity-30 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200" :
                      "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#1F497D]/60"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">2. Metrik</p>
              <div className="flex flex-wrap gap-2">
                {KPI_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setMetric2(opt.value)}
                    disabled={opt.value === metric1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      metric2 === opt.value ? "bg-[#4472C4] text-white border-transparent shadow-sm" :
                      opt.value === metric1 ? "opacity-30 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200" :
                      "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#4472C4]/60"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-6 mb-5">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1F497D]" /><span className="text-sm font-medium text-slate-700">{kpiLabel1}</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#4472C4]" /><span className="text-sm font-medium text-slate-700">{kpiLabel2}</span></div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dualData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<ChartTooltip unit="kişi" />} />
                <Bar dataKey={metric1} name={kpiLabel1} fill="#1F497D" radius={[6, 6, 0, 0]} maxBarSize={44} />
                <Bar dataKey={metric2} name={kpiLabel2} fill="#4472C4" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
