"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getComparisonData } from "@/app/actions";
import { Loader2, Search } from "lucide-react";

export default function ComparisonsPage() {
  const [year1, setYear1] = useState("2025");
  const [year2, setYear2] = useState("2026");
  const [selectedKpi, setSelectedKpi] = useState("sirkulasyon");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({ y1Avg: 0, y2Avg: 0, diff: 0 });

  async function handleCompare() {
    setLoading(true);
    const data = await getComparisonData(parseInt(year1), parseInt(year2));
    
    // İşleme (Aylık bazda eşleştirme)
    const processed = [];
    const monthNames = ["", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    
    let y1Total = 0;
    let y2Total = 0;
    let y1Count = 0;
    let y2Count = 0;

    for (let m = 1; m <= 12; m++) {
      const mData: any = { name: monthNames[m] };
      
      const r1 = data.find(d => d.year === parseInt(year1) && d.month === m);
      const r2 = data.find(d => d.year === parseInt(year2) && d.month === m);

      // KPI tipine göre değer okuma
      const getValue = (record: any) => {
        if (!record) return 0;
        if (selectedKpi === "sirkulasyon") return record.turnover?.turnoverRate || 0;
        if (selectedKpi === "isKazasi") return record.accident?.totalAccidents || 0;
        if (selectedKpi === "fazlaMesai") return record.overtime ? (record.overtime.shiftA + record.overtime.shiftB + record.overtime.shiftC) : 0;
        if (selectedKpi === "devamsizlik") {
           if (!record.absenteeism) return 0;
           const total = record.absenteeism.paidLeave + record.absenteeism.unpaidLeave + record.absenteeism.sickLeave + record.absenteeism.absent;
           return Number(((total / (22*8*1000)) * 100).toFixed(2));
        }
        return 0;
      };

      mData[year1] = getValue(r1);
      mData[year2] = getValue(r2);

      if (r1) { y1Total += mData[year1]; y1Count++; }
      if (r2) { y2Total += mData[year2]; y2Count++; }

      processed.push(mData);
    }
    
    setChartData(processed);
    
    const y1Avg = y1Count > 0 ? y1Total / y1Count : 0;
    const y2Avg = y2Count > 0 ? y2Total / y2Count : 0;
    const diff = y1Avg > 0 ? ((y2Avg - y1Avg) / y1Avg) * 100 : 0;
    
    setStats({ y1Avg, y2Avg, diff });
    setLoading(false);
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Karşılaştırmalar</h1>
          <p className="text-sm text-slate-500">Yıllara göre KPI verilerini karşılaştırın ve trend analizlerini inceleyin.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label>Karşılaştırılacak KPI</Label>
              <Select value={selectedKpi} onValueChange={setSelectedKpi}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sirkulasyon">Personel Sirkülasyon Oranı</SelectItem>
                  <SelectItem value="devamsizlik">Devamsızlık Oranı</SelectItem>
                  <SelectItem value="fazlaMesai">Fazla Mesai</SelectItem>
                  <SelectItem value="isKazasi">İş Kazası Sayısı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>1. Yıl</Label>
              <Select value={year1} onValueChange={setYear1}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>2. Yıl</Label>
              <Select value={year2} onValueChange={setYear2}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCompare} disabled={loading} className="w-full bg-[#1F497D]">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Karşılaştır
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Aylık Karşılaştırma Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={year1} fill="#94A3B8" name={`${year1} Yılı`} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={year2} fill="#1F497D" name={`${year2} Yılı`} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Sonuç Analizi</CardTitle>
              <CardDescription>Yıllık Ortalama Değerler</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-slate-500">{year1} Ortalaması</p>
                <p className="text-2xl font-bold">{stats.y1Avg.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">{year2} Ortalaması</p>
                <p className="text-2xl font-bold">{stats.y2Avg.toFixed(2)}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500">Değişim Yüzdesi</p>
                <p className={`text-3xl font-bold ${stats.diff > 0 ? (selectedKpi === 'sirkulasyon' || selectedKpi === 'isKazasi' || selectedKpi === 'devamsizlik' ? 'text-red-500' : 'text-green-500') : (selectedKpi === 'sirkulasyon' || selectedKpi === 'isKazasi' || selectedKpi === 'devamsizlik' ? 'text-green-500' : 'text-red-500')}`}>
                  {stats.diff > 0 ? "+" : ""}{stats.diff.toFixed(2)}%
                </p>
              </div>
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                <strong>Yorum: </strong>
                {year1} yılına kıyasla {year2} yılında seçili KPI değerinde {Math.abs(stats.diff).toFixed(1)}% {stats.diff > 0 ? "artış" : "azalış"} gözlemlenmiştir. 
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
