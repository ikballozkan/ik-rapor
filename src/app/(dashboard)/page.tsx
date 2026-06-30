"use client";

import { useState, useEffect } from "react";
import { usePersonnelData } from "@/lib/use-personnel-data";
import { getTrendData } from "@/app/actions";
import {
  Users, UserPlus, UserMinus, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Loader2, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Renkler ─────────────────────────────────────────────────────────────────
const C1 = "#1F497D";
const C2 = "#4472C4";
const C3 = "#F59E0B";
const C4 = "#EF4444";
const C5 = "#10B981";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 shadow-2xl rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-5 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}
          </span>
          <span className="font-bold text-slate-800">{p.value?.toLocaleString("tr-TR")}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  title, value, sub, icon: Icon, change, accentColor, inverted = false,
}: {
  title: string; value: string; sub?: string; icon: any;
  change?: number; accentColor: string; inverted?: boolean;
}) {
  const isGood = change === undefined ? null
    : inverted ? change <= 0 : change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl`} style={{ background: accentColor + "18" }}>
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
            isGood === null ? "bg-slate-100 text-slate-500" :
            isGood ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}>
            {isGood ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-slate-800 tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 mt-1.5 font-medium">{title}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Cinsiyet pie label ───────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="700">
      {value}
    </text>
  );
};

export default function DashboardPage() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [kpiLoading, setKpiLoading] = useState(true);
  const { latest, prev, changes, personnelTrend, genderData, ready } = usePersonnelData();

  useEffect(() => {
    getTrendData().then(d => { setTrendData(d); setKpiLoading(false); });
  }, []);

  if (!ready || kpiLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#1F497D]" />
    </div>
  );

  const lastKpi = trendData.length > 0 ? trendData[trendData.length - 1]
    : { sirkulasyon: 0, devamsizlik: 0, fazlaMesai: 0, isKazasi: 0 };

  return (
    <div className="flex flex-col space-y-8">

      {/* ── Başlık ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Güncel Dönem: <span className="font-semibold text-[#1F497D]">{latest.ay} 2026</span>
            {latest.isCurrentMonth && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                Ay devam ediyor
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── KPI Kartları ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Toplam Aktif Personel" value={latest.toplamPersonel.toLocaleString("tr-TR")}
          sub={`Erkek: ${latest.erkek} / Kadın: ${latest.kadin}`}
          icon={Users} change={changes.toplam} accentColor={C1} />
        <KpiCard title="İşe Giriş (Bu Ay)" value={latest.girisaSayisi.toString()}
          sub={`Geçen ay: ${prev.girisaSayisi} kişi`}
          icon={UserPlus} change={changes.giris} accentColor={C5} />
        <KpiCard title="Aynı Ay Çıkış" value={latest.ayniAyCikisSayisi.toString()}
          sub={`Geçen ay: ${prev.ayniAyCikisSayisi} kişi`}
          icon={UserMinus} change={changes.cikis} accentColor={C4} inverted />
        <KpiCard title="Toplam Çıkış (YTD)" value={latest.toplamCikisSayisi.toString()}
          sub="Yılın başından beri"
          icon={TrendingDown} accentColor={C3} />
      </div>

      {/* ── Grafik Satırı 1 ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Toplam Personel Alan Grafiği */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-800">Toplam Personel Trendi</h2>
              <p className="text-xs text-slate-400">OCAK → HAZİRAN 2026</p>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={personnelTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradToplam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C1} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C1} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Toplam" stroke={C1} strokeWidth={3}
                  fill="url(#gradToplam)"
                  dot={(p: any) => (
                    <circle key={p.key} cx={p.cx} cy={p.cy} r={p.payload.current ? 7 : 4}
                      fill={p.payload.current ? C3 : C1} stroke="white" strokeWidth={2} />
                  )}
                  activeDot={{ r: 7, fill: C1, stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cinsiyet Pasta */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="mb-5">
            <h2 className="font-bold text-slate-800">Cinsiyet Dağılımı</h2>
            <p className="text-xs text-slate-400">{latest.ay} 2026</p>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="48%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value"
                  labelLine={false} label={renderPieLabel}>
                  <Cell fill={C1} />
                  <Cell fill={C2} />
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="bottom" height={36}
                  formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex divide-x divide-slate-100 pt-3 border-t border-slate-100 mt-2">
            <div className="flex-1 text-center">
              <div className="text-xl font-black text-[#1F497D]">{latest.erkek}</div>
              <div className="text-[11px] text-slate-400">Erkek</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xl font-black text-[#4472C4]">{latest.kadin}</div>
              <div className="text-[11px] text-slate-400">Kadın</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grafik Satırı 2 ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Giriş / Çıkış Bar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-bold text-slate-800">Aylık Personel Hareketleri</h2>
            <p className="text-xs text-slate-400">Giriş ve çıkış sayıları karşılaştırması</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                <Bar dataKey="Giriş" fill={C5} radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Çıkış" fill={C4} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Erkek/Kadın stacked trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-bold text-slate-800">Erkek / Kadın Trendi</h2>
            <p className="text-xs text-slate-400">Aylık kırılım</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personnelTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                <Bar dataKey="Erkek" stackId="a" fill={C1} />
                <Bar dataKey="Kadın" stackId="a" fill={C2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── KPI Metrikleri (Firebase'den) ── */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-5">
            <h2 className="font-bold text-slate-800">KPI Metrikleri</h2>
            <p className="text-xs text-slate-400">Sirkülasyon, devamsızlık, fazla mesai, iş kazası</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                <Line type="monotone" dataKey="sirkulasyon" name="Sirkülasyon %" stroke={C1} strokeWidth={2.5} dot={{ r: 4, fill: C1, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="devamsizlik" name="Devamsızlık %" stroke={C3} strokeWidth={2.5} dot={{ r: 4, fill: C3, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="isKazasi" name="İş Kazası" stroke={C4} strokeWidth={2.5} dot={{ r: 4, fill: C4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
