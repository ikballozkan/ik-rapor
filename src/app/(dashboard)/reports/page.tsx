"use client";

import { useState } from "react";
import {
  PERSONNEL_DATA, LATEST_PERSONNEL,
} from "@/lib/personnel-data";
import {
  HISTORICAL_SUMMARY_2025,
  SIRKULASYON_2025,
  DEVAMSIZLIK_2025,
  FAZLAMESAI_2025,
  ISKAZA_2025,
  EGITIM_2025,
  IC_TERFI_2025,
  GORUSME_ISEALIM_2025,
  CINSIYET_2025,
  EGITIM_DURUMU_2025,
  DIREK_ENDIREKT_2025,
  YAS_ORTALAMA_2025,
} from "@/lib/historical-data";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown,
  Users, Activity, Clock, BookOpen, AlertTriangle, ArrowUpRight,
  ChevronDown, ChevronUp, BarChart2,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Renkler ─────────────────────────────────────────────────────────────────
const C = ["#1F497D", "#4472C4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 text-sm">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            {p.name}
          </span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Section bileşeni ────────────────────────────────────────────────────────
function Section({ title, icon: Icon, color, children, defaultOpen = true }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o: boolean) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: color + "18" }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <span className="font-bold text-slate-800">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

// ─── Yıl seçici ──────────────────────────────────────────────────────────────
const YILLAR = ["2025", "2026"];

export default function ReportsPage() {
  const [activeYear, setActiveYear] = useState("2025");
  const [downloading, setDownloading] = useState<string | null>(null);

  // ── PDF İndir ──
  async function downloadPDF(section: string) {
    setDownloading("pdf-" + section);
    await new Promise(r => setTimeout(r, 400));
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`IK KPI Raporu — ${activeYear}`, 14, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, 14, 26);

    if (section === "sirkulasyon") {
      autoTable(doc, {
        head: [["Ay", "Oran (%)", "Yıl"]],
        body: SIRKULASYON_2025.map(r => [r.ay, `%${(r.oran * 100).toFixed(2)}`, r.yil]),
        startY: 35,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 73, 125] },
      });
    } else if (section === "devamsizlik") {
      autoTable(doc, {
        head: [["Ay", "Oran (%)", "Yıl"]],
        body: DEVAMSIZLIK_2025.map(r => [r.ay, `%${(r.oran * 100).toFixed(2)}`, r.yil]),
        startY: 35,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [68, 114, 196] },
      });
    } else if (section === "personel") {
      autoTable(doc, {
        head: [["Ay", "Toplam", "Giriş", "Çıkış", "Erkek", "Kadın"]],
        body: PERSONNEL_DATA.map(r => [r.ay, r.toplamPersonel, r.girisaSayisi, r.ayniAyCikisSayisi, r.erkek, r.kadin]),
        startY: 35,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 73, 125] },
      });
    } else {
      // Genel özet
      autoTable(doc, {
        head: [["KPI", "2025 Ortalaması"]],
        body: [
          ["Personel Sirkülasyon", HISTORICAL_SUMMARY_2025.sirkulasyonOrt],
          ["Devamsızlık",          HISTORICAL_SUMMARY_2025.devamsizlikOrt],
          ["Fazla Mesai",          HISTORICAL_SUMMARY_2025.fazlaMesaiOrt],
          ["İş Kazası Ort.",       HISTORICAL_SUMMARY_2025.isKazasiOrt],
          ["Toplam Eğitim Saati",  String(HISTORICAL_SUMMARY_2025.toplamEgitimSaati) + " sa"],
          ["İç Terfi Toplam",      String(HISTORICAL_SUMMARY_2025.icTerfiToplam) + " kişi"],
          ["Erkek Oranı",          HISTORICAL_SUMMARY_2025.erkekOrani],
          ["Kadın Oranı",          HISTORICAL_SUMMARY_2025.kadinOrani],
        ],
        startY: 35,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 73, 125] },
      });
    }
    doc.save(`ik_raporu_${activeYear}_${section}.pdf`);
    setDownloading(null);
  }

  // ── Excel İndir ──
  function downloadExcel(section: string) {
    setDownloading("excel-" + section);
    let rows: any[] = [];
    let sheetName = "Rapor";

    if (section === "sirkulasyon") {
      rows = SIRKULASYON_2025.map(r => ({ Ay: r.ay, "Oran (%)": (r.oran * 100).toFixed(2), Yıl: r.yil }));
      sheetName = "Sirkülasyon";
    } else if (section === "devamsizlik") {
      rows = DEVAMSIZLIK_2025.map(r => ({ Ay: r.ay, "Oran (%)": (r.oran * 100).toFixed(2), Yıl: r.yil }));
      sheetName = "Devamsızlık";
    } else if (section === "egitim") {
      rows = EGITIM_2025.map(r => ({ "Dönem": r.donem, "Kişi": r.kisiSayisi, "Toplam Adam/Saat": r.toplamAdamSaat, "Eğitim Saati": r.donemselEgitimSaati }));
      sheetName = "Eğitim";
    } else if (section === "gorusme") {
      rows = GORUSME_ISEALIM_2025.map(r => ({ Ay: r.ay, "Çağrılan": r.gorusmeyCagrilan, "Görüşülen": r.gorusulen, "İşe Alınan": r.iseAlinan }));
      sheetName = "Görüşme-İşe Alım";
    } else if (section === "personel2026") {
      rows = PERSONNEL_DATA.map(r => ({
        Ay: r.ay, "Toplam": r.toplamPersonel, "Giriş": r.girisaSayisi,
        "Çıkış": r.ayniAyCikisSayisi, "Erkek": r.erkek, "Kadın": r.kadin,
      }));
      sheetName = "Personel 2026";
    } else {
      // Genel özet
      rows = [
        { KPI: "Personel Sirkülasyon",  "2025 Ort.": HISTORICAL_SUMMARY_2025.sirkulasyonOrt },
        { KPI: "Devamsızlık",           "2025 Ort.": HISTORICAL_SUMMARY_2025.devamsizlikOrt },
        { KPI: "Fazla Mesai",           "2025 Ort.": HISTORICAL_SUMMARY_2025.fazlaMesaiOrt  },
        { KPI: "İş Kazası",             "2025 Ort.": HISTORICAL_SUMMARY_2025.isKazasiOrt    },
        { KPI: "Toplam Eğitim Saati",   "2025 Ort.": HISTORICAL_SUMMARY_2025.toplamEgitimSaati },
        { KPI: "İç Terfi",              "2025 Ort.": HISTORICAL_SUMMARY_2025.icTerfiToplam  },
        { KPI: "Erkek Oranı",           "2025 Ort.": HISTORICAL_SUMMARY_2025.erkekOrani     },
        { KPI: "Kadın Oranı",           "2025 Ort.": HISTORICAL_SUMMARY_2025.kadinOrani     },
      ];
      sheetName = "Özet";
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `ik_raporu_${activeYear}_${section}.xlsx`);
    setDownloading(null);
  }

  // ─── Yardımcı: İndir butonları
  function DlButtons({ section }: { section: string }) {
    return (
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => downloadPDF(section)}
          disabled={!!downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <FileText className="h-3.5 w-3.5" />
          {downloading === "pdf-" + section ? "..." : "PDF"}
        </button>
        <button
          onClick={() => downloadExcel(section)}
          disabled={!!downloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          {downloading === "excel-" + section ? "..." : "Excel"}
        </button>
      </div>
    );
  }

  // ─── Sirkülasyon chart data
  const sirChart = SIRKULASYON_2025.map(r => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
    "%": Number((r.oran * 100).toFixed(2)),
  }));

  const devChart = DEVAMSIZLIK_2025.map(r => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
    "%": Number((r.oran * 100).toFixed(2)),
  }));

  const kazaChart = ISKAZA_2025.filter(r => r.adet > 0).map(r => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
    "Kaza": r.adet,
  }));

  const direkChart = DIREK_ENDIREKT_2025.map(r => ({
    name: r.ay, "Direk": r.direkOrani, "Endirekt": r.endirektOrani,
  }));

  const gorusmeChart = GORUSME_ISEALIM_2025.map(r => ({
    name: r.ay, "Çağrılan": r.gorusmeyCagrilan, "Görüşülen": r.gorusulen, "İşe Alınan": r.iseAlinan,
  }));

  const personelChart2026 = PERSONNEL_DATA.filter(r => r.toplamPersonel > 0).map(r => ({
    name: r.ay.charAt(0) + r.ay.slice(1).toLowerCase().substring(0, 2),
    "Toplam": r.toplamPersonel, "Giriş": r.girisaSayisi, "Çıkış": r.ayniAyCikisSayisi,
  }));

  return (
    <div className="flex flex-col space-y-8">
      {/* ── Başlık ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Raporlar</h1>
          <p className="text-sm text-slate-400 mt-1">Tüm KPI verilerini görüntüleyin ve dışa aktarın.</p>
        </div>
        {/* Yıl seçici */}
        <div className="flex gap-2">
          {YILLAR.map(y => (
            <button key={y} onClick={() => setActiveYear(y)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeYear === y
                  ? "bg-[#1F497D] text-white shadow-md shadow-[#1F497D]/30"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-[#1F497D]/40"
              }`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* ── Genel İndir Butonu ── */}
      <div className="bg-gradient-to-r from-[#1F497D] to-[#4472C4] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{activeYear} Yılı — Tam Rapor</h2>
            <p className="text-sm text-white/70 mt-1">Tüm KPI özet verilerini tek dosyada indirin</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => downloadPDF("ozet")} disabled={!!downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors disabled:opacity-50 backdrop-blur-sm">
              <FileText className="h-4 w-4" />
              PDF İndir
            </button>
            <button onClick={() => downloadExcel("ozet")} disabled={!!downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1F497D] text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50">
              <FileSpreadsheet className="h-4 w-4" />
              Excel İndir
            </button>
          </div>
        </div>
        {/* Özet KPI şeridi */}
        {activeYear === "2025" && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20">
            {[
              { label: "Sirkülasyon Ort.", val: HISTORICAL_SUMMARY_2025.sirkulasyonOrt },
              { label: "Devamsızlık Ort.", val: HISTORICAL_SUMMARY_2025.devamsizlikOrt },
              { label: "Fazla Mesai Ort.", val: HISTORICAL_SUMMARY_2025.fazlaMesaiOrt  },
              { label: "Toplam Eğitim",   val: HISTORICAL_SUMMARY_2025.toplamEgitimSaati + " sa" },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-2xl font-black">{val}</div>
                <div className="text-xs text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}
        {activeYear === "2026" && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20">
            {[
              { label: "Aktif Personel",  val: LATEST_PERSONNEL.toplamPersonel },
              { label: "Erkek",           val: LATEST_PERSONNEL.erkek },
              { label: "Kadın",           val: LATEST_PERSONNEL.kadin },
              { label: "Güncel Dönem",    val: LATEST_PERSONNEL.ay },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-2xl font-black">{val}</div>
                <div className="text-xs text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════ 2025 RAPORLARI ══════════ */}
      {activeYear === "2025" && (
        <div className="space-y-4">
          {/* Sirkülasyon */}
          <Section title="Personel Sirkülasyon Oranı" icon={Users} color="#1F497D">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sirChart} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                      <Tooltip content={<ChartTip />} />
                      <Line type="monotone" dataKey="%" stroke="#1F497D" strokeWidth={3} dot={{ r: 4, fill: "#1F497D", strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Pill label="Yıllık Ortalama"  value={HISTORICAL_SUMMARY_2025.sirkulasyonOrt} color="#1F497D" />
                <Pill label="En Yüksek (Tem)"  value="%32.75" color="#EF4444" />
                <Pill label="En Düşük (Şub)"   value="%5.32"  color="#10B981" />
                <DlButtons section="sirkulasyon" />
              </div>
            </div>
          </Section>

          {/* Devamsızlık */}
          <Section title="Devamsızlık Oranı" icon={Activity} color="#4472C4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={devChart} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="%" fill="#4472C4" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Pill label="Yıllık Ortalama" value={HISTORICAL_SUMMARY_2025.devamsizlikOrt} color="#4472C4" />
                <Pill label="En Yüksek (Haz)" value="%21.18" color="#EF4444" />
                <Pill label="En Düşük (Şub)"  value="%1.61"  color="#10B981" />
                <DlButtons section="devamsizlik" />
              </div>
            </div>
          </Section>

          {/* Fazla Mesai */}
          <Section title="Fazla Mesai Oranı" icon={Clock} color="#F59E0B">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FAZLAMESAI_2025.map(r => ({ name: r.ay.substring(0,3), "%": Number((r.oran*100).toFixed(2)) }))} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="%" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Pill label="Yıllık Ortalama" value={HISTORICAL_SUMMARY_2025.fazlaMesaiOrt} color="#F59E0B" />
                <Pill label="En Yüksek (Nis)" value="%6.32" color="#EF4444" />
                <Pill label="En Düşük (Eki)"  value="%1.41" color="#10B981" />
              </div>
            </div>
          </Section>

          {/* İş Kazası */}
          <Section title="İş Kazası Adedi" icon={AlertTriangle} color="#EF4444">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kazaChart} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="Kaza" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Pill label="Yıllık Ortalama"  value={HISTORICAL_SUMMARY_2025.isKazasiOrt} color="#EF4444" />
                <Pill label="Kazasız Ay Sayısı" value="6 ay"  color="#10B981" />
                <Pill label="Toplam Kaza"        value="1.66" color="#EF4444" />
              </div>
            </div>
          </Section>

          {/* Eğitim */}
          <Section title="Eğitim Adam Saat" icon={BookOpen} color="#8B5CF6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={EGITIM_2025.map(r => ({ name: r.donem, "Eğitim Saati": r.donemselEgitimSaati, "Kişi Sayısı": r.kisiSayisi }))} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <Tooltip content={<ChartTip />} />
                      <Legend formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                      <Bar dataKey="Eğitim Saati" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={52} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Pill label="Toplam Eğitim Saati" value={`${HISTORICAL_SUMMARY_2025.toplamEgitimSaati} sa`} color="#8B5CF6" />
                {EGITIM_2025.map(r => (
                  <Pill key={r.donem} label={r.donem} value={`${r.donemselEgitimSaati} sa`} color="#8B5CF6" />
                ))}
                <DlButtons section="egitim" />
              </div>
            </div>
          </Section>

          {/* Görüşme & İşe Alım */}
          <Section title="Görüşme & İşe Alım" icon={Users} color="#10B981" defaultOpen={false}>
            <div className="h-[280px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gorusmeChart} margin={{ top: 5, right: 5, left: -5, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                  <Bar dataKey="Çağrılan"   fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="Görüşülen"  fill="#4472C4" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="İşe Alınan" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <DlButtons section="gorusme" />
          </Section>

          {/* Cinsiyet + Eğitim Durumu */}
          <Section title="Cinsiyet Dağılımı & Eğitim Durumu" icon={BarChart2} color="#F59E0B" defaultOpen={false}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-3">Cinsiyet Dağılımı (2025)</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CINSIYET_2025.map(c => ({ name: c.cinsiyet, value: c.kisiSayisi }))}
                        cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        <Cell fill="#1F497D" />
                        <Cell fill="#4472C4" />
                      </Pie>
                      <Tooltip content={<ChartTip />} />
                      <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex divide-x mt-2">
                  {CINSIYET_2025.map(c => (
                    <div key={c.cinsiyet} className="flex-1 text-center">
                      <div className="text-xl font-black text-[#1F497D]">{c.kisiSayisi}</div>
                      <div className="text-xs text-slate-400">{c.cinsiyet} (%{(c.oran * 100).toFixed(1)})</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-3">Eğitim Durumu (2025)</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={EGITIM_DURUMU_2025.map(r => ({ name: r.tahsil.split(" ")[0], Kişi: r.kisiSayisi }))}
                      layout="vertical" margin={{ top: 0, right: 20, left: 50, bottom: 0 }}>
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="Kişi" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Section>

          {/* Direk / Endirekt */}
          <Section title="Direk / Endirekt Personel Oranı" icon={TrendingUp} color="#1F497D" defaultOpen={false}>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={direkChart} margin={{ top: 5, right: 5, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" domain={[0, 100]} />
                  <Tooltip content={<ChartTip />} />
                  <Legend formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                  <Bar dataKey="Direk"    stackId="a" fill="#1F497D" />
                  <Bar dataKey="Endirekt" stackId="a" fill="#4472C4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      )}

      {/* ══════════ 2026 RAPORLARI ══════════ */}
      {activeYear === "2026" && (
        <div className="space-y-4">
          <Section title="Personel Hareketleri (2026)" icon={Users} color="#1F497D">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personelChart2026} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                      <Tooltip content={<ChartTip />} />
                      <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                      <Bar dataKey="Toplam" fill="#1F497D" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="Giriş"  fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="Çıkış"  fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                {PERSONNEL_DATA.filter(r => r.toplamPersonel > 0).map(r => (
                  <Pill key={r.ay} label={r.ay} value={`${r.toplamPersonel} kişi`} color="#1F497D" />
                ))}
                <DlButtons section="personel2026" />
              </div>
            </div>
          </Section>

          <Section title="Cinsiyet Dağılımı (2026)" icon={Users} color="#4472C4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: "Erkek", value: LATEST_PERSONNEL.erkek }, { name: "Kadın", value: LATEST_PERSONNEL.kadin }]}
                      cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      <Cell fill="#1F497D" />
                      <Cell fill="#4472C4" />
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                    <Legend formatter={v => <span className="text-sm text-slate-600">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-3">
                <Pill label="Toplam Personel" value={`${LATEST_PERSONNEL.toplamPersonel} kişi`} color="#1F497D" />
                <Pill label="Erkek" value={`${LATEST_PERSONNEL.erkek} kişi (%${((LATEST_PERSONNEL.erkek/LATEST_PERSONNEL.toplamPersonel)*100).toFixed(1)})`} color="#1F497D" />
                <Pill label="Kadın" value={`${LATEST_PERSONNEL.kadin} kişi (%${((LATEST_PERSONNEL.kadin/LATEST_PERSONNEL.toplamPersonel)*100).toFixed(1)})`} color="#4472C4" />
                <Pill label="Güncel Dönem" value={`${LATEST_PERSONNEL.ay} 2026`} color="#F59E0B" />
              </div>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
